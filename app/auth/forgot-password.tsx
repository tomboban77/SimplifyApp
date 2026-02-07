import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';
import { StatusBar } from 'expo-status-bar';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading, error, setError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleResetPassword = async () => {
    setError(null);
    setSuccess(false);

    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      return;
    }

    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={colors.gradients.accent}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                {success
                  ? 'Check your email for password reset instructions'
                  : "Enter your email address and we'll send you a link to reset your password"}
              </Text>
            </View>

            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  Password reset email sent! Please check your inbox and follow the instructions.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => router.back()}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Back to Login
                </Button>
              </View>
            ) : (
              <View style={styles.form}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  onBlur={() => validateEmail(email)}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  error={!!emailError}
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  outlineColor={colors.border.main}
                  activeOutlineColor={colors.accent.main}
                  left={<TextInput.Icon icon="email" />}
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Reset Button */}
                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Send Reset Link
                </Button>

                {/* Back to Login */}
                <View style={styles.backContainer}>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backLink}>Back to Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: colors.background.paper,
    borderRadius: 24,
    padding: 32,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: colors.background.paper,
  },
  inputContent: {
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.error.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error.border,
  },
  errorText: {
    fontSize: 14,
    color: colors.error.main,
  },
  successContainer: {
    gap: 24,
  },
  successText: {
    fontSize: 16,
    color: colors.success.main,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 4,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backLink: {
    fontSize: 14,
    color: colors.accent.main,
    fontWeight: '600',
  },
});

