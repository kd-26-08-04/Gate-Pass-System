import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, FAB, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { gatePassAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function StudentDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentGatePasses, setRecentGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await gatePassAPI.getMyGatePasses();
      
      if (response.data.success) {
        const gatePasses = response.data.gatePasses;
        
        // Calculate stats
        const stats = {
          total: gatePasses.length,
          pending: gatePasses.filter(gp => gp.status === 'pending').length,
          approved: gatePasses.filter(gp => gp.status === 'approved').length,
          rejected: gatePasses.filter(gp => gp.status === 'rejected').length,
        };
        
        setStats(stats);
        setRecentGatePasses(gatePasses.slice(0, 5)); // Show only recent 5
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch dashboard data',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user.name}</Text>
          <Text style={styles.deptText}>{user.department}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <Card style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <Card.Content style={styles.statContent}>
                <MaterialIcons name="assignment" size={24} color="#1976D2" />
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
              <Card.Content style={styles.statContent}>
                <MaterialIcons name="pending" size={24} color="#F57C00" />
                <Text style={styles.statNumber}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
              <Card.Content style={styles.statContent}>
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                <Text style={styles.statNumber}>{stats.approved}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
              <Card.Content style={styles.statContent}>
                <MaterialIcons name="cancel" size={24} color="#F44336" />
                <Text style={styles.statNumber}>{stats.rejected}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        <Card style={styles.recentCard}>
          <Card.Content>
            <Title>Recent Gate Passes</Title>
            {recentGatePasses.length === 0 ? (
              <Paragraph style={styles.noDataText}>
                No gate passes found. Create your first gate pass!
              </Paragraph>
            ) : (
              recentGatePasses.map((gatePass) => (
                <TouchableOpacity
                  key={gatePass._id}
                  style={styles.gatePassItem}
                  onPress={() => navigation.navigate('GatePassDetail', { gatePassId: gatePass._id })}
                >
                  <View style={styles.gatePassHeader}>
                    <Text style={styles.gatePassDestination}>{gatePass.destination}</Text>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(gatePass.status) }]}
                      textStyle={styles.statusText}
                    >
                      {gatePass.status.toUpperCase()}
                    </Chip>
                  </View>
                  <Text style={styles.gatePassReason}>{gatePass.reason}</Text>
                  <Text style={styles.gatePassDate}>
                    Exit: {formatDate(gatePass.exitTime)} at {formatTime(gatePass.exitTime)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
            
            {recentGatePasses.length > 0 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('MyPasses')}
              >
                <Text style={styles.viewAllText}>View All Gate Passes</Text>
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="New Gate Pass"
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#6200EE',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  nameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  deptText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  statsContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 15,
    elevation: 3,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  recentCard: {
    margin: 20,
    marginTop: 0,
    elevation: 3,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  gatePassItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 15,
  },
  gatePassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  gatePassDestination: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gatePassReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  gatePassDate: {
    fontSize: 12,
    color: '#999',
  },
  viewAllButton: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});