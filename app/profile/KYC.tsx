import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { theme, getColor } from '@/lib/theme';

export default function KYC() {
  const router = useRouter();
  const [uploading, setUploading] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState({
    citizenCard: null,
    livePhoto: null,
  });

  const selectImage = async (type: 'citizenCard' | 'livePhoto') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant access to your photo library to upload images.'
      );
      return;
    }
    
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    };

    try {
      setUploading(type);
      const result = await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        setVerificationData(prev => ({
          ...prev,
          [type]: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const takePhoto = async (type: 'livePhoto') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access to take a live photo.');
      return;
    }

    try {
      setUploading(type);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setVerificationData(prev => ({
          ...prev,
          [type]: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const renderImageUpload = (title: string, type: 'citizenCard' | 'livePhoto', showCameraOption = false) => {
    const imageUri = verificationData[type];
    const isUploading = uploading === type;

    return (
      <View style={styles.uploadSection}>
        <Text style={styles.uploadTitle}>{title}</Text>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            imageUri && styles.uploadButtonWithImage,
          ]}
          onPress={() => selectImage(type)}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="large" color={getColor('primary.500')} />
          ) : imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <Ionicons name="camera" size={24} color={getColor('neutral.0')} />
              </View>
            </>
          ) : (
            <Ionicons name="image-outline" size={32} color={getColor('neutral.400')} />
          )}
        </TouchableOpacity>

        {showCameraOption && (
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => takePhoto(type)}
            disabled={isUploading}
          >
            <Ionicons name="camera" size={20} color={getColor('primary.500')} />
            <Text style={styles.cameraButtonText}>Take Live Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.50')} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={getColor('neutral.900')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Identity Verification</Text>
        <Text style={styles.sectionDescription}>
          Upload your citizen card and take a live photo to verify your identity. This helps build trust in our community.
        </Text>

        {renderImageUpload('Citizen Card / ID', 'citizenCard')}
        {renderImageUpload('Live Photo', 'livePhoto', true)}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: getColor('neutral.900'),
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: getColor('neutral.600'),
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  uploadSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 8,
  },
  uploadButton: {
    height: 140,
    borderRadius: 12,
    backgroundColor: getColor('neutral.50'),
    borderWidth: 2,
    borderColor: getColor('neutral.200'),
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadButtonWithImage: {
    borderStyle: 'solid',
    borderColor: getColor('neutral.300'),
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
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
    borderRadius: 10,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: getColor('primary.50'),
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: getColor('primary.200'),
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: getColor('primary.600'),
    marginLeft: 8,
  },
});

