import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme, getColor, getShadow } from '@/lib/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    bookingReminders: true,
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    showLastSeen: false,
    allowMessages: true,
  });

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          icon: 'person-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/edit'),
        },
        {
          id: 'verification',
          title: 'Identity Verification',
          subtitle: 'Verified',
          icon: 'shield-checkmark-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/KYC'),
          rightElement: (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          ),
        },
        {
          id: 'payment',
          title: 'Payment Methods',
          subtitle: 'Manage cards and payouts',
          icon: 'card-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/payment-methods'),
        },
        {
          id: 'addresses',
          title: 'Addresses',
          subtitle: 'Manage shipping addresses',
          icon: 'location-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/addresses'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          title: 'Push Notifications',
          subtitle: 'Get notified about bookings and messages',
          icon: 'notifications-outline',
          type: 'toggle',
          value: notifications.pushNotifications,
          onToggle: (value: boolean) => setNotifications(prev => ({ ...prev, pushNotifications: value })),
        },
        {
          id: 'email',
          title: 'Email Notifications',
          subtitle: 'Receive emails about your account',
          icon: 'mail-outline',
          type: 'toggle',
          value: notifications.emailNotifications,
          onToggle: (value: boolean) => setNotifications(prev => ({ ...prev, emailNotifications: value })),
        },
        {
          id: 'sms',
          title: 'SMS Notifications',
          subtitle: 'Text messages for urgent updates',
          icon: 'chatbubble-outline',
          type: 'toggle',
          value: notifications.smsNotifications,
          onToggle: (value: boolean) => setNotifications(prev => ({ ...prev, smsNotifications: value })),
        },
        {
          id: 'marketing',
          title: 'Marketing Emails',
          subtitle: 'Promotions and new features',
          icon: 'megaphone-outline',
          type: 'toggle',
          value: notifications.marketingEmails,
          onToggle: (value: boolean) => setNotifications(prev => ({ ...prev, marketingEmails: value })),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'visibility',
          title: 'Profile Visibility',
          subtitle: 'Make your profile discoverable',
          icon: 'eye-outline',
          type: 'toggle',
          value: privacy.profileVisibility,
          onToggle: (value: boolean) => setPrivacy(prev => ({ ...prev, profileVisibility: value })),
        },
        {
          id: 'lastSeen',
          title: 'Show Last Seen',
          subtitle: 'Let others see when you were active',
          icon: 'time-outline',
          type: 'toggle',
          value: privacy.showLastSeen,
          onToggle: (value: boolean) => setPrivacy(prev => ({ ...prev, showLastSeen: value })),
        },
        {
          id: 'messages',
          title: 'Allow Messages',
          subtitle: 'Receive messages from other users',
          icon: 'chatbubbles-outline',
          type: 'toggle',
          value: privacy.allowMessages,
          onToggle: (value: boolean) => setPrivacy(prev => ({ ...prev, allowMessages: value })),
        },
        {
          id: 'password',
          title: 'Change Password',
          subtitle: 'Update your account password',
          icon: 'lock-closed-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/change-password'),
        },
        {
          id: 'twoFactor',
          title: 'Two-Factor Authentication',
          subtitle: 'Add extra security to your account',
          icon: 'shield-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/two-factor'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'Get answers to common questions',
          icon: 'help-circle-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/help'),
        },
        {
          id: 'contact',
          title: 'Contact Us',
          subtitle: 'Get in touch with our support team',
          icon: 'headset-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/contact-us'),
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          icon: 'chatbubble-ellipses-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/send-feedback'),
        },
        {
          id: 'browse-users',
          title: 'Browse Users',
          subtitle: 'Discover community members',
          icon: 'people-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/user-demo'),
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'terms',
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          icon: 'document-text-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/terms-of-service'),
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'How we handle your data',
          icon: 'shield-checkmark-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/privacy-policy'),
        },
        {
          id: 'licenses',
          title: 'Open Source Licenses',
          subtitle: 'Third-party software licenses',
          icon: 'code-outline',
          type: 'navigation',
          onPress: () => router.push('/profile/licenses'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    if (item.type === 'toggle') {
      return (
        <View key={item.id} style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: `${getIconColor(item.icon)}15` }]}>
              <Ionicons name={item.icon as any} size={20} color={getIconColor(item.icon)} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#E0E0E0', true: '#4CAF5080' }}
            thumbColor={item.value ? '#4CAF50' : '#FFFFFF'}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress || (() => {})}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: `${getIconColor(item.icon)}15` }]}>
            <Ionicons name={item.icon as any} size={20} color={getIconColor(item.icon)} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        {item.rightElement || <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />}
      </TouchableOpacity>
    );
  };

  const getIconColor = (iconName: string) => {
    // Map icon types to colors
    const colorMap: { [key: string]: string } = {
      'person-outline': '#2196F3',
      'shield-checkmark-outline': '#4CAF50',
      'card-outline': '#FF9800',
      'location-outline': '#9C27B0',
      'notifications-outline': '#F44336',
      'mail-outline': '#2196F3',
      'chatbubble-outline': '#4CAF50',
      'megaphone-outline': '#FF5722',
      'eye-outline': '#607D8B',
      'time-outline': '#795548',
      'chatbubbles-outline': '#3F51B5',
      'lock-closed-outline': '#F44336',
      'shield-outline': '#FF9800',
      'help-circle-outline': '#2196F3',
      'headset-outline': '#4CAF50',
      'chatbubble-ellipses-outline': '#9C27B0',
      'document-text-outline': '#607D8B',
      'code-outline': '#795548',
    };
    return colorMap[iconName] || '#666666';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < section.items.length - 1 && <View style={styles.itemDivider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Rent My Threads v1.0.0</Text>
          <Text style={styles.versionSubtext}>Made with ❤️ for fashion lovers</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 68,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  versionText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#999999',
  },
});
