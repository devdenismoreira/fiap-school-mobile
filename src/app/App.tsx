import { StatusBar, StyleSheet, View } from 'react-native';

import { AppProviders } from './providers/AppProviders';

// Placeholder da T01: a navegação e o tema entram nas tarefas T02–T05.
export default function App() {
  return (
    <AppProviders>
      <StatusBar barStyle="light-content" />
      <View testID="app-root" style={styles.root} />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
