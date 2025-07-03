import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, getColor, getShadow } from '@/lib/theme';

interface PrivacySection {
  id: string;
  title: string;
  content: string;
}

const privacySections: PrivacySection[] = [
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, list items for rent, make a rental transaction, or contact us for support.

Personal Information:
• Name, email address, phone number
• Profile photos and descriptions
• Payment information (processed securely through third-party providers)
• Address and location data for delivery/pickup

Usage Information:
• Device information and identifiers
• App usage patterns and preferences
• Search queries and browsing history
• Communication between users through our platform

Location Information:
• Precise location when using location-based features
• General location based on IP address
• Location preferences for item discovery`,
  },
  {
    id: 'how-we-use-information',
    title: 'How We Use Your Information',
    content: `We use the information we collect to provide, maintain, and improve our services:

Service Operations:
• Process rental transactions and payments
• Facilitate communication between renters and lenders
• Verify user identity and prevent fraud
• Provide customer support and respond to inquiries

Platform Improvement:
• Analyze usage patterns to enhance user experience
• Develop new features and services
• Conduct research and analytics
• Send service updates and notifications

Marketing and Communication:
• Send promotional materials (with your consent)
• Notify you about relevant items and opportunities
• Provide personalized recommendations
• Communicate important service changes`,
  },
  {
    id: 'information-sharing',
    title: 'Information Sharing and Disclosure',
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:

With Other Users:
• Public profile information for rental transactions
• Reviews and ratings you provide or receive
• Communication necessary for rental coordination

Service Providers:
• Payment processors for transaction handling
• Cloud storage and hosting services
• Analytics and marketing platforms
• Customer support tools

Legal Requirements:
• When required by law or legal process
• To protect our rights, property, or safety
• To prevent fraud or illegal activities
• In connection with business transfers or mergers

With Your Consent:
• Any additional sharing with your explicit permission
• Integration with third-party services you authorize`,
  },
  {
    id: 'data-security',
    title: 'Data Security',
    content: `We implement appropriate technical and organizational security measures to protect your personal information:

Technical Safeguards:
• Encryption of data in transit and at rest
• Secure payment processing through certified providers
• Regular security assessments and updates
• Access controls and authentication measures

Organizational Measures:
• Employee training on data protection
• Limited access to personal information
• Regular security policy reviews
• Incident response procedures

However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.`,
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    content: `We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy:

Account Information:
• Retained while your account is active
• May be retained for a reasonable period after account closure for legal or business purposes

Transaction Data:
• Retained for financial record-keeping requirements
• Typically maintained for 7 years for tax and legal purposes

Communications:
• Customer support communications retained for service improvement
• User-to-user communications retained as necessary for dispute resolution

You may request deletion of your personal information, subject to legal retention requirements and legitimate business needs.`,
  },
  {
    id: 'your-rights',
    title: 'Your Privacy Rights',
    content: `Depending on your location, you may have certain rights regarding your personal information:

Access and Portability:
• Request access to your personal information
• Receive a copy of your data in a portable format
• Review how your information is being used

Correction and Updates:
• Correct inaccurate or incomplete information
• Update your profile and preferences
• Modify communication settings

Deletion and Restriction:
• Request deletion of your personal information
• Restrict processing of your data
• Object to certain uses of your information

To exercise these rights, please contact us using the information provided in the "Contact Us" section. We will respond to your request within 30 days.`,
  },
  {
    id: 'cookies-tracking',
    title: 'Cookies and Tracking Technologies',
    content: `We use cookies and similar tracking technologies to enhance your experience:

Types of Cookies:
• Essential cookies for app functionality
• Analytics cookies to understand usage patterns
• Preference cookies to remember your settings
• Marketing cookies for personalized content

Third-Party Services:
• Google Analytics for usage analytics
• Social media plugins and integrations
• Advertising networks (with your consent)
• Payment processor tracking

You can control cookie preferences through your device settings or by contacting us to opt out of non-essential tracking.`,
  },
  {
    id: 'international-transfers',
    title: 'International Data Transfers',
    content: `Your information may be transferred to and processed in countries other than your country of residence:

Transfer Safeguards:
• Adequate protection measures for international transfers
• Standard contractual clauses with service providers
• Compliance with applicable data protection laws
• Regular review of transfer mechanisms

Data Processing Locations:
• Primary servers located in secure data centers
• Backup and disaster recovery systems
• Cloud service providers with global infrastructure

By using our services, you consent to the transfer of your information to these countries for processing.`,
  },
  {
    id: 'children-privacy',
    title: "Children's Privacy",
    content: `Our services are not intended for children under the age of 18:

Age Requirements:
• Users must be at least 18 years old to create an account
• We do not knowingly collect information from children under 18
• Parents should monitor their children's internet usage

If We Learn of Children's Data:
• We will delete any personal information of children under 18
• Parents may contact us to request removal of their child's information
• We will take reasonable steps to verify parental identity

If you believe we have collected information from a child under 18, please contact us immediately.`,
  },
  {
    id: 'policy-changes',
    title: 'Changes to This Privacy Policy',
    content: `We may update this privacy policy from time to time to reflect changes in our practices or applicable laws:

Notification of Changes:
• We will notify you of material changes via email or app notification
• Updated policy will be posted on our website and in the app
• Changes will be effective 30 days after notification

Your Continued Use:
• Continued use of our services constitutes acceptance of the updated policy
• You may discontinue use if you disagree with changes
• We encourage you to review this policy periodically

Last Updated: January 2024
Previous versions are available upon request.`,
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const colors = {
    background: getColor('neutral.50'),
    surface: getColor('neutral.0'),
    border: getColor('neutral.200'),
    text: getColor('neutral.900'),
    textSecondary: getColor('neutral.500'),
    primary: getColor('primary.500'),
  };
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleAllSections = () => {
    if (allExpanded) {
      setExpandedSections(new Set());
      setAllExpanded(false);
    } else {
      setExpandedSections(new Set(privacySections.map(section => section.id)));
      setAllExpanded(true);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...getShadow('base'),
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    toggleAllButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.primary,
      borderRadius: 6,
    },
    toggleAllText: {
      color: colors.surface,
      fontSize: 12,
      fontWeight: '500',
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    section: {
      marginBottom: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
      ...getShadow('sm'),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: colors.surface,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    sectionContent: {
      padding: 16,
      paddingTop: 0,
      backgroundColor: colors.background,
    },
    sectionText: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.text,
    },
    contactSection: {
      marginTop: 24,
      padding: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      ...getShadow('sm'),
    },
    contactTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    contactText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    contactInfo: {
      gap: 8,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    contactItemText: {
      fontSize: 14,
      color: colors.text,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <TouchableOpacity
          style={styles.toggleAllButton}
          onPress={toggleAllSections}
        >
          <Text style={styles.toggleAllText}>
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {privacySections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          
          return (
            <View key={section.id} style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(section.id)}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              
              {isExpanded && (
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionText}>{section.content}</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Questions About Your Privacy?</Text>
          <Text style={styles.contactText}>
            If you have any questions about this Privacy Policy or how we handle your personal information, please contact us:
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color={colors.primary} />
              <Text style={styles.contactItemText}>privacy@rentmythreads.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={16} color={colors.primary} />
              <Text style={styles.contactItemText}>+1 (555) 123-4567</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={styles.contactItemText}>
                123 Fashion Avenue, Style City, SC 12345
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
