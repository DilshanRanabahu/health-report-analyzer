import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { deleteReport } from '../../../services/api';

export default function ReportDetailScreen() {
  const { id, report } = useLocalSearchParams();
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    if (report && typeof report === 'string') {
      try {
        setReportData(JSON.parse(report));
      } catch (e) {
        console.error('Failed to parse report', e);
      }
    }
  }, [report]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReport(id as string);
              router.replace('/dashboard');
            } catch (e: any) {
              Alert.alert('Error', 'Failed to delete report.');
            }
          }
        }
      ]
    );
  };

  if (!reportData) {
    return (
      <View style={styles.centered}>
        <Text>Loading report...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Health Report Summary</Text>
        <Text style={styles.date}>
          {reportData.date ? new Date(reportData.date).toLocaleDateString() : 'Unknown Date'}
        </Text>
        
        <View style={styles.card}>
          <Markdown>{reportData.result}</Markdown>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.deleteBtn]} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.chatBtn]} 
          onPress={() => router.push({ 
            pathname: `/report/${id}/chat`, 
            params: { reportContext: reportData.result } 
          } as any)}
        >
          <Text style={styles.buttonText}>Ask Questions 💬</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 5 },
  date: { fontSize: 14, color: '#888', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 30 },
  translationText: { fontSize: 16, color: '#333', lineHeight: 26 },
  footer: { flexDirection: 'row', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', gap: 15 },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chatBtn: { backgroundColor: '#007AFF' },
  deleteBtn: { backgroundColor: '#ffefef', borderWidth: 1, borderColor: '#ff4444' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteBtnText: { color: '#ff4444', fontSize: 16, fontWeight: '600' }
});
