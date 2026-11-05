import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type TextInputInstance,
} from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import logo from '@/assets/images/logo.png';
import { useToastBottomInset } from '@/app/providers/ToastProvider';
import { Box, sizes, Text, theme } from '@/core/theme';
import { fadeInFast, fadeOutFast } from '@/shared/animations';
import { PrimaryButton } from '@/shared/components/PrimaryButton';
import { useKeyboardVisible } from '@/shared/hooks/useKeyboardVisible';
import { UnderlineInput } from './components/UnderlineInput';
import { useLoginViewModel } from './useLoginViewModel';

const CPF_MASKED_LENGTH = 14;

export function LoginScreen() {
  const viewModel = useLoginViewModel();
  const insets = useSafeAreaInsets();
  useToastBottomInset(sizes.primaryButtonHeight);
  const keyboardVisible = useKeyboardVisible();
  const keyboard = useAnimatedKeyboard();
  const isIos = Platform.OS === 'ios';
  const lift = useAnimatedStyle(() => ({
    paddingBottom: isIos ? keyboard.height.get() : 0,
  }));
  const buttonInset = useAnimatedStyle(() => ({
    paddingBottom: isIos
      ? Math.max(insets.bottom - keyboard.height.get(), 0)
      : keyboardVisible
      ? 0
      : insets.bottom,
  }));
  const passwordRef = useRef<TextInputInstance>(null);

  useEffect(() => {
    if (viewModel.errorMessage) {
      AccessibilityInfo.announceForAccessibility(
        viewModel.errorMessage.replace('\n', ' '),
      );
    }
  }, [viewModel.errorMessage]);

  return (
    <Box flex={1} backgroundColor="background">
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={isIos ? undefined : 'padding'}
        enabled={!isIos}
      >
        <Animated.View style={[styles.fill, lift]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Box
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

              <Box width="100%" marginTop="giant">
                <UnderlineInput
                  testID="login-cpf"
                  label="CPF"
                  value={viewModel.cpf}
                  onChangeText={viewModel.changeCpf}
                  editable={!viewModel.isLoading}
                  keyboardType="number-pad"
                  textContentType="username"
                  autoComplete="username"
                  maxLength={CPF_MASKED_LENGTH}
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </Box>

              <Box width="100%" marginTop="xxl">
                <UnderlineInput
                  testID="login-password"
                  inputRef={passwordRef}
                  label="SENHA"
                  value={viewModel.password}
                  onChangeText={viewModel.changePassword}
                  editable={!viewModel.isLoading}
                  secureTextEntry
                  textContentType="password"
                  autoComplete="current-password"
                  returnKeyType="done"
                  onSubmitEditing={viewModel.submit}
                />
              </Box>

              {viewModel.errorMessage ? (
                <Animated.View entering={fadeInFast} exiting={fadeOutFast}>
                  <Box marginTop="xl">
                    <Text
                      variant="bodyMedium"
                      color="primary"
                      textAlign="center"
                    >
                      {viewModel.errorMessage}
                    </Text>
                  </Box>
                </Animated.View>
              ) : null}
            </Box>
          </ScrollView>

          <Animated.View
            style={[{ backgroundColor: theme.colors.primary }, buttonInset]}
          >
            <PrimaryButton
              testID="login-submit"
              label="FAZER LOGIN"
              onPress={viewModel.submit}
              disabled={!viewModel.canSubmit}
              loading={viewModel.isLoading}
            />
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Box>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logo: {
    width: sizes.logoLogin.width,
    height: sizes.logoLogin.height,
  },
});
