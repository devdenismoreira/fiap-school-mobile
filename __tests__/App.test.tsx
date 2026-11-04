import { render, screen } from '@testing-library/react-native';

import App from '../App';

test('renderiza o app dentro dos providers', async () => {
  await render(<App />);

  expect(screen.getByTestId('app-root')).toBeOnTheScreen();
});
