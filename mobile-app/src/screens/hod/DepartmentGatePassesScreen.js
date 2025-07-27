import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Card, Chip, Searchbar, SegmentedButtons } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { gatePassAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function DepartmentGatePassesScreen({ navigation }) {
  const [gatePasses, setGatePasses] = useState([]);
  const [filteredGatePasses, setFilteredGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  useEffect(() => {
    fetchDepartmentGatePasses();
  }, []);

  useEffect(() => {
    filterGatePasses();
  }, [searchQuery, selectedStatus, gatePasses]);

  const fetchDepartmentGatePasses = async () => {
    try {
      const response = await gatePassAPI.getDepartmentGatePasses();
      if (response.data.success) {
        setGatePasses(response.data.gatePasses);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch department gate passes',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterGatePasses = () => {
    let filtered = gatePasses;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(gp => gp.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (gp) =>
          gp.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gp.studentUSN.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gp.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gp.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredGatePasses(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDepartmentGatePasses();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'expired':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'approved':
        return 'check-circle';
      case 'rejected':
        return 'cancel';
      case 'expired':
        return 'schedule';
      default:
        return 'help';
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

  const renderGatePassItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('GatePassDetail', { gatePassId: item._id })}
    >
      <Card style={styles.gatePassCard}>
        <Card.Content>
          <View style={styles.gatePassHeader}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.studentName}</Text>
              <Text style={styles.studentUSN}>{item.studentUSN}</Text>
            </View>
            <Chip
              icon={getStatusIcon(item.status)}
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusText}
            >
              {item.status.toUpperCase()}
            </Chip>
          </View>

          <View style={styles.gatePassDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name="place" size={16} color="#666" />
              <Text style={styles.detailText}>{item.destination}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="info" size={16} color="#666" />
              <Text style={styles.detailText}>{item.reason}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="exit-to-app" size={16} color="#666" />
              <Text style={styles.detailText}>
                Exit: {formatDate(item.exitTime)} at {formatTime(item.exitTime)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="keyboard-return" size={16} color="#666" />
              <Text style={styles.detailText}>
                Return: {formatDate(item.expectedReturnTime)} at {formatTime(item.expectedReturnTime)}
              </Text>
            </View>
          </View>

          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              Created: {formatDate(item.createdAt)}
            </Text>
            {item.approvedBy && (
              <Text style={styles.metaText}>
                Approved on: {formatDate(item.approvalDate)}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="assignment" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>No gate passes found</Text>
      <Text style={styles.emptyStateSubtext}>
        {selectedStatus === 'all' 
          ? 'No gate passes from your department yet'
          : `No ${selectedStatus} gate passes found`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Search by student name, USN, destination..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <SegmentedButtons
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          buttons={statusOptions}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={filteredGatePasses}
        renderItem={renderGatePassItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    padding: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchBar: {
    marginBottom: 15,
  },
  segmentedButtons: {
    marginBottom: 10,
  },
  listContainer: {
    padding: 20,
  },
  gatePassCard: {
    marginBottom: 15,
    elevation: 3,
  },
  gatePassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  studentUSN: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gatePassDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  metaInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
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
});