import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme, getColor, getShadow } from '@/lib/theme';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const termsData = {
    lastUpdated: 'January 15, 2024',
    sections: [
      {
        id: 'acceptance',
        title: '1. Acceptance of Terms',
        content: `By accessing and using Rent My Threads ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

These Terms of Service may be updated from time to time, and we will notify you of any material changes. Your continued use of the App after such modifications will constitute acknowledgment and agreement of the modified terms.`
      },
      {
        id: 'service',
        title: '2. Description of Service',
        content: `Rent My Threads is a peer-to-peer clothing rental platform that connects users who want to rent out their clothing items with users who want to rent clothing items.

The platform provides:
• A marketplace for listing and discovering rental items
• Communication tools between users
• Payment processing services
• Identity verification services
• Review and rating systems

We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.`
      },
      {
        id: 'eligibility',
        title: '3. User Eligibility',
        content: `To use Rent My Threads, you must:
• Be at least 18 years of age
• Provide accurate and complete information during registration
• Maintain the security of your account credentials
• Comply with all applicable local, state, and federal laws

Users under 18 may use the service only with the involvement and consent of a parent or guardian.`
      },
      {
        id: 'responsibilities',
        title: '4. User Responsibilities',
        content: `As a user of Rent My Threads, you agree to:

For Renters:
• Treat rented items with care and return them in the same condition
• Pay all applicable fees on time
• Communicate respectfully with item owners
• Report any damages or issues promptly

For Owners:
• Provide accurate descriptions and photos of items
• Ensure items are clean and in good condition before listing
• Respond to rental requests in a timely manner
• Honor confirmed rental agreements

All Users:
• Verify your identity when requested
• Maintain accurate profile information
• Use the platform only for legitimate rental purposes
• Respect the intellectual property rights of others`
      },
      {
        id: 'prohibited',
        title: '5. Prohibited Activities',
        content: `You may not use Rent My Threads to:
• Post false, misleading, or deceptive content
• Engage in fraudulent or illegal activities
• Harass, abuse, or harm other users
• Violate any applicable laws or regulations
• Attempt to circumvent our security measures
• Use automated systems to access the platform
• Infringe on intellectual property rights
• Post items that are prohibited by law or our policies

Violation of these terms may result in suspension or termination of your account.`
      },
      {
        id: 'payments',
        title: '6. Payments and Fees',
        content: `Rent My Threads charges service fees for successful transactions. Current fee structure:
• 5% service fee on rental transactions
• 3% payment processing fee
• Security deposits as determined by item owners

Payment terms:
• All payments are processed through our secure payment system
• Refunds are subject to our refund policy
• Disputed charges are handled according to our dispute resolution process
• Users are responsible for applicable taxes

We reserve the right to modify our fee structure with appropriate notice.`
      },
      {
        id: 'liability',
        title: '7. Limitation of Liability',
        content: `Rent My Threads serves as a platform connecting users but is not responsible for:
• The condition, quality, or safety of rental items
• Actions or omissions of other users
• Disputes between users
• Loss or damage to items during rental periods
• Any direct, indirect, incidental, or consequential damages

Our total liability to you for any claims arising from your use of the service shall not exceed the amount of fees paid by you to us in the twelve months preceding the claim.

Users participate in rentals at their own risk and are encouraged to communicate clearly and inspect items before completing transactions.`
      },
      {
        id: 'privacy',
        title: '8. Privacy and Data Protection',
        content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information.

By using Rent My Threads, you consent to:
• Collection of necessary personal information
• Processing of payment information through secure systems
• Communication from us regarding your account and transactions
• Sharing of limited information with transaction partners as needed

We implement industry-standard security measures to protect your data and will never sell your personal information to third parties.`
      },
      {
        id: 'intellectual',
        title: '9. Intellectual Property',
        content: `The Rent My Threads platform, including its design, features, and content, is owned by us and protected by copyright, trademark, and other intellectual property laws.

You retain ownership of content you post but grant us a license to use it for platform operations. You may not:
• Copy or reproduce platform elements
• Use our trademarks without permission
• Reverse engineer our technology
• Create derivative works based on our platform

We respect the intellectual property rights of others and expect users to do the same.`
      },
      {
        id: 'termination',
        title: '10. Account Termination',
        content: `Either party may terminate this agreement at any time:

You may close your account by:
• Contacting our support team
• Completing any outstanding rental obligations
• Settling any outstanding payments

We may suspend or terminate accounts for:
• Violation of these terms
• Fraudulent or illegal activity
• Extended periods of inactivity
• At our sole discretion for platform safety

Upon termination, you remain liable for all outstanding obligations, and we may retain certain information as required by law.`
      },
      {
        id: 'governing',
        title: '11. Governing Law',
        content: `These Terms of Service are governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law principles.

Any disputes arising from these terms or your use of the service will be resolved through:
• First, good faith negotiation
• Then, binding arbitration in California
• Class action lawsuits are waived

If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.`
      },
    ]
  };

  const renderSection = (section: any) => {
    const isExpanded = expandedSections.has(section.id);
    
    return (
      <View key={section.id} style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(section.id)}
        >
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={getColor('neutral.500')}
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionText}>{section.content}</Text>
          </View>
        )}
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introCard}>
          <View style={styles.introHeader}>
            <Ionicons name="document-text" size={24} color={getColor('primary.500')} />
            <Text style={styles.introTitle}>Terms of Service</Text>
          </View>
          <Text style={styles.introDescription}>
            Please read these terms carefully before using Rent My Threads. These terms govern your use of our platform and services.
          </Text>
          <Text style={styles.lastUpdated}>
            Last updated: {termsData.lastUpdated}
          </Text>
        </View>

        {/* Terms Sections */}
        <View style={styles.termsContainer}>
          <View style={styles.expandAllContainer}>
            <TouchableOpacity
              style={styles.expandAllButton}
              onPress={() => {
                if (expandedSections.size === termsData.sections.length) {
                  setExpandedSections(new Set());
                } else {
                  setExpandedSections(new Set(termsData.sections.map(s => s.id)));
                }
              }}
            >
              <Ionicons
                name={expandedSections.size === termsData.sections.length ? 'contract' : 'expand'}
                size={16}
                color={getColor('primary.500')}
              />
              <Text style={styles.expandAllText}>
                {expandedSections.size === termsData.sections.length ? 'Collapse All' : 'Expand All'}
              </Text>
            </TouchableOpacity>
          </View>

          {termsData.sections.map(renderSection)}
        </View>

        {/* Contact Information */}
        <View style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <Ionicons name="help-circle" size={24} color={getColor('info.500')} />
            <Text style={styles.contactTitle}>Questions?</Text>
          </View>
          <Text style={styles.contactDescription}>
            If you have any questions about these Terms of Service, please contact us:
          </Text>
          <View style={styles.contactMethods}>
            <Text style={styles.contactMethod}>📧 legal@rentmythreads.com</Text>
            <Text style={styles.contactMethod}>📞 +1 (555) 123-4567</Text>
            <Text style={styles.contactMethod}>📍 123 Fashion Street, San Francisco, CA 94102</Text>
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
  introCard: {
    backgroundColor: getColor('primary.50'),
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: getColor('primary.200'),
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: getColor('primary.800'),
    marginLeft: 8,
  },
  introDescription: {
    fontSize: 14,
    color: getColor('primary.700'),
    lineHeight: 20,
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 12,
    color: getColor('primary.600'),
    fontStyle: 'italic',
  },
  termsContainer: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...getShadow('sm'),
  },
  expandAllContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  expandAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  expandAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: getColor('primary.500'),
    marginLeft: 4,
  },
  sectionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: getColor('neutral.100'),
    marginBottom: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.900'),
    flex: 1,
    marginRight: 12,
  },
  sectionContent: {
    marginTop: 12,
  },
  sectionText: {
    fontSize: 14,
    color: getColor('neutral.700'),
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: getColor('info.50'),
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: getColor('info.200'),
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: getColor('info.800'),
    marginLeft: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: getColor('info.700'),
    lineHeight: 20,
    marginBottom: 16,
  },
  contactMethods: {
    gap: 8,
  },
  contactMethod: {
    fontSize: 14,
    color: getColor('info.800'),
    fontWeight: '500',
  },
});
