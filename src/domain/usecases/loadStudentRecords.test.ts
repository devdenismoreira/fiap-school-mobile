import type { GuardianRepository } from '@/domain/repositories/GuardianRepository';
import { createLoadStudentRecords } from './loadStudentRecords';

const schedule = [{ date: '2025-03-17', classes: [] }];
const reportCards = [{ year: '2025', className: '7EF', terms: [] }];

describe('loadStudentRecords', () => {
  it('busca agenda e boletins do aluno em paralelo, só pelo RM', async () => {
    const guardians: GuardianRepository = {
      findByCredentials: jest.fn(),
      findById: jest.fn(),
      findStudentSchedule: jest.fn().mockResolvedValue(schedule),
      findStudentReportCards: jest.fn().mockResolvedValue(reportCards),
    };

    await expect(createLoadStudentRecords(guardians)(100)).resolves.toEqual({
      schedule,
      reportCards,
    });
    expect(guardians.findStudentSchedule).toHaveBeenCalledWith(100);
    expect(guardians.findStudentReportCards).toHaveBeenCalledWith(100);
  });

  it('se uma das buscas falhar, rejeita (a tela mostra o erro e permite tentar de novo)', async () => {
    const guardians: GuardianRepository = {
      findByCredentials: jest.fn(),
      findById: jest.fn(),
      findStudentSchedule: jest.fn().mockResolvedValue(schedule),
      findStudentReportCards: jest.fn().mockRejectedValue(new Error('falha')),
    };

    await expect(createLoadStudentRecords(guardians)(100)).rejects.toThrow(
      'falha',
    );
  });
});
