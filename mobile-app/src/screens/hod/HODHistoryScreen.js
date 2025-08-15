import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, SegmentedButtons, Card, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { gatePassAPI } from '../../services/api';

export default function HODHistoryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      const res = await gatePassAPI.getHodHistory({ q: searchQuery, status });
      if (res.data.success) {
        setItems(res.data.gatePasses);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load history' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getStatusColor = (s) => {
    switch (s) {
      case 'pending': return '#FFA500';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'expired': return '#757575';
      default: return '#757575';
    }
  };

  const formatDateTime = (d) => {
    const dt = new Date(d);
    const date = dt.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const time = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `${date} • ${time}`;
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.name}>{item.studentName}</Text>
            <Text style={styles.usn}>{item.studentUSN}</Text>
          </View>
          <Chip style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]} textStyle={styles.statusText}>
            {item.status?.toUpperCase()}
          </Chip>
        </View>
        <View style={styles.metaRow}>
          <MaterialIcons name="event" size={16} color="#666" />
          <Text style={styles.metaText}>Created: {formatDateTime(item.createdAt)}</Text>
        </View>
        {item.approvalDate && (
          <View style={styles.metaRow}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <Text style={styles.metaText}>Status time: {formatDateTime(item.approvalDate)}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const emptyState = (
    <View style={styles.empty}>
      <MaterialIcons name="history" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No history found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Searchbar
          placeholder="Search by name or USN"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.search}
        />
        <SegmentedButtons
          value={status}
          onValueChange={setStatus}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'expired', label: 'Expired' },
          ]}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(it, idx) => it._id ?? String(idx)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? emptyState : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filters: { padding: 16, backgroundColor: '#fff', elevation: 2 },
  search: { marginBottom: 12 },
  list: { padding: 16 },
  card: { marginBottom: 12, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  usn: { fontSize: 14, color: '#666', marginTop: 2 },
  statusChip: { height: 26 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaText: { marginLeft: 6, color: '#666', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 100 },
  emptyText: { marginTop: 12, color: '#777' },
});