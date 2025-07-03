import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, getColor, getShadow } from '@/lib/theme';

export default function TwoFactorScreen() {
  const router = useRouter();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [authenticatorEnabled, setAuthenticatorEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [backupCodesGenerated, setBackupCodesGenerated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 123-4567');
  const [showSetupModal, setShowSetupModal] = useState(false);

  const handleToggleTwoFactor = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'This will add an extra layer of security to your account. You will need to verify your identity with a second factor when logging in.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setTwoFactorEnabled(true);
              setEmailEnabled(true);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Disable Two-Factor Authentication',
        'This will remove the extra security layer from your account. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setTwoFactorEnabled(false);
              setAuthenticatorEnabled(false);
              setSmsEnabled(false);
              setEmailEnabled(false);
            },
          },
        ]
      );
    }
  };

  const handleSetupAuthenticator = () => {
    Alert.alert(
      'Setup Authenticator App',
      'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) to set up TOTP.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // In a real app, this would show QR code setup
            setAuthenticatorEnabled(true);
          },
        },
      ]
    );
  };

  const handleSetupSMS = () => {
    Alert.alert(
      'Setup SMS Authentication',
      'We will send verification codes to your phone number when you log in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Setup',
          onPress: () => {
            setSmsEnabled(true);
          },
        },
      ]
    );
  };

  const handleGenerateBackupCodes = () => {
    Alert.alert(
      'Generate Backup Codes',
      'These codes can be used to access your account if you lose access to your primary 2FA method. Store them safely.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            setBackupCodesGenerated(true);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.0')} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={getColor('neutral.900')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Toggle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleContainer}>
              <Ionicons name="shield-checkmark" size={24} color={getColor('primary.500')} />
              <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggleTwoFactor}
              trackColor={{ false: getColor('neutral.300'), true: getColor('primary.200') }}
              thumbColor={twoFactorEnabled ? getColor('primary.500') : getColor('neutral.0')}
            />
          </View>
          <Text style={styles.sectionDescription}>
            Add an extra layer of security to your account by requiring a second form of verification when signing in.
          </Text>
        </View>

        {twoFactorEnabled && (
          <>
            {/* Authentication Methods */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Authentication Methods</Text>
              
              {/* Authenticator App */}
              <View style={styles.methodCard}>
                <View style={styles.methodHeader}>
                  <View style={styles.methodInfo}>
                    <Ionicons name="phone-portrait" size={24} color={getColor('primary.500')} />
                    <View style={styles.methodText}>
                      <Text style={styles.methodTitle}>Authenticator App</Text>
                      <Text style={styles.methodSubtitle}>
                        {authenticatorEnabled ? 'Enabled' : 'Use Google Authenticator, Authy, or similar apps'}
                      </Text>
                    </View>
                  </View>
                  {authenticatorEnabled ? (
                    <View style={styles.enabledBadge}>
                      <Ionicons name="checkmark" size={16} color={getColor('neutral.0')} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.setupButton}
                      onPress={handleSetupAuthenticator}
                    >
                      <Text style={styles.setupButtonText}>Setup</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {authenticatorEnabled && (
                  <TouchableOpacity style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* SMS */}
              <View style={styles.methodCard}>
                <View style={styles.methodHeader}>
                  <View style={styles.methodInfo}>
                    <Ionicons name="chatbubble" size={24} color={getColor('primary.500')} />
                    <View style={styles.methodText}>
                      <Text style={styles.methodTitle}>SMS</Text>
                      <Text style={styles.methodSubtitle}>
                        {smsEnabled ? `Enabled for ${phoneNumber}` : 'Receive codes via text message'}
                      </Text>
                    </View>
                  </View>
                  {smsEnabled ? (
                    <View style={styles.enabledBadge}>
                      <Ionicons name="checkmark" size={16} color={getColor('neutral.0')} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.setupButton}
                      onPress={handleSetupSMS}
                    >
                      <Text style={styles.setupButtonText}>Setup</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {smsEnabled && (
                  <View style={styles.phoneSection}>
                    <Text style={styles.phoneLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.phoneInput}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="+1 (555) 123-4567"
                      keyboardType="phone-pad"
                    />
                    <TouchableOpacity style={styles.removeButton}>
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Email */}
              <View style={styles.methodCard}>
                <View style={styles.methodHeader}>
                  <View style={styles.methodInfo}>
                    <Ionicons name="mail" size={24} color={getColor('primary.500')} />
                    <View style={styles.methodText}>
                      <Text style={styles.methodTitle}>Email</Text>
                      <Text style={styles.methodSubtitle}>
                        Receive codes via email (backup method)
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={emailEnabled}
                    onValueChange={setEmailEnabled}
                    trackColor={{ false: getColor('neutral.300'), true: getColor('primary.200') }}
                    thumbColor={emailEnabled ? getColor('primary.500') : getColor('neutral.0')}
                  />
                </View>
              </View>
            </View>

            {/* Backup Codes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Backup & Recovery</Text>
              
              <View style={styles.methodCard}>
                <View style={styles.methodHeader}>
                  <View style={styles.methodInfo}>
                    <Ionicons name="key" size={24} color={getColor('warning.500')} />
                    <View style={styles.methodText}>
                      <Text style={styles.methodTitle}>Backup Codes</Text>
                      <Text style={styles.methodSubtitle}>
                        {backupCodesGenerated 
                          ? 'Generated - store them safely' 
                          : 'One-time codes for account recovery'
                        }
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.setupButton, backupCodesGenerated && styles.regenerateButton]}
                    onPress={handleGenerateBackupCodes}
                  >
                    <Text style={styles.setupButtonText}>
                      {backupCodesGenerated ? 'Regenerate' : 'Generate'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {backupCodesGenerated && (
                  <View style={styles.backupCodesInfo}>
                    <Ionicons name="warning" size={16} color={getColor('warning.500')} />
                    <Text style={styles.backupCodesText}>
                      You have 8 unused backup codes remaining
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Security Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security Tips</Text>
              <View style={styles.tipsCard}>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={16} color={getColor('success.500')} />
                  <Text style={styles.tipText}>Use an authenticator app for the most secure option</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={16} color={getColor('success.500')} />
                  <Text style={styles.tipText}>Keep your backup codes in a safe place</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={16} color={getColor('success.500')} />
                  <Text style={styles.tipText}>Don't share your authentication codes with anyone</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={16} color={getColor('success.500')} />
                  <Text style={styles.tipText}>Keep your authenticator app updated</Text>
                </View>
              </View>
            </View>
          </>
        )}
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
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: getColor('neutral.600'),
    lineHeight: 22,
  },
  methodCard: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    ...getShadow('sm'),
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodText: {
    marginLeft: 12,
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 14,
    color: getColor('neutral.500'),
  },
  setupButton: {
    backgroundColor: getColor('primary.500'),
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  setupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.0'),
  },
  regenerateButton: {
    backgroundColor: getColor('warning.500'),
  },
  enabledBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: getColor('success.500'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    fontSize: 14,
    color: getColor('error.500'),
    fontWeight: '500',
  },
  phoneSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: getColor('neutral.200'),
  },
  phoneLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: getColor('neutral.900'),
    marginBottom: 8,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: getColor('neutral.300'),
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: getColor('neutral.900'),
    backgroundColor: getColor('neutral.0'),
    marginBottom: 12,
  },
  backupCodesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: getColor('neutral.200'),
  },
  backupCodesText: {
    fontSize: 14,
    color: getColor('warning.600'),
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    ...getShadow('sm'),
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: getColor('neutral.600'),
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
