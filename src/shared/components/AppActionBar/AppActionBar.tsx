import { useNavigation } from '@react-navigation/native';
import { Image, Pressable, StyleSheet } from 'react-native';

import { useSession } from '@/app/providers/SessionProvider';
import logo from '@/assets/images/logo.png';
import { Box, motion, sizes, Text, theme } from '@/core/theme';
import type { RootStackNavigation } from '@/navigation/types';
import { Icon } from '@/shared/components/Icon';

const ACTION_HIT_SLOP = { top: 15, bottom: 15, left: 8, right: 8 };

export function AppActionBar() {
  const { state, signOut } = useSession();
  const navigation = useNavigation<RootStackNavigation>();

  if (state.status !== 'signedIn') {
    return null;
  }

  const canChangeProfile = state.guardian.students.length > 1;

  return (
    <Box
      height={sizes.actionBarHeight}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="m"
      backgroundColor="background"
    >
      <Image
        source={logo}
        resizeMode="cover"
        style={styles.logo}
        accessible
        accessibilityRole="image"
        accessibilityLabel="FIAP School"
      />
      <Box flexDirection="row" alignItems="center" flexShrink={0}>
        {canChangeProfile ? (
          <Pressable
            onPress={() => navigation.navigate('StudentSelection')}
            accessibilityRole="button"
            hitSlop={ACTION_HIT_SLOP}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text variant="caption" numberOfLines={1}>
              TROCAR PERFIL
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={signOut}
          accessibilityRole="button"
          accessibilityLabel="SAIR"
          hitSlop={ACTION_HIT_SLOP}
          style={({ pressed }) => [
            canChangeProfile && styles.actionGap,
            pressed && styles.pressed,
          ]}
        >
          <Box flexDirection="row" alignItems="center">
            <Text variant="caption" numberOfLines={1}>
              SAIR
            </Text>
            <Icon name="logout" style={styles.logoutIcon} />
          </Box>
        </Pressable>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: sizes.logoHeader.width,
    height: sizes.logoHeader.height,
  },
  actionGap: {
    marginLeft: theme.spacing.l,
  },
  logoutIcon: {
    marginLeft: theme.spacing.xxs,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
