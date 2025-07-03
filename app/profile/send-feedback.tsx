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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme, getColor, getShadow } from '@/lib/theme';

export default function SendFeedbackScreen() {
  const router = useRouter();
  const [feedbackData, setFeedbackData] = useState({
    type: '',
    rating: 0,
    subject: '',
    message: '',
    email: '',
    includeSystemInfo: true,
  });
  const [loading, setLoading] = useState(false);

  const feedbackTypes = [
    { id: 'bug', label: 'Bug Report', icon: 'bug', color: getColor('error.500') },
    { id: 'feature', label: 'Feature Request', icon: 'bulb', color: getColor('info.500') },
    { id: 'improvement', label: 'Improvement', icon: 'trending-up', color: getColor('success.500') },
    { id: 'compliment', label: 'Compliment', icon: 'heart', color: getColor('warning.500') },
    { id: 'other', label: 'Other', icon: 'chatbubble', color: getColor('neutral.500') },
  ];

  const handleSubmit = async () => {
    if (!feedbackData.type || !feedbackData.message) {
      Alert.alert('Error', 'Please select a feedback type and enter your message');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert(
        'Feedback Sent',
        'Thank you for your feedback! Your input helps us improve the app.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRatingStars = () => (
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingLabel}>Overall Experience (Optional)</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= feedbackData.rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= feedbackData.rating ? getColor('warning.500') : getColor('neutral.300')}
            />
          </TouchableOpacity>
        ))}
      </View>
      {feedbackData.rating > 0 && (
        <Text style={styles.ratingText}>
          {feedbackData.rating === 1 && 'Poor'}
          {feedbackData.rating === 2 && 'Fair'}
          {feedbackData.rating === 3 && 'Good'}
          {feedbackData.rating === 4 && 'Very Good'}
          {feedbackData.rating === 5 && 'Excellent'}
        </Text>
      )}
    </View>
  );

  const renderFeedbackType = (type: any) => (
    <TouchableOpacity
      key={type.id}
      style={[
        styles.typeCard,
        feedbackData.type === type.id && styles.typeCardActive,
        { borderColor: feedbackData.type === type.id ? type.color : getColor('neutral.200') }
      ]}
      onPress={() => setFeedbackData(prev => ({ ...prev, type: type.id }))}
    >
      <View style={[styles.typeIcon, { backgroundColor: `${type.color}15` }]}>
        <Ionicons name={type.icon as any} size={24} color={type.color} />
      </View>
      <Text style={[
        styles.typeLabel,
        feedbackData.type === type.id && { color: type.color }
      ]}>
        {type.label}
      </Text>
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
        <Text style={styles.headerTitle}>Send Feedback</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introCard}>
          <View style={styles.introHeader}>
            <Ionicons name="megaphone" size={24} color={getColor('primary.500')} />
            <Text style={styles.introTitle}>We Value Your Input</Text>
          </View>
          <Text style={styles.introDescription}>
            Your feedback helps us improve Rent My Threads. Share your thoughts, report bugs, or suggest new features.
          </Text>
        </View>

        {/* Feedback Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What type of feedback do you have?</Text>
          <View style={styles.typesGrid}>
            {feedbackTypes.map(renderFeedbackType)}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          {renderRatingStars()}
        </View>

        {/* Feedback Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tell us more</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={feedbackData.email}
              onChangeText={(text) => setFeedbackData(prev => ({ ...prev, email: text }))}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.inputHelper}>
              We'll only use this to follow up on your feedback if needed
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.textInput}
              value={feedbackData.subject}
              onChangeText={(text) => setFeedbackData(prev => ({ ...prev, subject: text }))}
              placeholder="Brief summary of your feedback"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Feedback *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={feedbackData.message}
              onChangeText={(text) => setFeedbackData(prev => ({ ...prev, message: text }))}
              placeholder="Please share your detailed feedback here..."
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.systemInfoToggle}
            onPress={() => setFeedbackData(prev => ({ ...prev, includeSystemInfo: !prev.includeSystemInfo }))}
          >
            <Ionicons
              name={feedbackData.includeSystemInfo ? 'checkbox' : 'square-outline'}
              size={20}
              color={getColor('primary.500')}
            />
            <View style={styles.systemInfoText}>
              <Text style={styles.systemInfoLabel}>Include system information</Text>
              <Text style={styles.systemInfoHelper}>
                This helps us diagnose technical issues (device model, app version, etc.)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!feedbackData.type || !feedbackData.message || loading) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!feedbackData.type || !feedbackData.message || loading}
          >
            <Ionicons name="send" size={20} color={getColor('neutral.0')} />
            <Text style={styles.submitButtonText}>
              {loading ? 'Sending Feedback...' : 'Send Feedback'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesCard}>
          <View style={styles.guidelinesHeader}>
            <Ionicons name="information-circle" size={24} color={getColor('info.500')} />
            <Text style={styles.guidelinesTitle}>Feedback Guidelines</Text>
          </View>
          <View style={styles.guidelinesList}>
            <Text style={styles.guidelineItem}>• Be specific and detailed in your descriptions</Text>
            <Text style={styles.guidelineItem}>• Include steps to reproduce bugs if applicable</Text>
            <Text style={styles.guidelineItem}>• Be constructive and respectful in your feedback</Text>
            <Text style={styles.guidelineItem}>• Check if your issue was already reported in our FAQ</Text>
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
    fontSize: 18,
    fontWeight: '700',
    color: getColor('primary.800'),
    marginLeft: 8,
  },
  introDescription: {
    fontSize: 14,
    color: getColor('primary.700'),
    lineHeight: 20,
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
    marginBottom: 16,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: getColor('neutral.200'),
    alignItems: 'center',
    backgroundColor: getColor('neutral.50'),
  },
  typeCardActive: {
    backgroundColor: getColor('neutral.0'),
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.700'),
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.800'),
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: getColor('warning.600'),
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
  inputHelper: {
    fontSize: 12,
    color: getColor('neutral.500'),
    marginTop: 4,
  },
  systemInfoToggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  systemInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  systemInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: getColor('neutral.800'),
    marginBottom: 2,
  },
  systemInfoHelper: {
    fontSize: 12,
    color: getColor('neutral.500'),
    lineHeight: 16,
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
  guidelinesCard: {
    backgroundColor: getColor('info.50'),
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: getColor('info.200'),
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('info.800'),
    marginLeft: 8,
  },
  guidelinesList: {
    gap: 8,
  },
  guidelineItem: {
    fontSize: 14,
    color: getColor('info.700'),
    lineHeight: 20,
  },
});
