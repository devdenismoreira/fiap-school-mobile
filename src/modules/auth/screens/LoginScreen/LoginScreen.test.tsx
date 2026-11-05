import { act, fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { InvalidCredentialsError } from '@/core/errors/InvalidCredentialsError';
import { NetworkError } from '@/core/errors/NetworkError';
import { TooManyAttemptsError } from '@/core/errors/TooManyAttemptsError';
import { theme } from '@/core/theme';
import { makeGuardian } from '@/test-utils/fixtures';
import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import { LoginScreen } from './LoginScreen';

const VALID_CPF = '52998224725';
const MASKED_CPF = '529.982.247-25';

const cpfInput = () => screen.getByLabelText('CPF');
const passwordInput = () => screen.getByLabelText('SENHA');
const submitButton = () => screen.getByRole('button', { name: 'FAZER LOGIN' });
const underline = (field: 'cpf' | 'password') =>
  screen.getByTestId(`login-${field}-underline`);

async function fillCredentials(cpf = VALID_CPF, password = 'segredo') {
  await fireEvent.changeText(cpfInput(), cpf);
  await fireEvent.changeText(passwordInput(), password);
}

describe('LoginScreen', () => {
  it('estado inicial: campos vazios, sublinhados cinza e botão desabilitado', async () => {
    await renderWithSession(<LoginScreen />);

    expect(screen.getByText('CPF')).toBeOnTheScreen();
    expect(screen.getByText('SENHA')).toBeOnTheScreen();
    expect(underline('cpf')).toHaveStyle({
      backgroundColor: theme.colors.inputLine,
    });
    expect(underline('password')).toHaveStyle({
      backgroundColor: theme.colors.inputLine,
    });
    expect(submitButton()).toBeDisabled();
  });

  it.each([
    ['digitado', VALID_CPF],
    ['colado com máscara', MASKED_CPF],
    ['colado com espaços', '529 982 247 25'],
  ])('mostra o CPF %s com a máscara do Figma', async (_, typed) => {
    await renderWithSession(<LoginScreen />);

    await fireEvent.changeText(cpfInput(), typed);

    expect(cpfInput()).toHaveDisplayValue(MASKED_CPF);
    expect(underline('cpf')).toHaveStyle({
      backgroundColor: theme.colors.inputLineFilled,
    });
    expect(underline('password')).toHaveStyle({
      backgroundColor: theme.colors.inputLine,
    });
    expect(submitButton()).toBeDisabled();
  });

  it('habilita o botão só com CPF completo e senha preenchida', async () => {
    await renderWithSession(<LoginScreen />);

    await fillCredentials('5299822472', 'segredo');
    expect(submitButton()).toBeDisabled();

    await fireEvent.changeText(cpfInput(), VALID_CPF);
    expect(submitButton()).toBeEnabled();
  });

  it('envia o CPF normalizado e a senha', async () => {
    const dependencies = makeSessionDependencies();
    await renderWithSession(<LoginScreen />, dependencies);

    await fillCredentials(MASKED_CPF, 'segredo');
    await fireEvent.press(submitButton());

    expect(dependencies.authenticateGuardian).toHaveBeenCalledWith(
      VALID_CPF,
      'segredo',
    );
  });

  it('mostra a mensagem de erro do Figma, anuncia e limpa ao editar', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const dependencies = makeSessionDependencies({
      authenticateGuardian: jest
        .fn()
        .mockRejectedValue(new InvalidCredentialsError()),
    });
    await renderWithSession(<LoginScreen />, dependencies);

    await fillCredentials();
    await fireEvent.press(submitButton());

    expect(
      await screen.findByText(
        'Usuário ou senha inválida.\nPode tentar novamente?',
      ),
    ).toBeOnTheScreen();
    expect(announce).toHaveBeenCalledWith(
      'Usuário ou senha inválida. Pode tentar novamente?',
    );
    expect(submitButton()).toBeEnabled();

    await fireEvent.changeText(passwordInput(), 'outra');
    expect(screen.queryByText(/Usuário ou senha inválida/)).toBeNull();
  });

  it.each([
    [
      'sem conexão',
      new NetworkError(),
      'Não foi possível conectar.\nVerifique sua internet e tente novamente.',
    ],
    [
      'muitas tentativas',
      new TooManyAttemptsError(),
      'Muitas tentativas.\nTente novamente mais tarde.',
    ],
  ])(
    '%s: mostra e anuncia a mensagem própria',
    async (_label, error, message) => {
      const announce = jest.spyOn(
        AccessibilityInfo,
        'announceForAccessibility',
      );
      await renderWithSession(
        <LoginScreen />,
        makeSessionDependencies({
          authenticateGuardian: jest.fn().mockRejectedValue(error),
        }),
      );

      await fillCredentials();
      await fireEvent.press(submitButton());

      expect(await screen.findByText(message)).toBeOnTheScreen();
      expect(announce).toHaveBeenCalledWith(message.replace('\n', ' '));
      expect(screen.queryByText(/Usuário ou senha inválida/)).toBeNull();
      expect(submitButton()).toBeEnabled();
    },
  );

  it('carregando: botão ocupado e vazio, campos bloqueados e sem envio duplo', async () => {
    let finish: () => void = () => undefined;
    const authenticateGuardian = jest.fn(
      () =>
        new Promise<ReturnType<typeof makeGuardian>>(resolve => {
          finish = () => resolve(makeGuardian());
        }),
    );
    await renderWithSession(
      <LoginScreen />,
      makeSessionDependencies({ authenticateGuardian }),
    );

    await fillCredentials();
    await fireEvent.press(submitButton());

    expect(submitButton()).toBeBusy();
    expect(screen.queryByText('FAZER LOGIN')).toBeNull();
    expect(cpfInput()).toHaveProp('editable', false);
    expect(passwordInput()).toHaveProp('editable', false);

    await fireEvent.press(submitButton());
    expect(authenticateGuardian).toHaveBeenCalledTimes(1);

    await act(async () => finish());
  });

  it('a senha é mascarada e usa preenchimento de senha', async () => {
    await renderWithSession(<LoginScreen />);

    expect(passwordInput()).toHaveProp('secureTextEntry', true);
    expect(passwordInput()).toHaveProp('textContentType', 'password');
    expect(cpfInput()).toHaveProp('keyboardType', 'number-pad');
  });

  it('sessão salva recusada pela API: avisa com toast que a sessão expirou', async () => {
    await renderWithSession(
      <LoginScreen />,
      makeSessionDependencies({
        sessionRepository: {
          load: jest
            .fn()
            .mockResolvedValue({ guardianId: 1, selectedStudentRm: 100 }),
          save: jest.fn().mockResolvedValue(undefined),
          clear: jest.fn().mockResolvedValue(undefined),
        },
      }),
    );

    expect(
      await screen.findByText('Entre novamente para continuar.'),
    ).toBeOnTheScreen();
  });

  it('sem sessão salva, o Login abre sem aviso', async () => {
    await renderWithSession(<LoginScreen />);
    await screen.findByText('CPF');

    expect(screen.queryByText(/Sessão expirada/)).toBeNull();
  });
});
