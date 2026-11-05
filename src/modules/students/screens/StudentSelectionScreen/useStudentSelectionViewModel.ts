import { useNavigation } from '@react-navigation/native';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';

export const studentSwitchedMessage = (firstName: string) =>
  `Mostrando os dados de ${firstName}.`;

export function useStudentSelectionViewModel() {
  const { state, selectedStudent, selectStudent } = useSession();
  const { showToast } = useToast();
  const navigation = useNavigation();

  const students = state.status === 'signedIn' ? state.guardian.students : [];
  const selectedRm = selectedStudent?.rm ?? null;

  const close = () => navigation.goBack();

  const select = (rm: number) => {
    const student = students.find(item => item.rm === rm);
    if (student && rm !== selectedRm) {
      selectStudent(rm);
      showToast(studentSwitchedMessage(student.firstName));
    }
    close();
  };

  return { students, selectedRm, select, close };
}
