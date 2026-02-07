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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, setError } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [displayNameError, setDisplayNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateDisplayName = (name: string) => {
    if (!name.trim()) {
      setDisplayNameError('Name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setDisplayNameError('Name must be at least 2 characters');
      return false;
    }
    setDisplayNameError('');
    return true;
  };

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

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleRegister = async () => {
    // Clear previous errors
    setError(null);
    setDisplayNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate all inputs
    const isDisplayNameValid = validateDisplayName(displayName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);

    if (!isDisplayNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    try {
      await register(email.trim(), password, displayName.trim());
      // Navigation will be handled by auth state change
      router.replace('/(tabs)');
    } catch (err: any) {
      // Error is already set in the store
      console.error('Registration error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={colors.gradients.secondary}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Sign up to get started with Simplify
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                label="Full Name"
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  if (displayNameError) validateDisplayName(text);
                }}
                onBlur={() => validateDisplayName(displayName)}
                mode="outlined"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                error={!!displayNameError}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={colors.border.main}
                activeOutlineColor={colors.secondary.main}
                left={<TextInput.Icon icon="account" />}
              />
              {displayNameError ? (
                <Text style={styles.errorText}>{displayNameError}</Text>
              ) : null}

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
                activeOutlineColor={colors.secondary.main}
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
                  if (confirmPassword) validateConfirmPassword(confirmPassword, text);
                }}
                onBlur={() => validatePassword(password)}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                error={!!passwordError}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={colors.border.main}
                activeOutlineColor={colors.secondary.main}
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

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) validateConfirmPassword(text, password);
                }}
                onBlur={() => validateConfirmPassword(confirmPassword, password)}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                error={!!confirmPasswordError}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={colors.border.main}
                activeOutlineColor={colors.secondary.main}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}

              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Register Button */}
              <Button
                mode="contained"
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Create Account
              </Button>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  loginLink: {
    fontSize: 14,
    color: colors.secondary.main,
    fontWeight: '600',
  },
});

