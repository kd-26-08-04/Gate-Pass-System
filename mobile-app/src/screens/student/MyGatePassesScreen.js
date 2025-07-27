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
import { gatePassAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function MyGatePassesScreen({ navigation }) {
  const [gatePasses, setGatePasses] = useState([]);
  const [filteredGatePasses, setFilteredGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGatePasses();
  }, []);

  useEffect(() => {
    filterGatePasses();
  }, [searchQuery, gatePasses]);

  const fetchGatePasses = async () => {
    try {
      const response = await gatePassAPI.getMyGatePasses();
      if (response.data.success) {
        setGatePasses(response.data.gatePasses);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch gate passes',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterGatePasses = () => {
    if (!searchQuery) {
      setFilteredGatePasses(gatePasses);
      return;
    }

    const filtered = gatePasses.filter(
      (gp) =>
        gp.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gp.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gp.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGatePasses(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGatePasses();
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
            <View style={styles.gatePassInfo}>
              <Text style={styles.destination}>{item.destination}</Text>
              <Text style={styles.reason}>{item.reason}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Chip
                icon={getStatusIcon(item.status)}
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.statusText}
              >
                {item.status.toUpperCase()}
              </Chip>
            </View>
          </View>
          
          <View style={styles.gatePassDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name="exit-to-app" size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatDate(item.exitTime)} at {formatTime(item.exitTime)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="keyboard-return" size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatDate(item.expectedReturnTime)} at {formatTime(item.expectedReturnTime)}
              </Text>
            </View>
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
        Create your first gate pass to get started
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search gate passes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

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

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateGatePass')}
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
  gatePassCard: {
    marginBottom: 15,
    elevation: 3,
  },
  gatePassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  gatePassInfo: {
    flex: 1,
    marginRight: 10,
  },
  destination: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reason: {
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
  gatePassDetails: {
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