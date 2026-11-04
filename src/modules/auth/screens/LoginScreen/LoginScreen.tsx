import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  type TextInputInstance,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import logo from '@/assets/images/logo.png';
import { Box, sizes, Text } from '@/core/theme';
import { fadeInFast, fadeOutFast } from '@/shared/animations';
import { PrimaryButton } from '@/shared/components/PrimaryButton';
import { useKeyboardVisible } from '@/shared/hooks/useKeyboardVisible';
import { UnderlineInput } from './components/UnderlineInput';
import { LOGIN_ERROR_MESSAGE, useLoginViewModel } from './useLoginViewModel';

/** Máscara completa `000.000.000-00` tem 14 caracteres. */
const CPF_MASKED_LENGTH = 14;

export function LoginScreen() {
  const viewModel = useLoginViewModel();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const passwordRef = useRef<TextInputInstance>(null);

  useEffect(() => {
    if (viewModel.hasError) {
      AccessibilityInfo.announceForAccessibility(
        LOGIN_ERROR_MESSAGE.replace('\n', ' '),
      );
    }
  }, [viewModel.hasError]);

  return (
    <Box flex={1} backgroundColor="background">
      <KeyboardAvoidingView style={styles.fill} behavior="padding">
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

            {viewModel.hasError ? (
              <Animated.View entering={fadeInFast} exiting={fadeOutFast}>
                <Box marginTop="xl">
                  <Text variant="bodyMedium" color="primary" textAlign="center">
                    {LOGIN_ERROR_MESSAGE}
                  </Text>
                </Box>
              </Animated.View>
            ) : null}
          </Box>
        </ScrollView>

        <PrimaryButton
          testID="login-submit"
          label="FAZER LOGIN"
          onPress={viewModel.submit}
          disabled={!viewModel.canSubmit}
          loading={viewModel.isLoading}
          bottomInset={keyboardVisible ? 0 : insets.bottom}
        />
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
