import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { gatePassAPI, complaintAPI } from '../../services/api';
import Toast from 'react-native-toast-message';
import MessageIcon from '../../components/MessageIcon';
import NotificationIcon from '../../components/NotificationIcon';

export default function HODDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
  });
  const [complaintStats, setComplaintStats] = useState({
    total: 0,
  });
  const [recentGatePasses, setRecentGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [pendingResponse, departmentResponse, complaintsResponse] = await Promise.all([
        gatePassAPI.getPendingGatePasses(),
        gatePassAPI.getDepartmentGatePasses(),
        complaintAPI.getAllComplaints(),
      ]);

      if (pendingResponse.data.success && departmentResponse.data.success) {
        const allGatePasses = departmentResponse.data.gatePasses;
        
        // Calculate gate pass stats
        const stats = {
          total: allGatePasses.length,
          pending: allGatePasses.filter(gp => gp.status === 'pending').length,
          approved: allGatePasses.filter(gp => gp.status === 'approved').length,
          rejected: allGatePasses.filter(gp => gp.status === 'rejected').length,
          expired: allGatePasses.filter(gp => gp.status === 'expired').length,
        };
        
        setStats(stats);
        setRecentGatePasses(allGatePasses.slice(0, 5));
      }

      // Calculate complaint stats
      if (complaintsResponse.data.success) {
        const allComplaints = complaintsResponse.data.complaints;
        const complaintStats = {
          total: allComplaints.length,
        };
        setComplaintStats(complaintStats);
      }
    } catch (error) {
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
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.nameText}>{user.name}</Text>
              <Text style={styles.deptText}>HOD - {user.department}</Text>
            </View>
            <View style={styles.headerIcons}>
              <MessageIcon style={styles.headerIcon} />
              <NotificationIcon style={styles.headerIcon} navigation={navigation} />
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Gate Pass Statistics</Text>
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
                <MaterialIcons name="pending-actions" size={24} color="#F57C00" />
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

          <Text style={styles.sectionTitle}>Complaint Statistics</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}
              onPress={() => navigation.navigate('HODComplaints')}
            >
              <Card.Content style={styles.statContent}>
                <MaterialIcons name="report-problem" size={24} color="#9910b4ff" />
                <Text style={styles.statNumber}>{complaintStats.total}</Text>
                <Text style={styles.statLabel}>Total Complaints</Text>
              </Card.Content>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Pending')}
          >
            <MaterialIcons name="pending-actions" size={32} color="#fff" />
            <Text style={styles.actionButtonText}>Pending Approvals</Text>
            <Text style={styles.actionButtonSubtext}>{stats.pending} waiting</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Department')}
          >
            <MaterialIcons name="domain" size={32} color="#fff" />
            <Text style={styles.actionButtonText}>Department Passes</Text>
            <Text style={styles.actionButtonSubtext}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
            onPress={() => navigation.navigate('HODComplaints')}
          >
            <MaterialIcons name="report-problem" size={32} color="#fff" />
            <Text style={styles.actionButtonText}>View Complaints</Text>
            <Text style={styles.actionButtonSubtext}>{complaintStats.total} total</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('HODComplaints')}
          >
            <MaterialIcons name="assignment" size={32} color="#fff" />
            <Text style={styles.actionButtonText}>Manage Complaints</Text>
            <Text style={styles.actionButtonSubtext}>Review & respond</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.recentCard}>
          <Card.Content>
            <Title>Recent Gate Passes</Title>
            {recentGatePasses.length === 0 ? (
              <Paragraph style={styles.noDataText}>
                No gate passes found for your department.
              </Paragraph>
            ) : (
              recentGatePasses.map((gatePass) => (
                <TouchableOpacity
                  key={gatePass._id}
                  style={styles.gatePassItem}
                  onPress={() => navigation.navigate('GatePassDetail', { gatePassId: gatePass._id })}
                >
                  <View style={styles.gatePassHeader}>
                    <View style={styles.gatePassInfo}>
                      <Text style={styles.studentName}>{gatePass.studentName}</Text>
                      <Text style={styles.destination}>{gatePass.destination}</Text>
                    </View>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(gatePass.status) }]}
                      textStyle={styles.statusText}
                    >
                      {gatePass.status.toUpperCase()}
                    </Chip>
                  </View>
                  <Text style={styles.gatePassReason}>{gatePass.reason}</Text>
                  <Text style={styles.gatePassDate}>
                    {formatDate(gatePass.exitTime)} at {formatTime(gatePass.exitTime)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#6200EE',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '48%',
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  actionButtonSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 5,
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
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  gatePassInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  destination: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
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
});