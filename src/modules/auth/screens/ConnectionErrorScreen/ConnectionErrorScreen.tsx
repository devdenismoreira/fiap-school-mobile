import { useEffect } from 'react';
import { AccessibilityInfo, Image, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/app/providers/SessionProvider';
import logo from '@/assets/images/logo.png';
import { Box, sizes, Text } from '@/core/theme';
import { fadeInSmooth } from '@/shared/animations';
import { PrimaryButton } from '@/shared/components/PrimaryButton';

export const CONNECTION_ERROR_MESSAGE =
  'Não foi possível conectar.\nVerifique sua internet.';

export function ConnectionErrorScreen() {
  const { retryRestore } = useSession();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      CONNECTION_ERROR_MESSAGE.replace('\n', ' '),
    );
  }, []);

  return (
    <Box flex={1} backgroundColor="background">
      <Animated.View style={styles.fill} entering={fadeInSmooth}>
        <Box
          flex={1}
          alignItems="center"
          paddingHorizontal="xxxl"
          style={{ paddingTop: insets.top + sizes.loginLogoTop }}
        >
          <Image
            source={logo}
            resizeMode="cover"
            style={styles.logo}
            accessible
            accessibilityRole="image"
            accessibilityLabel="FIAP School"
          />
          <Box marginTop="giant">
            <Text variant="bodyMedium" color="primary" textAlign="center">
              {CONNECTION_ERROR_MESSAGE}
            </Text>
          </Box>
        </Box>
      </Animated.View>

      <PrimaryButton
        testID="connection-retry"
        label="TENTAR NOVAMENTE"
        onPress={retryRestore}
        bottomInset={insets.bottom}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  logo: {
    width: sizes.logoLogin.width,
    height: sizes.logoLogin.height,
  },
});
