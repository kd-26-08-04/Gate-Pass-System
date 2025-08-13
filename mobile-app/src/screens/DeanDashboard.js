import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  DataTable,
  ProgressBar,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import NotificationIcon from '../components/NotificationIcon';

const { width } = Dimensions.get('window');

export default function DeanDashboard({ navigation }) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    votingComplaints: 0,
    pendingResponse: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDeanData();
  }, []);

  const fetchDeanData = async () => {
    try {
      setLoading(true);
      
      // Fetch dean-relevant complaints directly from backend endpoint
      const complaintsResponse = await complaintAPI.getDeanComplaints();
      if (complaintsResponse.data.success) {
        const deanComplaints = complaintsResponse.data.data || [];
        setComplaints(deanComplaints);
        
        // Calculate stats
        const votingComplaints = deanComplaints.filter(c => c.requiresVoting).length;
        const pendingResponse = deanComplaints.filter(c => c.sentToDean && !c.deanResponse).length;
        const resolved = deanComplaints.filter(c => c.status === 'resolved').length;
        
        setStats({
          totalComplaints: deanComplaints.length,
          votingComplaints,
          pendingResponse,
          resolved,
        });
      }
    } catch (error) {
      console.error('Error fetching dean data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load dean dashboard data',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeanData();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'closed': return '#757575';
      default: return '#757575';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'gate_pass': return 'exit-to-app';
      case 'system_issue': return 'bug-report';
      case 'security': return 'security';
      default: return 'help-outline';
    }
  };

  const handleComplaintPress = (complaint) => {
    navigation.navigate('ComplaintDetail', { 
      complaintId: complaint._id,
      isDean: true 
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="hourglass-empty" size={50} color="#6200EE" />
        <Text style={styles.loadingText}>Loading Dean Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <MaterialIcons name="account-balance" size={32} color="#fff" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Dean Dashboard</Text>
                <Text style={styles.headerSubtitle}>
                  College Complaint Management & Oversight
                </Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <NotificationIcon style={styles.headerIcon} navigation={navigation} />
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Card style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <Card.Content style={styles.statContent}>
                <MaterialIcons name="assignment" size={32} color="#1976D2" />
                <Text style={styles.statNumber}>{stats.totalComplaints}</Text>
                <Text style={styles.statLabel}>Total Complaints</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
              <Card.Content style={styles.statContent}>
                <MaterialIcons name="how-to-vote" size={32} color="#7B1FA2" />
                <Text style={styles.statNumber}>{stats.votingComplaints}</Text>
                <Text style={styles.statLabel}>Voting Active</Text>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.statsRow}>
            <Card style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
              <Card.Content style={styles.statContent}>
                <MaterialIcons name="pending-actions" size={32} color="#F57C00" />
                <Text style={styles.statNumber}>{stats.pendingResponse}</Text>
                <Text style={styles.statLabel}>Pending Response</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
              <Card.Content style={styles.statContent}>
                <MaterialIcons name="check-circle" size={32} color="#388E3C" />
                <Text style={styles.statNumber}>{stats.resolved}</Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Resolution Progress */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Title style={styles.progressTitle}>Resolution Progress</Title>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {stats.totalComplaints > 0 
                  ? Math.round((stats.resolved / stats.totalComplaints) * 100)
                  : 0}% Resolved
              </Text>
              <ProgressBar 
                progress={stats.totalComplaints > 0 ? stats.resolved / stats.totalComplaints : 0}
                color="#4CAF50"
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Recent Complaints */}
        <Card style={styles.complaintsCard}>
          <Card.Content>
            <View style={styles.complaintsHeader}>
              <Title style={styles.complaintsTitle}>Recent Complaints</Title>
              <Button 
                mode="outlined" 
                compact
                onPress={() => navigation.navigate('Complaints', { isDean: true })}
              >
                View All
              </Button>
            </View>

            {complaints.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="inbox" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No complaints to review</Text>
              </View>
            ) : (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Complaint</DataTable.Title>
                  <DataTable.Title>Priority</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Date</DataTable.Title>
                </DataTable.Header>

                {complaints.slice(0, 5).map((complaint) => (
                  <DataTable.Row 
                    key={complaint._id}
                    onPress={() => handleComplaintPress(complaint)}
                  >
                    <DataTable.Cell>
                      <View style={styles.complaintCell}>
                        <MaterialIcons 
                          name={getCategoryIcon(complaint.category)} 
                          size={16} 
                          color="#666" 
                        />
                        <Text style={styles.complaintTitle} numberOfLines={1}>
                          {complaint.title}
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip 
                        style={[styles.priorityChip, { backgroundColor: getPriorityColor(complaint.priority) }]}
                        textStyle={styles.chipText}
                        compact
                      >
                        {complaint.priority.toUpperCase()}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip 
                        style={[styles.statusChip, { backgroundColor: getStatusColor(complaint.status) }]}
                        textStyle={styles.chipText}
                        compact
                      >
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text style={styles.dateText}>
                        {formatDate(complaint.createdAt)}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            )}
          </Card.Content>
        </Card>

        {/* Voting Summary */}
        {complaints.filter(c => c.requiresVoting).length > 0 && (
          <Card style={styles.votingCard}>
            <Card.Content>
              <Title style={styles.votingTitle}>Active Voting Complaints</Title>
              {complaints
                .filter(c => c.requiresVoting && c.votingEnabled)
                .slice(0, 3)
                .map((complaint) => (
                  <View key={complaint._id} style={styles.votingItem}>
                    <View style={styles.votingHeader}>
                      <Text style={styles.votingComplaintTitle} numberOfLines={1}>
                        {complaint.title}
                      </Text>
                      <Text style={styles.votingDeadline}>
                        Deadline: {formatDate(complaint.votingDeadline)}
                      </Text>
                    </View>
                    
                    {complaint.votingSummary && (
                      <View style={styles.votingStats}>
                        <View style={styles.votingStat}>
                          <Text style={styles.voteCount}>
                            {complaint.votingSummary.totalVotes}
                          </Text>
                          <Text style={styles.voteLabel}>Total Votes</Text>
                        </View>
                        <View style={styles.votingStat}>
                          <Text style={[styles.voteCount, { color: '#4CAF50' }]}>
                            {complaint.votingSummary.acceptPercentage}%
                          </Text>
                          <Text style={styles.voteLabel}>Accept</Text>
                        </View>
                        <View style={styles.votingStat}>
                          <Text style={[styles.voteCount, { color: '#F44336' }]}>
                            {complaint.votingSummary.rejectPercentage}%
                          </Text>
                          <Text style={styles.voteLabel}>Reject</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.actionsTitle}>Quick Actions</Title>
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                icon="assignment"
                onPress={() => navigation.navigate('Complaints', { isDean: true })}
                style={[styles.actionButton, { backgroundColor: '#1976D2' }]}
              >
                Review All Complaints
              </Button>
              
              <Button
                mode="contained"
                icon="how-to-vote"
                onPress={() => navigation.navigate('Voting')}
                style={[styles.actionButton, { backgroundColor: '#7B1FA2' }]}
              >
                View Voting Results
              </Button>
              
              <Button
                mode="contained"
                icon="analytics"
                onPress={() => navigation.navigate('ComplaintAnalytics')}
                style={[styles.actionButton, { backgroundColor: '#388E3C' }]}
              >
                View Analytics
              </Button>
            </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1976D2',
    padding: 20,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BBDEFB',
    marginTop: 4,
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
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  progressCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
  },
  complaintsCard: {
    margin: 16,
    elevation: 2,
  },
  complaintsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  complaintsTitle: {
    fontSize: 18,
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  complaintCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  complaintTitle: {
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  priorityChip: {
    height: 24,
  },
  statusChip: {
    height: 24,
  },
  chipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  votingCard: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#FFF8E1',
  },
  votingTitle: {
    fontSize: 18,
    color: '#F57C00',
    marginBottom: 16,
  },
  votingItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  votingHeader: {
    marginBottom: 8,
  },
  votingComplaintTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  votingDeadline: {
    fontSize: 12,
    color: '#F57C00',
    marginTop: 2,
  },
  votingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  votingStat: {
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  voteLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  actionsCard: {
    margin: 16,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
  },
});