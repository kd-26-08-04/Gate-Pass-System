import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Card, Chip, Searchbar, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { complaintAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function MyComplaintsScreen({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [searchQuery, complaints]);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getMyComplaints();
      if (response.data.success) {
        setComplaints(response.data.complaints);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch complaints',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterComplaints = () => {
    if (!searchQuery) {
      setFilteredComplaints(complaints);
      return;
    }

    const filtered = complaints.filter(
      (complaint) =>
        complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredComplaints(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'in_progress':
        return '#2196F3';
      case 'resolved':
        return '#4CAF50';
      case 'closed':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'gate_pass':
        return 'exit-to-app';
      case 'system_issue':
        return 'bug-report';
      case 'security':
        return 'security';
      case 'other':
        return 'help-outline';
      default:
        return 'help-outline';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderComplaintItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item._id })}
    >
      <Card style={styles.complaintCard}>
        <Card.Content>
          <View style={styles.complaintHeader}>
            <View style={styles.complaintInfo}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.statusText}
              >
                {item.status.replace('_', ' ').toUpperCase()}
              </Chip>
            </View>
          </View>
          
          <View style={styles.complaintDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name={getCategoryIcon(item.category)} size={16} color="#666" />
              <Text style={styles.detailText}>
                {item.category.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="flag" size={16} color={getPriorityColor(item.priority)} />
              <Text style={[styles.detailText, { color: getPriorityColor(item.priority) }]}>
                {item.priority.toUpperCase()} PRIORITY
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatDate(item.createdAt)} at {formatTime(item.createdAt)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="report-problem" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>No complaints found</Text>
      <Text style={styles.emptyStateSubtext}>
        Submit your first complaint to get started
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search complaints..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredComplaints}
        renderItem={renderComplaintItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateComplaint')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 20,
    elevation: 2,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  complaintCard: {
    marginBottom: 15,
    elevation: 3,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  complaintInfo: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  complaintDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});