import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { uploadReport } from '../services/api';

export default function UploadScreen() {
  const [loading, setLoading] = useState(false);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
      setFileType('image/jpeg');
      setFileName('image.jpg');
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
      setFileType('image/jpeg');
      setFileName('photo.jpg');
    }
  };

  const handlePickPDF = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
      setFileType('application/pdf');
      setFileName(result.assets[0].name);
    }
  };

  const handleUpload = async () => {
    if (!fileUri) return;

    try {
      setLoading(true);
      const response = await uploadReport(fileUri, fileType, fileName);
      // Navigate to report details after successful upload
      router.replace({ pathname: `/report/${response.id}`, params: { report: JSON.stringify(response) } } as any);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Upload Failed', err.message || 'Something went wrong while uploading.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing Report...</Text>
        <Text style={styles.loadingSub}>This may take a minute as our AI translates medical terms to Sinhala.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Medical Report</Text>
      <Text style={styles.subtitle}>Select an image or PDF of your report to translate.</Text>

      {fileUri ? (
        <View style={styles.previewContainer}>
          {fileType.includes('image') ? (
            <Image source={{ uri: fileUri }} style={styles.preview} />
          ) : (
            <View style={styles.pdfPreview}>
              <Text style={styles.pdfText}>📄 {fileName}</Text>
            </View>
          )}
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setFileUri(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={handleUpload}>
              <Text style={styles.buttonText}>Upload & Analyze</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={handleTakePhoto}>
            <Text style={styles.optionText}>📸 Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionButton} onPress={handlePickImage}>
            <Text style={styles.optionText}>🖼️ Pick from Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionButton} onPress={handlePickPDF}>
            <Text style={styles.optionText}>📄 Select PDF</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  optionsContainer: { flex: 1, justifyContent: 'center', gap: 15 },
  optionButton: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  optionText: { fontSize: 18, color: '#333', fontWeight: '500' },
  previewContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  preview: { width: '100%', height: 300, borderRadius: 10, marginBottom: 20, resizeMode: 'contain' },
  pdfPreview: { width: '100%', height: 150, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  pdfText: { fontSize: 18, color: '#333', fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 10, width: '100%' },
  button: { flex: 1, backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#ff4444' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingText: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 20 },
  loadingSub: { fontSize: 14, color: '#666', marginTop: 10, textAlign: 'center' }
});
