import { screen } from '@testing-library/react-native';

import { makeGuardian } from '@/test-utils/fixtures';
import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import {
  NO_STUDENTS_DESCRIPTION,
  NO_STUDENTS_TITLE,
  NoStudentsScreen,
} from './NoStudentsScreen';

describe('NoStudentsScreen', () => {
  it('cumprimenta o responsável e explica, de forma objetiva, que não há alunos vinculados', async () => {
    await renderWithSession(
      <NoStudentsScreen />,
      makeSessionDependencies({
        restoreSession: jest.fn().mockResolvedValue({
          guardian: makeGuardian({ students: [] }),
          selectedStudentRm: null,
        }),
      }),
    );

    expect(await screen.findByText('Olá, ANA')).toBeOnTheScreen();
    expect(screen.getByText(NO_STUDENTS_TITLE)).toBeOnTheScreen();
    expect(screen.getByText(NO_STUDENTS_DESCRIPTION)).toBeOnTheScreen();
  });
});
