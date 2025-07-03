import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme, getColor, getShadow } from '@/lib/theme';

interface Address {
  id: string;
  label: string;
  fullAddress: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      fullAddress: '123 Main St, San Francisco, CA 94102, USA',
      addressLine1: '123 Main St',
      addressLine2: '',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Work',
      fullAddress: '456 Tech Blvd, Suite 200, San Francisco, CA 94105, USA',
      addressLine1: '456 Tech Blvd',
      addressLine2: 'Suite 200',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
      isDefault: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    label: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  const handleSaveAddress = () => {
    if (!newAddress.label || !newAddress.addressLine1 || !newAddress.city) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const fullAddress = `${newAddress.addressLine1}${newAddress.addressLine2 ? ', ' + newAddress.addressLine2 : ''}, ${newAddress.city}, ${newAddress.state} ${newAddress.zipCode}, ${newAddress.country}`;

    const address: Address = {
      id: Date.now().toString(),
      label: newAddress.label!,
      fullAddress,
      addressLine1: newAddress.addressLine1!,
      addressLine2: newAddress.addressLine2 || '',
      city: newAddress.city!,
      state: newAddress.state!,
      zipCode: newAddress.zipCode!,
      country: newAddress.country!,
      isDefault: addresses.length === 0,
    };

    setAddresses(prev => [...prev, address]);
    setShowAddModal(false);
    setNewAddress({
      label: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    });
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses(prev => prev.filter(addr => addr.id !== id));
          },
        },
      ]
    );
  };

  const renderAddressCard = (address: Address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressLabelContainer}>
          <Ionicons 
            name={address.label.toLowerCase() === 'home' ? 'home' : address.label.toLowerCase() === 'work' ? 'business' : 'location'} 
            size={16} 
            color={getColor('primary.500')} 
          />
          <Text style={styles.addressLabel}>{address.label}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(
              'Address Options',
              'What would you like to do?',
              [
                { text: 'Cancel', style: 'cancel' },
                !address.isDefault && {
                  text: 'Set as Default',
                  onPress: () => handleSetDefault(address.id),
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => handleDeleteAddress(address.id),
                },
              ].filter(Boolean) as any
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={16} color={getColor('neutral.400')} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.addressText}>{address.fullAddress}</Text>
      
      <View style={styles.addressActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={16} color={getColor('primary.500')} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
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
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={getColor('primary.500')} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={getColor('neutral.300')} />
            <Text style={styles.emptyTitle}>No addresses yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first address to make ordering faster and easier
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            {addresses.map(renderAddressCard)}
          </>
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Address</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveAddress}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Label *</Text>
              <TextInput
                style={styles.textInput}
                value={newAddress.label}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, label: text }))}
                placeholder="e.g., Home, Work, etc."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line 1 *</Text>
              <TextInput
                style={styles.textInput}
                value={newAddress.addressLine1}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, addressLine1: text }))}
                placeholder="Street address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line 2</Text>
              <TextInput
                style={styles.textInput}
                value={newAddress.addressLine2}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, addressLine2: text }))}
                placeholder="Apartment, suite, etc."
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, city: text }))}
                  placeholder="City"
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.inputLabel}>State *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddress.state}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, state: text }))}
                  placeholder="State"
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>ZIP Code *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddress.zipCode}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, zipCode: text }))}
                  placeholder="ZIP"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.inputLabel}>Country *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddress.country}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, country: text }))}
                  placeholder="Country"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: getColor('primary.50'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...getShadow('sm'),
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: getColor('primary.500'),
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: getColor('neutral.0'),
  },
  moreButton: {
    padding: 4,
  },
  addressText: {
    fontSize: 14,
    color: getColor('neutral.600'),
    lineHeight: 20,
    marginBottom: 12,
  },
  addressActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: getColor('neutral.100'),
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionButtonText: {
    fontSize: 14,
    color: getColor('primary.500'),
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: getColor('neutral.700'),
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: getColor('neutral.500'),
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: getColor('primary.500'),
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.0'),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: getColor('neutral.50'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: getColor('neutral.0'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('neutral.200'),
  },
  modalCloseButton: {
    width: 60,
  },
  modalCloseText: {
    fontSize: 16,
    color: getColor('neutral.600'),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: getColor('neutral.900'),
  },
  modalSaveButton: {
    width: 60,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('primary.500'),
    textAlign: 'right',
  },
  modalContent: {
    flex: 1,
    padding: 20,
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
    backgroundColor: getColor('neutral.0'),
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: getColor('neutral.900'),
    borderWidth: 1,
    borderColor: getColor('neutral.200'),
  },
  rowInputs: {
    flexDirection: 'row',
  },
});
