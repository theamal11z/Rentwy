import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, getColor, getShadow } from '@/lib/theme';
import { useRouter } from 'expo-router';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
  color: string;
  bgColor: string;
}

export default function HelpScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const helpSections: HelpSection[] = [
    {
      id: 'contact',
      title: 'Contact Support',
      subtitle: 'Get help from our team',
      icon: 'chatbubble-ellipses-outline',
      color: getColor('primary.500'),
      bgColor: getColor('primary.50'),
      action: () => {
        Alert.alert(
          'Contact Support',
          'Choose how you\'d like to contact us:',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Email', onPress: () => Linking.openURL('mailto:support@rentmythreads.app') },
            { text: 'Live Chat', onPress: () => Alert.alert('Live Chat', 'Live chat feature coming soon!') },
          ]
        );
      },
    },
    {
      id: 'phone',
      title: 'Call Us',
      subtitle: '24/7 phone support',
      icon: 'call-outline',
      color: getColor('success.500'),
      bgColor: getColor('success.50'),
      action: () => {
        Alert.alert(
          'Call Support',
          'Would you like to call our support line?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call Now', onPress: () => Linking.openURL('tel:+1-800-THREADS') },
          ]
        );
      },
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Help us improve the app',
      icon: 'thumbs-up-outline',
      color: getColor('warning.500'),
      bgColor: getColor('warning.50'),
      action: () => {
        Alert.alert('Feedback', 'Thank you for your interest in providing feedback! This feature is coming soon.');
      },
    },
    {
      id: 'report',
      title: 'Report an Issue',
      subtitle: 'Report bugs or problems',
      icon: 'flag-outline',
      color: getColor('error.500'),
      bgColor: getColor('error.50'),
      action: () => {
        Alert.alert('Report Issue', 'Issue reporting feature is coming soon. For now, please contact support.');
      },
    },
  ];

  const faqItems: FAQItem[] = [
    {
      id: '1',
      category: 'Getting Started',
      question: 'How do I rent an item?',
      answer: 'Browse our catalog, select an item, choose your rental dates, and complete the booking. The owner will then confirm your request.',
    },
    {
      id: '2',
      category: 'Getting Started',
      question: 'How do I list my items for rent?',
      answer: 'Go to the Add Listing tab, upload photos of your item, add a description, set your price, and publish your listing.',
    },
    {
      id: '3',
      category: 'Payments',
      question: 'When do I get charged?',
      answer: 'You\'re charged when the owner accepts your rental request. Payment is processed securely through our platform.',
    },
    {
      id: '4',
      category: 'Payments',
      question: 'How do I receive payments as an owner?',
      answer: 'Payments are automatically transferred to your linked bank account after the rental period ends successfully.',
    },
    {
      id: '5',
      category: 'Safety',
      question: 'What if an item gets damaged?',
      answer: 'All rentals are covered by our protection policy. Report any damage immediately through the app.',
    },
    {
      id: '6',
      category: 'Safety',
      question: 'How are users verified?',
      answer: 'We verify users through ID verification, phone number confirmation, and payment method validation.',
    },
    {
      id: '7',
      category: 'Policies',
      question: 'What is your cancellation policy?',
      answer: 'Free cancellation up to 24 hours before rental start time. Late cancellations may incur fees.',
    },
    {
      id: '8',
      category: 'Policies',
      question: 'What items are not allowed?',
      answer: 'We don\'t allow counterfeit items, damaged goods, undergarments, or items that violate our community guidelines.',
    },
  ];

  const categories = [...new Set(faqItems.map(item => item.category))];

  const renderHelpSection = (section: HelpSection) => (
    <TouchableOpacity
      key={section.id}
      style={[styles.helpCard, { backgroundColor: section.bgColor }]}
      onPress={section.action}
    >
      <View style={styles.helpCardContent}>
        <View style={[styles.helpIcon, { backgroundColor: section.color }]}>
          <Ionicons name={section.icon as any} size={24} color={getColor('neutral.0')} />
        </View>
        <View style={styles.helpTextContainer}>
          <Text style={styles.helpTitle}>{section.title}</Text>
          <Text style={[styles.helpSubtitle, { color: section.color }]}>{section.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={section.color} />
      </View>
    </TouchableOpacity>
  );

  const renderFAQItem = (item: FAQItem) => {
    const isExpanded = expandedFAQ === item.id;
    
    return (
      <View key={item.id} style={styles.faqItem}>
        <TouchableOpacity
          style={styles.faqQuestion}
          onPress={() => setExpandedFAQ(isExpanded ? null : item.id)}
        >
          <Text style={styles.faqQuestionText}>{item.question}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={getColor('neutral.500')}
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCategoryFAQs = (category: string) => {
    const categoryItems = faqItems.filter(item => item.category === category);
    
    return (
      <View key={category} style={styles.faqCategory}>
        <Text style={styles.faqCategoryTitle}>{category}</Text>
        {categoryItems.map(renderFAQItem)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.50')} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>
            We're here to help you with any questions or issues
          </Text>
        </View>

        {/* Quick Help Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <View style={styles.helpGrid}>
            {helpSections.map(renderHelpSection)}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {categories.map(renderCategoryFAQs)}
          </View>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          
          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => Alert.alert('Terms of Service', 'Terms of Service feature coming soon.')}
          >
            <Ionicons name="document-text-outline" size={20} color={getColor('neutral.600')} />
            <Text style={styles.resourceText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={getColor('neutral.400')} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => Alert.alert('Privacy Policy', 'Privacy Policy feature coming soon.')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={getColor('neutral.600')} />
            <Text style={styles.resourceText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={getColor('neutral.400')} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => Alert.alert('Community Guidelines', 'Community Guidelines feature coming soon.')}
          >
            <Ionicons name="people-outline" size={20} color={getColor('neutral.600')} />
            <Text style={styles.resourceText}>Community Guidelines</Text>
            <Ionicons name="chevron-forward" size={16} color={getColor('neutral.400')} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => Linking.openURL('https://rentmythreads.app')}
          >
            <Ionicons name="globe-outline" size={20} color={getColor('neutral.600')} />
            <Text style={styles.resourceText}>Visit Our Website</Text>
            <Ionicons name="open-outline" size={16} color={getColor('neutral.400')} />
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactSubtitle}>
              Our support team is available 24/7 to assist you
            </Text>
            <View style={styles.contactMethods}>
              <TouchableOpacity
                style={styles.contactMethod}
                onPress={() => Linking.openURL('mailto:support@rentmythreads.app')}
              >
                <Ionicons name="mail-outline" size={16} color={getColor('primary.500')} />
                <Text style={styles.contactMethodText}>support@rentmythreads.app</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactMethod}
                onPress={() => Linking.openURL('tel:+1-800-THREADS')}
              >
                <Ionicons name="call-outline" size={16} color={getColor('success.500')} />
                <Text style={styles.contactMethodText}>+1-800-THREADS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: getColor('neutral.0'),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: getColor('neutral.600'),
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  helpGrid: {
    paddingHorizontal: 20,
  },
  helpCard: {
    borderRadius: 16,
    marginBottom: 12,
    ...getShadow('sm'),
  },
  helpCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  helpIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  faqContainer: {
    paddingHorizontal: 20,
  },
  faqCategory: {
    marginBottom: 20,
  },
  faqCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: getColor('neutral.800'),
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 12,
    marginBottom: 8,
    ...getShadow('sm'),
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: getColor('neutral.900'),
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: getColor('neutral.100'),
  },
  faqAnswerText: {
    fontSize: 14,
    color: getColor('neutral.700'),
    lineHeight: 20,
    marginTop: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('neutral.0'),
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    ...getShadow('sm'),
  },
  resourceText: {
    fontSize: 16,
    color: getColor('neutral.900'),
    marginLeft: 16,
    flex: 1,
  },
  contactCard: {
    backgroundColor: getColor('primary.50'),
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 8,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 14,
    color: getColor('neutral.600'),
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactMethods: {
    alignSelf: 'stretch',
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('neutral.0'),
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactMethodText: {
    fontSize: 14,
    color: getColor('neutral.700'),
    marginLeft: 12,
    fontWeight: '500',
  },
});
