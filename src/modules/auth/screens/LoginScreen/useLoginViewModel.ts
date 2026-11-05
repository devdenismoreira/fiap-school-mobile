import { useRef, useState } from 'react';

import { useSession } from '@/app/providers/SessionProvider';
import { CPF_LENGTH, formatCpf, normalizeCpf } from '@/core/utils/cpf';

export const LOGIN_ERROR_MESSAGE =
  'Usuário ou senha inválida.\nPode tentar novamente?';

type Status = 'idle' | 'loading' | 'error';

export function useLoginViewModel() {
  const { signIn } = useSession();
  const [cpfDigits, setCpfDigits] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const submitting = useRef(false);

  const isLoading = status === 'loading';
  const canSubmit =
    cpfDigits.length === CPF_LENGTH && password.length > 0 && !isLoading;

  const clearError = () =>
    setStatus(current => (current === 'error' ? 'idle' : current));

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
    } catch {
      setStatus('error');
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
    hasError: status === 'error',
    canSubmit,
    changeCpf,
    changePassword,
    submit,
  };
}
