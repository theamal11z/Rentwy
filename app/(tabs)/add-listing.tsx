import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function AddListingScreen() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    size: '',
    condition: '',
    pricePerDay: '',
    depositAmount: '',
    tags: '',
  });

  const createItem = useMutation(api.items.createItem);

  const categories = [
    { id: 'dress', name: 'Dress', icon: 'shirt-outline' },
    { id: 'top', name: 'Top', icon: 'shirt-outline' },
    { id: 'bottom', name: 'Bottom', icon: 'shirt-outline' },
    { id: 'outerwear', name: 'Outerwear', icon: 'shirt-outline' },
    { id: 'shoes', name: 'Shoes', icon: 'footsteps-outline' },
    { id: 'accessories', name: 'Accessories', icon: 'watch-outline' },
    { id: 'jewelry', name: 'Jewelry', icon: 'diamond-outline' },
    { id: 'bags', name: 'Bags', icon: 'bag-outline' },
  ];

  const conditions = [
    { id: 'new', name: 'New with tags', description: 'Brand new, never worn' },
    { id: 'excellent', name: 'Excellent', description: 'Like new, minimal wear' },
    { id: 'good', name: 'Good', description: 'Some wear, good condition' },
    { id: 'fair', name: 'Fair', description: 'Noticeable wear, still wearable' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12', 'One Size'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (categoryId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    handleInputChange('category', categoryId);
  };

  const handleConditionSelect = (conditionId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    handleInputChange('condition', conditionId);
  };

  const handleSizeSelect = (size: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    handleInputChange('size', size);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your item');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!formData.size) {
      Alert.alert('Error', 'Please select a size');
      return;
    }
    if (!formData.condition) {
      Alert.alert('Error', 'Please select the condition');
      return;
    }
    if (!formData.pricePerDay || isNaN(Number(formData.pricePerDay))) {
      Alert.alert('Error', 'Please enter a valid price per day');
      return;
    }
    if (!formData.depositAmount || isNaN(Number(formData.depositAmount))) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // For now, we'll use a dummy user ID and location
      // In a real app, this would come from authentication
      const dummyUserId = "dummy_user_id" as any;
      const dummyLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
        address: "San Francisco, CA"
      };

      await createItem({
        ownerId: dummyUserId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category as any,
        size: formData.size,
        condition: formData.condition as any,
        images: [], // Will be implemented with image upload
        pricePerDay: Number(formData.pricePerDay),
        depositAmount: Number(formData.depositAmount),
        location: dummyLocation,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      });

      Alert.alert('Success', 'Your item has been listed!', [
        { text: 'OK', onPress: () => {
          // Reset form
          setFormData({
            title: '',
            description: '',
            category: '',
            size: '',
            condition: '',
            pricePerDay: '',
            depositAmount: '',
            tags: '',
          });
        }}
      ]);
    } catch (error) {
      console.error('Error creating item:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Item</Text>
          <Text style={styles.headerSubtitle}>Share your wardrobe with the community</Text>
        </View>

        {/* Photo Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <TouchableOpacity style={styles.photoUpload}>
            <Ionicons name="camera-outline" size={32} color="#4CAF50" />
            <Text style={styles.photoUploadText}>Add Photos</Text>
            <Text style={styles.photoUploadSubtext}>Add up to 5 photos</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Elegant Black Dress"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your item, including brand, style, and any special features..."
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <View style={styles.optionsGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.optionCard,
                  formData.category === category.id && styles.optionCardSelected
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={24}
                  color={formData.category === category.id ? '#FFFFFF' : '#4CAF50'}
                />
                <Text
                  style={[
                    styles.optionText,
                    formData.category === category.id && styles.optionTextSelected
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Size Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size *</Text>
          <View style={styles.sizeGrid}>
            {sizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeChip,
                  formData.size === size && styles.sizeChipSelected
                ]}
                onPress={() => handleSizeSelect(size)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    formData.size === size && styles.sizeTextSelected
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Condition Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condition *</Text>
          {conditions.map((condition) => (
            <TouchableOpacity
              key={condition.id}
              style={[
                styles.conditionCard,
                formData.condition === condition.id && styles.conditionCardSelected
              ]}
              onPress={() => handleConditionSelect(condition.id)}
            >
              <View style={styles.conditionInfo}>
                <Text
                  style={[
                    styles.conditionName,
                    formData.condition === condition.id && styles.conditionNameSelected
                  ]}
                >
                  {condition.name}
                </Text>
                <Text
                  style={[
                    styles.conditionDescription,
                    formData.condition === condition.id && styles.conditionDescriptionSelected
                  ]}
                >
                  {condition.description}
                </Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  formData.condition === condition.id && styles.radioButtonSelected
                ]}
              >
                {formData.condition === condition.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          <View style={styles.priceRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Price per day *</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceTextInput}
                  placeholder="0"
                  value={formData.pricePerDay}
                  onChangeText={(value) => handleInputChange('pricePerDay', value)}
                  keyboardType="numeric"
                  placeholderTextColor="#999999"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Security deposit *</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceTextInput}
                  placeholder="0"
                  value={formData.depositAmount}
                  onChangeText={(value) => handleInputChange('depositAmount', value)}
                  keyboardType="numeric"
                  placeholderTextColor="#999999"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., vintage, designer, formal (separate with commas)"
            value={formData.tags}
            onChangeText={(value) => handleInputChange('tags', value)}
            placeholderTextColor="#999999"
          />
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>List Item</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  photoUpload: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  photoUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 8,
  },
  photoUploadSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionCardSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    marginTop: 8,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sizeChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  sizeTextSelected: {
    color: '#FFFFFF',
  },
  conditionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  conditionCardSelected: {
    backgroundColor: '#F8FFF8',
    borderColor: '#4CAF50',
  },
  conditionInfo: {
    flex: 1,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  conditionNameSelected: {
    color: '#4CAF50',
  },
  conditionDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  conditionDescriptionSelected: {
    color: '#4CAF50',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  priceRow: {
    flexDirection: 'row',
  },
  priceInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginRight: 4,
  },
  priceTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});