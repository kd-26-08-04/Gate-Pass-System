import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Searchbar,
  FAB,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { complaintAPI, votingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

export default function ComplaintListScreen({ navigation, route }) {
  const { user } = useAuth();
  const isDean = route?.params?.isDean || false;
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, resolved, voting

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchQuery, filter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user.userType === 'student') {
        response = await complaintAPI.getMyComplaints();
      } else {
        response = await complaintAPI.getAllComplaints();
      }
      
      if (response.data.success) {
        setComplaints(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load complaints',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.studentUSN.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(c => c.status === 'pending');
        break;
      case 'resolved':
        filtered = filtered.filter(c => c.status === 'resolved');
        break;
      case 'voting':
        filtered = filtered.filter(c => c.requiresVoting || c.votingEnabled);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredComplaints(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  const handleComplaintPress = (complaint) => {
    navigation.navigate('ComplaintDetail', { 
      complaintId: complaint._id,
      isDean 
    });
  };

  const handleEnableVoting = async (complaintId) => {
    try {
      const votingDeadline = new Date();
      votingDeadline.setDate(votingDeadline.getDate() + 7); // 7 days from now

      const response = await votingAPI.enableVoting(complaintId, {
        votingDeadline: votingDeadline.toISOString()
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Voting enabled for complaint',
        });
        fetchComplaints(); // Refresh the list
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to enable voting';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="hourglass-empty" size={50} color="#6200EE" />
        <Text style={styles.loadingText}>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search complaints..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip
          selected={filter === 'pending'}
          onPress={() => setFilter('pending')}
          style={styles.filterChip}
        >
          Pending
        </Chip>
        <Chip
          selected={filter === 'resolved'}
          onPress={() => setFilter('resolved')}
          style={styles.filterChip}
        >
          Resolved
        </Chip>
        <Chip
          selected={filter === 'voting'}
          onPress={() => setFilter('voting')}
          style={styles.filterChip}
        >
          Voting
        </Chip>
      </ScrollView>

      {/* Complaints List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredComplaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Complaints Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No complaints have been submitted yet'
              }
            </Text>
          </View>
        ) : (
          filteredComplaints.map((complaint) => (
            <Card 
              key={complaint._id} 
              style={styles.complaintCard}
              onPress={() => handleComplaintPress(complaint)}
            >
              <Card.Content>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <MaterialIcons 
                      name={getCategoryIcon(complaint.category)} 
                      size={24} 
                      color="#6200EE" 
                    />
                    <Title style={styles.complaintTitle} numberOfLines={2}>
                      {complaint.title}
                    </Title>
                  </View>
                  <View style={styles.cardHeaderRight}>
                    <Chip 
                      style={[styles.priorityChip, { backgroundColor: getPriorityColor(complaint.priority) }]}
                      textStyle={styles.chipText}
                      compact
                    >
                      {complaint.priority.toUpperCase()}
                    </Chip>
                  </View>
                </View>

                {/* Student Info */}
                <View style={styles.studentInfo}>
                  <MaterialIcons name="person" size={16} color="#666" />
                  <Text style={styles.studentText}>
                    {complaint.studentName} ({complaint.studentUSN})
                  </Text>
                  <Text style={styles.departmentText}>
                    • {complaint.department}
                  </Text>
                </View>

                {/* Description */}
                <Paragraph style={styles.description} numberOfLines={2}>
                  {complaint.description}
                </Paragraph>

                {/* Status and Date */}
                <View style={styles.footer}>
                  <View style={styles.footerLeft}>
                    <Chip 
                      style={[styles.statusChip, { backgroundColor: getStatusColor(complaint.status) }]}
                      textStyle={styles.chipText}
                      compact
                    >
                      {complaint.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                    {complaint.requiresVoting && (
                      <Chip 
                        style={[styles.votingChip, { backgroundColor: '#7B1FA2' }]}
                        textStyle={styles.chipText}
                        compact
                      >
                        VOTING
                      </Chip>
                    )}
                  </View>
                  <Text style={styles.dateText}>
                    {formatDate(complaint.createdAt)}
                  </Text>
                </View>

                {/* Voting Summary */}
                {complaint.votingSummary && complaint.votingSummary.totalVotes > 0 && (
                  <View style={styles.votingSummary}>
                    <Text style={styles.votingSummaryText}>
                      Votes: {complaint.votingSummary.totalVotes} • 
                      Accept: {complaint.votingSummary.acceptPercentage}% • 
                      Reject: {complaint.votingSummary.rejectPercentage}%
                    </Text>
                  </View>
                )}

                {/* HOD Actions */}
                {user.userType === 'hod' && complaint.status === 'pending' && !complaint.requiresVoting && (
                  <View style={styles.actionContainer}>
                    <Button
                      mode="outlined"
                      onPress={() => handleEnableVoting(complaint._id)}
                      style={styles.actionButton}
                      icon="how-to-vote"
                      compact
                    >
                      Enable Voting
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* FAB for creating new complaint (students only) */}
      {user.userType === 'student' && (
        <FAB
          style={styles.fab}
          icon="add"
          onPress={() => navigation.navigate('CreateComplaint')}
        />
      )}
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
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  filterContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  complaintCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  priorityChip: {
    height: 24,
  },
  chipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  departmentText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    height: 24,
    marginRight: 8,
  },
  votingChip: {
    height: 24,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  votingSummary: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  votingSummaryText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  actionButton: {
    borderColor: '#7B1FA2',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
});