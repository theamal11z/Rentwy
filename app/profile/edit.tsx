import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme, getColor, getShadow } from '@/lib/theme';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  profileImage: string | null;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Mock current user data
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    bio: '👕 Fashion enthusiast sharing my wardrobe! Love sustainable fashion and helping others look their best.',
    location: 'San Francisco, CA',
    profileImage: null,
  });

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant access to your photo library to upload images.');
      return false;
    }
    return true;
  };

  const selectImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1] as [number, number],
      quality: 0.8,
    };

    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync(options);
      
      if (!result.canceled && result.assets[0]) {
        setProfileData(prev => ({
          ...prev,
          profileImage: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          
          <View style={styles.uploadSection}>
            <TouchableOpacity
              style={[
                styles.uploadButton,
                profileData.profileImage && styles.uploadButtonWithImage
              ]}
              onPress={selectImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="large" color={getColor('primary.500')} />
              ) : profileData.profileImage ? (
                <>
                  <Image source={{ uri: profileData.profileImage }} style={styles.imagePreview} />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="camera" size={24} color={getColor('neutral.0')} />
                    <Text style={styles.overlayText}>Change Photo</Text>
                  </View>
                </>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="person-circle-outline" size={32} color={getColor('neutral.400')} />
                  <Text style={styles.uploadPlaceholderText}>Tap to upload</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.name}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.email}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.phone}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.location}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, location: text }))}
              placeholder="Enter your location"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
              placeholder="Tell others about yourself..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={getColor('neutral.0')} />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color={getColor('neutral.0')} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: getColor('neutral.0'),
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    ...getShadow('sm'),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
    height: 100,
    textAlignVertical: 'top',
  },
  uploadSection: {
    alignItems: 'center',
  },
  uploadButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: getColor('neutral.50'),
    borderWidth: 2,
    borderColor: getColor('neutral.200'),
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  uploadButtonWithImage: {
    borderStyle: 'solid',
    borderColor: getColor('neutral.300'),
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadPlaceholderText: {
    fontSize: 12,
    color: getColor('neutral.500'),
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  overlayText: {
    color: getColor('neutral.0'),
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: getColor('primary.500'),
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadow('base'),
  },
  saveButtonDisabled: {
    backgroundColor: getColor('neutral.300'),
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.0'),
    marginLeft: 8,
  },
});
