import { useNavigation } from '@react-navigation/native';
import { Image, Pressable, StyleSheet } from 'react-native';

import { useSession } from '@/app/providers/SessionProvider';
import logo from '@/assets/images/logo.png';
import { Box, motion, sizes, Text, theme } from '@/core/theme';
import type { RootStackNavigation } from '@/navigation/types';
import { Icon } from '@/shared/components/Icon';

const ACTION_HIT_SLOP = { top: 15, bottom: 15, left: 8, right: 8 };

const upper = (text: string) => text.toLocaleUpperCase('pt-BR');

export function AppHeader() {
  const { state, selectedStudent, signOut } = useSession();
  const navigation = useNavigation<RootStackNavigation>();

  if (state.status !== 'signedIn') {
    return null;
  }

  const canChangeProfile = state.guardian.students.length > 1;

  return (
    <Box>
      <Box
        height={sizes.actionBarHeight}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="m"
      >
        <Image
          source={logo}
          resizeMode="cover"
          style={styles.logo}
          accessibilityRole="image"
          accessibilityLabel="FIAP School"
        />
        <Box flexDirection="row" alignItems="center">
          {canChangeProfile ? (
            <Pressable
              onPress={() => navigation.navigate('StudentSelection')}
              accessibilityRole="button"
              hitSlop={ACTION_HIT_SLOP}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text variant="caption">TROCAR PERFIL</Text>
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
              <Text variant="caption">SAIR</Text>
              <Icon name="logout" style={styles.logoutIcon} />
            </Box>
          </Pressable>
        </Box>
      </Box>

      <Text variant="greeting" textAlign="center" marginTop="m">
        Olá,{' '}
        <Text variant="greetingBold">{upper(state.guardian.firstName)}</Text>
      </Text>

      {selectedStudent ? (
        <Box alignItems="center" style={styles.student}>
          <Text variant="bodyMedium" textAlign="center">
            {upper(selectedStudent.firstName)}
          </Text>
          <Text variant="body" textAlign="center" marginTop="xs">
            {`${selectedStudent.className} - RM ${selectedStudent.rm} - ${selectedStudent.shift}`}
          </Text>
        </Box>
      ) : null}
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
  student: {
    marginTop: sizes.appHeader.greetingToStudent,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
