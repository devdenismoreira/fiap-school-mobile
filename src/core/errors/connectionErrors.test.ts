import { NetworkError } from './NetworkError';
import { SessionExpiredError } from './SessionExpiredError';
import { TooManyAttemptsError } from './TooManyAttemptsError';

describe.each([
  ['NetworkError', NetworkError],
  ['TooManyAttemptsError', TooManyAttemptsError],
  ['SessionExpiredError', SessionExpiredError],
])('%s', (name, ErrorClass) => {
  it('é identificável por instanceof e pelo nome', () => {
    const error = new ErrorClass();

    expect(error).toBeInstanceOf(ErrorClass);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(name);
  });
});
