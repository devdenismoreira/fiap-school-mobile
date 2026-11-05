import { useNavigation } from '@react-navigation/native';

import { useSession } from '@/app/providers/SessionProvider';

export function useStudentSelectionViewModel() {
  const { state, selectedStudent, selectStudent } = useSession();
  const navigation = useNavigation();

  const students = state.status === 'signedIn' ? state.guardian.students : [];
  const selectedRm = selectedStudent?.rm ?? null;

  const close = () => navigation.goBack();

  const select = (rm: number) => {
    if (rm !== selectedRm) {
      selectStudent(rm);
    }
    close();
  };

  return { students, selectedRm, select, close };
}
