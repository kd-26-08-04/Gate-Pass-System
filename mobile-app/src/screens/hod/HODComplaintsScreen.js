import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, Chip, Button, Searchbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { complaintAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function HODComplaintsScreen({ navigation }) {
  const { user } = useAuth();
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
  }, [complaints, searchQuery]);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getAllComplaints();
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
    let filtered = complaints;

    // Filter by search query only
    if (searchQuery) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.studentUSN.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Department Complaints</Text>
        <Text style={styles.headerSubtitle}>{user.department}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search complaints..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>



      <ScrollView
        style={styles.complaintsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredComplaints.length === 0 ? (
          <View style={styles.noDataContainer}>
            <MaterialIcons name="inbox" size={64} color="#ccc" />
            <Text style={styles.noDataText}>
              {searchQuery 
                ? 'No complaints match your search' 
                : 'No complaints found for your department'
              }
            </Text>
          </View>
        ) : (
          filteredComplaints.map((complaint) => (
            <Card key={complaint._id} style={styles.complaintCard}>
              <Card.Content>
                <View style={styles.complaintHeader}>
                  <View style={styles.complaintInfo}>
                    <Text style={styles.complaintTitle}>{complaint.title}</Text>
                    <Text style={styles.studentInfo}>
                      {complaint.studentName} ({complaint.studentUSN})
                    </Text>
                  </View>
                  <View style={styles.badges}>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(complaint.status) }]}
                      textStyle={styles.chipText}
                    >
                      {complaint.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                    <Chip
                      style={[styles.priorityChip, { backgroundColor: getPriorityColor(complaint.priority) }]}
                      textStyle={styles.chipText}
                    >
                      {complaint.priority.toUpperCase()}
                    </Chip>
                  </View>
                </View>

                <Text style={styles.complaintDescription} numberOfLines={2}>
                  {complaint.description}
                </Text>

                <View style={styles.complaintMeta}>
                  <Text style={styles.categoryText}>
                    Category: {complaint.category.replace('_', ' ')}
                  </Text>
                  <Text style={styles.dateText}>
                    {formatDate(complaint.createdAt)}
                  </Text>
                </View>

                {complaint.openToAll && (
                  <View style={styles.votingInfo}>
                    <MaterialIcons name="how-to-vote" size={16} color="#6200EE" />
                    <Text style={styles.votingText}>Open for voting</Text>
                    {complaint.votingSummary?.totalVotes > 0 && (
                      <Text style={styles.voteCount}>
                        ({complaint.votingSummary.totalVotes} votes)
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('ComplaintDetail', { complaintId: complaint._id })}
                    style={styles.actionButton}
                  >
                    View Details
                  </Button>
                  {complaint.status === 'pending' && (
                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('ComplaintDetail', { 
                        complaintId: complaint._id,
                        action: 'respond'
                      })}
                      style={styles.actionButton}
                    >
                      Respond
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
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
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  searchContainer: {
    padding: 15,
  },
  searchbar: {
    elevation: 2,
  },

  complaintsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
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
  complaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  studentInfo: {
    fontSize: 14,
    color: '#666',
  },
  badges: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 24,
    marginBottom: 5,
  },
  priorityChip: {
    height: 24,
  },
  chipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  complaintDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  complaintMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  votingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f3e5f5',
    borderRadius: 5,
  },
  votingText: {
    fontSize: 12,
    color: '#6200EE',
    marginLeft: 5,
    fontWeight: '500',
  },
  voteCount: {
    fontSize: 12,
    color: '#6200EE',
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});