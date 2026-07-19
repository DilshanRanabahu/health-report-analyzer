import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { getReports, logout, getCurrentUser } from '../services/api';

export default function DashboardScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{username?: string} | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      const reportsData = await getReports();
      setReports(reportsData);
    } catch (err) {
      console.error(err);
      // If unauthorized, go back to login
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleReportPress = (item: any) => {
    router.push({ pathname: `/report/${item.id}`, params: { report: JSON.stringify(item) } } as any);
  };

  const getReportTitle = (result: string) => {
    if (!result) return 'Processing...';
    const lines = result.split('\n').filter((line: string) => line.trim().length > 0);
    if (lines.length > 0) {
      return lines[0].replace(/[#*]/g, '').trim();
    }
    return 'Health Report';
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => handleReportPress(item)}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text style={styles.reportTitle} numberOfLines={1}>{getReportTitle(item.result)}</Text>
        <Text style={styles.date}>{item.date ? new Date(item.date).toLocaleDateString() : ''}</Text>
      </View>
      <Text style={styles.patientName}>Patient: {user?.username || 'Unknown'}</Text>
      <Text style={styles.filenameText} numberOfLines={1}>File: {item.filename}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.username}!</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.title}>Your Health Reports</Text>
      
      {reports.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No reports found. Upload your first report!</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadData}
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/upload')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  greeting: { fontSize: 18, fontWeight: '600' },
  logoutText: { color: '#ff4444', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', padding: 20, paddingBottom: 10, color: '#1a1a1a' },
  list: { padding: 20, paddingTop: 0 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  reportTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 10 },
  date: { fontSize: 12, color: '#888', marginTop: 3 },
  patientName: { fontSize: 15, color: '#444', marginBottom: 4 },
  filenameText: { fontSize: 13, color: '#999', fontStyle: 'italic' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    backgroundColor: '#007AFF', 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  fabText: { fontSize: 30, color: '#fff', fontWeight: 'bold' }
});
