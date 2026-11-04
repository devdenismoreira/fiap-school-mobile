import { useNavigation } from '@react-navigation/native';

import { useSession } from '@/app/providers/SessionProvider';

export function useStudentSelectionViewModel() {
  const { state, selectedStudent, selectStudent } = useSession();
  const navigation = useNavigation();

  const students = state.status === 'signedIn' ? state.guardian.students : [];
  const selectedRm = selectedStudent?.rm ?? null;

  const close = () => navigation.goBack();

  /** Troca o aluno (se for outro) e volta para a aba de origem. */
  const select = (rm: number) => {
    if (rm !== selectedRm) {
      // A troca no contexto é imediata; a gravação no storage segue em paralelo.
      selectStudent(rm);
    }
    close();
  };

  return { students, selectedRm, select, close };
}
