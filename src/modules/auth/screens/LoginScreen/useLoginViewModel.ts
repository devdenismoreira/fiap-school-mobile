import { useEffect, useRef, useState } from 'react';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { InvalidCredentialsError } from '@/core/errors/InvalidCredentialsError';
import { TooManyAttemptsError } from '@/core/errors/TooManyAttemptsError';
import { motion } from '@/core/theme';
import { CPF_LENGTH, formatCpf, normalizeCpf } from '@/core/utils/cpf';

export const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou.\nEntre novamente.';

export type LoginErrorKind = 'credentials' | 'connection' | 'tooManyAttempts';

export const LOGIN_ERROR_MESSAGES: Record<LoginErrorKind, string> = {
  credentials: 'Usuário ou senha inválida.\nPode tentar novamente?',
  connection:
    'Não foi possível conectar.\nVerifique sua internet e tente novamente.',
  tooManyAttempts: 'Muitas tentativas.\nTente novamente mais tarde.',
};

export const LOGIN_ERROR_MESSAGE = LOGIN_ERROR_MESSAGES.credentials;

type Status = 'idle' | 'loading' | LoginErrorKind;

const isErrorStatus = (status: Status): status is LoginErrorKind =>
  status !== 'idle' && status !== 'loading';

function toErrorKind(error: unknown): LoginErrorKind {
  if (error instanceof InvalidCredentialsError) {
    return 'credentials';
  }
  if (error instanceof TooManyAttemptsError) {
    return 'tooManyAttempts';
  }
  return 'connection';
}

export function useLoginViewModel() {
  const { signIn, state } = useSession();
  const { showToast } = useToast();
  const sessionExpired =
    state.status === 'signedOut' && state.sessionExpired === true;
  const [cpfDigits, setCpfDigits] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const submitting = useRef(false);

  useEffect(() => {
    if (sessionExpired) {
      showToast(SESSION_EXPIRED_MESSAGE, {
        duration: motion.toastDurationLong,
      });
    }
  }, [sessionExpired, showToast]);

  const isLoading = status === 'loading';
  const canSubmit =
    cpfDigits.length === CPF_LENGTH && password.length > 0 && !isLoading;

  const clearError = () =>
    setStatus(current => (isErrorStatus(current) ? 'idle' : current));

  const changeCpf = (text: string) => {
    setCpfDigits(normalizeCpf(text));
    clearError();
  };

  const changePassword = (text: string) => {
    setPassword(text);
    clearError();
  };

  const authenticate = async () => {
    submitting.current = true;
    setStatus('loading');
    try {
      await signIn(cpfDigits, password);
    } catch (error) {
      setStatus(toErrorKind(error));
    } finally {
      submitting.current = false;
    }
  };

  const submit = () => {
    if (!canSubmit || submitting.current) {
      return;
    }
    authenticate();
  };

  return {
    cpf: formatCpf(cpfDigits),
    password,
    isLoading,
    hasError: isErrorStatus(status),
    errorMessage: isErrorStatus(status) ? LOGIN_ERROR_MESSAGES[status] : null,
    canSubmit,
    changeCpf,
    changePassword,
    submit,
  };
}
