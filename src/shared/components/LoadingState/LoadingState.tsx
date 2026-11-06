import { ActivityIndicator } from 'react-native';

import { Box, theme } from '@/core/theme';

export function LoadingState() {
  return (
    <Box
      testID="records-loading"
      alignItems="center"
      marginTop="huge"
      accessible
      accessibilityLabel="Carregando"
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </Box>
  );
}
