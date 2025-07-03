import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme, getColor, getShadow } from '@/lib/theme';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(passwords.new);

  const handleChangePassword = async () => {
    if (!passwords.current) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!passwordValidation.isValid) {
      Alert.alert('Error', 'Please ensure your new password meets all requirements');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    placeholder: string,
    key: 'current' | 'new' | 'confirm',
    showRequirements = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={(text) => setPasswords(prev => ({ ...prev, [key]: text }))}
          placeholder={placeholder}
          secureTextEntry={!showPasswords[key]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }))}
        >
          <Ionicons
            name={showPasswords[key] ? 'eye-off' : 'eye'}
            size={20}
            color={getColor('neutral.500')}
          />
        </TouchableOpacity>
      </View>
      
      {showRequirements && passwords.new.length > 0 && (
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          {[
            { key: 'minLength', text: 'At least 8 characters' },
            { key: 'hasUpperCase', text: 'One uppercase letter' },
            { key: 'hasLowerCase', text: 'One lowercase letter' },
            { key: 'hasNumbers', text: 'One number' },
            { key: 'hasSpecialChar', text: 'One special character' },
          ].map(req => (
            <View key={req.key} style={styles.requirement}>
              <Ionicons
                name={passwordValidation[req.key as keyof typeof passwordValidation] ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={passwordValidation[req.key as keyof typeof passwordValidation] ? getColor('success.500') : getColor('error.500')}
              />
              <Text style={[
                styles.requirementText,
                { color: passwordValidation[req.key as keyof typeof passwordValidation] ? getColor('success.700') : getColor('neutral.600') }
              ]}>
                {req.text}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.50')} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={getColor('neutral.900')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Your Password</Text>
          <Text style={styles.sectionDescription}>
            Choose a strong password to keep your account secure
          </Text>

          {renderPasswordInput(
            'Current Password',
            passwords.current,
            'Enter your current password',
            'current'
          )}

          {renderPasswordInput(
            'New Password',
            passwords.new,
            'Enter your new password',
            'new',
            true
          )}

          {renderPasswordInput(
            'Confirm New Password',
            passwords.confirm,
            'Confirm your new password',
            'confirm'
          )}

          <TouchableOpacity
            style={[
              styles.changeButton,
              (!passwordValidation.isValid || passwords.new !== passwords.confirm || !passwords.current || loading) && styles.changeButtonDisabled
            ]}
            onPress={handleChangePassword}
            disabled={!passwordValidation.isValid || passwords.new !== passwords.confirm || !passwords.current || loading}
          >
            <Text style={styles.changeButtonText}>
              {loading ? 'Changing Password...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="shield-checkmark" size={24} color={getColor('info.500')} />
            <Text style={styles.tipsTitle}>Security Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Use a unique password for your account</Text>
            <Text style={styles.tipItem}>• Consider using a password manager</Text>
            <Text style={styles.tipItem}>• Change your password regularly</Text>
            <Text style={styles.tipItem}>• Never share your password with others</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('neutral.50'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: getColor('neutral.0'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('neutral.200'),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: getColor('neutral.100'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: getColor('neutral.900'),
    textAlign: 'center',
    marginLeft: -40,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...getShadow('sm'),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: getColor('neutral.600'),
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.800'),
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('neutral.50'),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: getColor('neutral.200'),
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: getColor('neutral.900'),
  },
  eyeButton: {
    padding: 16,
  },
  requirementsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: getColor('neutral.100'),
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: getColor('neutral.700'),
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
  },
  changeButton: {
    backgroundColor: getColor('primary.500'),
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    ...getShadow('base'),
  },
  changeButtonDisabled: {
    backgroundColor: getColor('neutral.300'),
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.0'),
  },
  tipsCard: {
    backgroundColor: getColor('info.50'),
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: getColor('info.200'),
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('info.800'),
    marginLeft: 8,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: getColor('info.700'),
    lineHeight: 20,
  },
});
