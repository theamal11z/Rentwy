import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, getColor, getShadow } from '@/lib/theme';

interface License {
  name: string;
  version: string;
  description: string;
  license: string;
  url: string;
  author?: string;
}

const licenses: License[] = [
  {
    name: 'React',
    version: '18.2.0',
    description: 'A JavaScript library for building user interfaces',
    license: 'MIT License',
    url: 'https://github.com/facebook/react',
    author: 'Facebook, Inc.',
  },
  {
    name: 'React Native',
    version: '0.72.6',
    description: 'A framework for building native applications using React',
    license: 'MIT License',
    url: 'https://github.com/facebook/react-native',
    author: 'Facebook, Inc.',
  },
  {
    name: 'Expo',
    version: '49.0.0',
    description: 'An open-source platform for making universal native apps',
    license: 'MIT License',
    url: 'https://github.com/expo/expo',
    author: 'Expo',
  },
  {
    name: 'TypeScript',
    version: '5.1.3',
    description: 'TypeScript is a language for application-scale JavaScript',
    license: 'Apache License 2.0',
    url: 'https://github.com/microsoft/TypeScript',
    author: 'Microsoft Corporation',
  },
  {
    name: '@expo/vector-icons',
    version: '13.0.0',
    description: 'Built-in support for popular icon families',
    license: 'MIT License',
    url: 'https://github.com/expo/vector-icons',
    author: 'Expo',
  },
  {
    name: 'expo-router',
    version: '2.0.0',
    description: 'File-based router for universal React Native apps',
    license: 'MIT License',
    url: 'https://github.com/expo/router',
    author: 'Expo',
  },
  {
    name: 'expo-image',
    version: '1.3.5',
    description: 'Fast image component for Expo and React Native',
    license: 'MIT License',
    url: 'https://github.com/expo/expo',
    author: 'Expo',
  },
  {
    name: 'convex',
    version: '1.5.1',
    description: 'The backend application platform with everything you need',
    license: 'Apache License 2.0',
    url: 'https://github.com/get-convex/convex-js',
    author: 'Convex, Inc.',
  },
  {
    name: 'eslint',
    version: '8.50.0',
    description: 'An AST-based pattern checker for JavaScript',
    license: 'MIT License',
    url: 'https://github.com/eslint/eslint',
    author: 'JS Foundation',
  },
  {
    name: '@typescript-eslint/eslint-plugin',
    version: '6.7.0',
    description: 'TypeScript plugin for ESLint',
    license: 'MIT License',
    url: 'https://github.com/typescript-eslint/typescript-eslint',
    author: 'TypeScript ESLint',
  },
];

export default function LicensesScreen() {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (name: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedItems(newExpanded);
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
    });
  };

  const renderLicense = (license: License) => {
    const isExpanded = expandedItems.has(license.name);
    
    return (
      <View key={license.name} style={styles.licenseCard}>
        <TouchableOpacity
          style={styles.licenseHeader}
          onPress={() => toggleExpanded(license.name)}
        >
          <View style={styles.licenseInfo}>
            <Text style={styles.licenseName}>{license.name}</Text>
            <Text style={styles.licenseVersion}>v{license.version}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={getColor('neutral.500')}
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.licenseDetails}>
            <Text style={styles.licenseDescription}>{license.description}</Text>
            
            <View style={styles.licenseMetadata}>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>License:</Text>
                <Text style={styles.metadataValue}>{license.license}</Text>
              </View>
              
              {license.author && (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Author:</Text>
                  <Text style={styles.metadataValue}>{license.author}</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.urlButton}
                onPress={() => openUrl(license.url)}
              >
                <Ionicons name="link" size={16} color={getColor('primary.500')} />
                <Text style={styles.urlText}>View on GitHub</Text>
                <Ionicons name="open-outline" size={16} color={getColor('primary.500')} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.0')} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={getColor('neutral.900')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Open Source Licenses</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introduction}>
          <View style={styles.introHeader}>
            <Ionicons name="code-slash" size={32} color={getColor('primary.500')} />
            <Text style={styles.introTitle}>Built with Open Source</Text>
          </View>
          <Text style={styles.introDescription}>
            Rent My Threads is built using amazing open source libraries. We're grateful to the developers and maintainers of these projects that make our app possible.
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{licenses.length}</Text>
            <Text style={styles.statLabel}>Open Source Libraries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {licenses.filter(l => l.license.includes('MIT')).length}
            </Text>
            <Text style={styles.statLabel}>MIT Licensed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {licenses.filter(l => l.license.includes('Apache')).length}
            </Text>
            <Text style={styles.statLabel}>Apache Licensed</Text>
          </View>
        </View>

        {/* Licenses List */}
        <View style={styles.licensesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Third-Party Libraries</Text>
            <TouchableOpacity
              style={styles.expandAllButton}
              onPress={() => {
                if (expandedItems.size === licenses.length) {
                  setExpandedItems(new Set());
                } else {
                  setExpandedItems(new Set(licenses.map(l => l.name)));
                }
              }}
            >
              <Text style={styles.expandAllText}>
                {expandedItems.size === licenses.length ? 'Collapse All' : 'Expand All'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {licenses.map(renderLicense)}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            We appreciate the open source community and strive to contribute back whenever possible.
          </Text>
          <TouchableOpacity
            style={styles.contributeButton}
            onPress={() => openUrl('https://github.com')}
          >
            <Ionicons name="heart" size={16} color={getColor('error.500')} />
            <Text style={styles.contributeButtonText}>Support Open Source</Text>
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
  },
  introduction: {
    padding: 20,
    backgroundColor: getColor('neutral.0'),
    marginBottom: 16,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginLeft: 12,
  },
  introDescription: {
    fontSize: 16,
    color: getColor('neutral.600'),
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: getColor('neutral.0'),
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...getShadow('sm'),
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: getColor('primary.500'),
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: getColor('neutral.500'),
    textAlign: 'center',
  },
  licensesSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: getColor('neutral.900'),
  },
  expandAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: getColor('primary.50'),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getColor('primary.200'),
  },
  expandAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: getColor('primary.600'),
  },
  licenseCard: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    ...getShadow('sm'),
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  licenseInfo: {
    flex: 1,
  },
  licenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 2,
  },
  licenseVersion: {
    fontSize: 14,
    color: getColor('neutral.500'),
  },
  licenseDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: getColor('neutral.100'),
  },
  licenseDescription: {
    fontSize: 14,
    color: getColor('neutral.600'),
    lineHeight: 20,
    marginBottom: 12,
  },
  licenseMetadata: {
    gap: 8,
  },
  metadataRow: {
    flexDirection: 'row',
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: getColor('neutral.700'),
    width: 80,
  },
  metadataValue: {
    fontSize: 14,
    color: getColor('neutral.600'),
    flex: 1,
  },
  urlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    gap: 6,
  },
  urlText: {
    fontSize: 14,
    color: getColor('primary.500'),
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    padding: 20,
    marginTop: 20,
    backgroundColor: getColor('neutral.0'),
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: getColor('neutral.600'),
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('error.50'),
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  contributeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('error.500'),
  },
});
