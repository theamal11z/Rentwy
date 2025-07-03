import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme, getColor, getShadow } from '@/lib/theme';

export default function ContactUsScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    email: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'general', label: 'General Inquiry' },
    { id: 'support', label: 'Technical Support' },
    { id: 'billing', label: 'Billing Issue' },
    { id: 'bug', label: 'Bug Report' },
    { id: 'feature', label: 'Feature Request' },
    { id: 'safety', label: 'Safety Concern' },
  ];

  const contactMethods = [
    {
      id: 'email',
      title: 'Email Support',
      subtitle: 'support@rentmythreads.com',
      icon: 'mail',
      color: getColor('primary.500'),
      action: () => Linking.openURL('mailto:support@rentmythreads.com'),
    },
    {
      id: 'phone',
      title: 'Phone Support',
      subtitle: '+1 (555) 123-4567',
      description: 'Mon-Fri, 9AM-6PM PST',
      icon: 'call',
      color: getColor('success.500'),
      action: () => Linking.openURL('tel:+15551234567'),
    },
    {
      id: 'chat',
      title: 'Live Chat',
      subtitle: 'Available 24/7',
      description: 'Get instant help',
      icon: 'chatbubbles',
      color: getColor('info.500'),
      action: () => Alert.alert('Live Chat', 'Live chat feature coming soon!'),
    },
  ];

  const handleSubmit = async () => {
    if (!formData.subject || !formData.message || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert(
        'Message Sent',
        'Thank you for contacting us! We\'ll get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContactMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={styles.contactMethod}
      onPress={method.action}
    >
      <View style={[styles.contactIcon, { backgroundColor: `${method.color}15` }]}>
        <Ionicons name={method.icon as any} size={24} color={method.color} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{method.title}</Text>
        <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
        {method.description && (
          <Text style={styles.contactDescription}>{method.description}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={getColor('neutral.400')} />
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get In Touch</Text>
          <Text style={styles.sectionDescription}>
            Choose the best way to reach us. We're here to help!
          </Text>
          
          {contactMethods.map(renderContactMethod)}
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Us a Message</Text>
          <Text style={styles.sectionDescription}>
            Fill out the form below and we'll get back to you as soon as possible
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    formData.category === category.id && styles.categoryChipActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, category: category.id }))}
                >
                  <Text style={[
                    styles.categoryChipText,
                    formData.category === category.id && styles.categoryChipTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Subject *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.subject}
              onChangeText={(text) => setFormData(prev => ({ ...prev, subject: text }))}
              placeholder="Brief description of your inquiry"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.message}
              onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
              placeholder="Please describe your issue or question in detail..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!formData.subject || !formData.message || !formData.email || loading) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!formData.subject || !formData.message || !formData.email || loading}
          >
            <Ionicons name="send" size={20} color={getColor('neutral.0')} />
            <Text style={styles.submitButtonText}>
              {loading ? 'Sending...' : 'Send Message'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Link */}
        <View style={styles.faqCard}>
          <View style={styles.faqHeader}>
            <Ionicons name="help-circle" size={24} color={getColor('warning.500')} />
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          </View>
          <Text style={styles.faqDescription}>
            Before contacting us, check our FAQ section for quick answers to common questions.
          </Text>
          <TouchableOpacity style={styles.faqButton}>
            <Text style={styles.faqButtonText}>View FAQ</Text>
            <Ionicons name="arrow-forward" size={16} color={getColor('primary.500')} />
          </TouchableOpacity>
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
    marginBottom: 20,
    lineHeight: 20,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: getColor('neutral.50'),
    borderRadius: 12,
    marginBottom: 12,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: getColor('neutral.700'),
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: getColor('neutral.500'),
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
  textInput: {
    backgroundColor: getColor('neutral.50'),
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: getColor('neutral.900'),
    borderWidth: 1,
    borderColor: getColor('neutral.200'),
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: getColor('neutral.100'),
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: getColor('neutral.200'),
  },
  categoryChipActive: {
    backgroundColor: getColor('primary.500'),
    borderColor: getColor('primary.500'),
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: getColor('neutral.700'),
  },
  categoryChipTextActive: {
    color: getColor('neutral.0'),
  },
  submitButton: {
    backgroundColor: getColor('primary.500'),
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadow('base'),
  },
  submitButtonDisabled: {
    backgroundColor: getColor('neutral.300'),
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.0'),
    marginLeft: 8,
  },
  faqCard: {
    backgroundColor: getColor('warning.50'),
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: getColor('warning.200'),
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('warning.800'),
    marginLeft: 8,
  },
  faqDescription: {
    fontSize: 14,
    color: getColor('warning.700'),
    lineHeight: 20,
    marginBottom: 16,
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  faqButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('primary.500'),
    marginRight: 4,
  },
});
