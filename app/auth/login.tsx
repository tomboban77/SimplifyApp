import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, setError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setError(null);
    setEmailError('');
    setPasswordError('');

    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      await login(email.trim(), password);
      // Navigation will be handled by auth state change
      router.replace('/(tabs)');
    } catch (err: any) {
      // Error is already set in the store
      console.error('Login error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue to your account
              </Text>
            </View>

            {/* Form */}
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
                activeOutlineColor={colors.primary.main}
                left={<TextInput.Icon icon="email" />}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}

              <TextInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) validatePassword(text);
                }}
                onBlur={() => validatePassword(password)}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                error={!!passwordError}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={colors.border.main}
                activeOutlineColor={colors.primary.main}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push('/auth/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Sign In
              </Button>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '500',
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  registerLink: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
  },
});

