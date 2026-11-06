import { API_URL } from './apiConfig';

describe('API_URL', () => {
  it('aponta para a API de produção, sempre em https e sem barra final', () => {
    expect(API_URL).toMatch(/^https:\/\/[^/\s]+$/);
  });
});
