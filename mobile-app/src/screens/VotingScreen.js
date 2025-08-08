import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Dialog,
  Portal,
  TextInput,
  RadioButton,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { votingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

export default function VotingScreen({ navigation }) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voteDialog, setVoteDialog] = useState({
    visible: false,
    complaint: null,
    vote: '',
    reason: '',
    submitting: false,
  });

  useEffect(() => {
    fetchVotingComplaints();
  }, []);

  const fetchVotingComplaints = async () => {
    try {
      setLoading(true);
      const response = await votingAPI.getVotingComplaints();
      if (response.data.success) {
        setComplaints(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching voting complaints:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load voting complaints',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVotingComplaints();
    setRefreshing(false);
  };

  const openVoteDialog = (complaint) => {
    setVoteDialog({
      visible: true,
      complaint,
      vote: '',
      reason: '',
      submitting: false,
    });
  };

  const closeVoteDialog = () => {
    setVoteDialog({
      visible: false,
      complaint: null,
      vote: '',
      reason: '',
      submitting: false,
    });
  };

  const submitVote = async () => {
    if (!voteDialog.vote) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select your vote',
      });
      return;
    }

    try {
      setVoteDialog(prev => ({ ...prev, submitting: true }));

      const voteData = {
        vote: voteDialog.vote,
        reason: voteDialog.reason.trim(),
      };

      const response = await votingAPI.submitVote(voteDialog.complaint._id, voteData);
      
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your vote has been submitted successfully',
        });
        
        // Remove the complaint from the list since user has voted
        setComplaints(prev => prev.filter(c => c._id !== voteDialog.complaint._id));
        closeVoteDialog();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit vote';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setVoteDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'gate_pass': return 'exit-to-app';
      case 'system_issue': return 'bug-report';
      case 'security': return 'security';
      default: return 'help-outline';
    }
  };

  const isVotingExpired = (deadline) => {
    return new Date() > new Date(deadline);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="hourglass-empty" size={50} color="#6200EE" />
        <Text style={styles.loadingText}>Loading voting complaints...</Text>
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
          <MaterialIcons name="how-to-vote" size={32} color="#6200EE" />
          <Text style={styles.headerTitle}>Student Voting</Text>
          <Text style={styles.headerSubtitle}>
            Vote on complaints that require student community input
          </Text>
        </View>

        {complaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="ballot" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Active Voting</Text>
            <Text style={styles.emptyText}>
              There are no complaints currently open for voting.
            </Text>
          </View>
        ) : (
          complaints.map((complaint) => (
            <Card key={complaint._id} style={styles.complaintCard}>
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
                  <Chip 
                    style={[styles.priorityChip, { backgroundColor: getPriorityColor(complaint.priority) }]}
                    textStyle={styles.priorityText}
                  >
                    {complaint.priority.toUpperCase()}
                  </Chip>
                </View>

                {/* Complaint Details */}
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="person" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {complaint.studentName} ({complaint.studentUSN})
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialIcons name="business" size={16} color="#666" />
                    <Text style={styles.detailText}>{complaint.department}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialIcons name="schedule" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Deadline: {formatDate(complaint.votingDeadline)}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Paragraph style={styles.description} numberOfLines={3}>
                  {complaint.description}
                </Paragraph>

                {/* Voting Summary */}
                {complaint.votingSummary && complaint.votingSummary.totalVotes > 0 && (
                  <View style={styles.votingSummary}>
                    <Text style={styles.votingSummaryTitle}>Current Votes:</Text>
                    <View style={styles.voteStats}>
                      <View style={styles.voteStat}>
                        <Text style={styles.voteCount}>{complaint.votingSummary.acceptVotes}</Text>
                        <Text style={styles.voteLabel}>Accept</Text>
                      </View>
                      <View style={styles.voteStat}>
                        <Text style={styles.voteCount}>{complaint.votingSummary.rejectVotes}</Text>
                        <Text style={styles.voteLabel}>Reject</Text>
                      </View>
                      <View style={styles.voteStat}>
                        <Text style={styles.voteCount}>{complaint.votingSummary.totalVotes}</Text>
                        <Text style={styles.voteLabel}>Total</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Action Button */}
                <View style={styles.actionContainer}>
                  {isVotingExpired(complaint.votingDeadline) ? (
                    <Button 
                      mode="outlined" 
                      disabled
                      style={styles.expiredButton}
                    >
                      Voting Expired
                    </Button>
                  ) : (
                    <Button 
                      mode="contained" 
                      onPress={() => openVoteDialog(complaint)}
                      style={styles.voteButton}
                      icon="how-to-vote"
                    >
                      Cast Your Vote
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Vote Dialog */}
      <Portal>
        <Dialog visible={voteDialog.visible} onDismiss={closeVoteDialog}>
          <Dialog.Title>Cast Your Vote</Dialog.Title>
          <Dialog.Content>
            {voteDialog.complaint && (
              <>
                <Text style={styles.dialogComplaintTitle}>
                  {voteDialog.complaint.title}
                </Text>
                <Text style={styles.dialogQuestion}>
                  Do you agree with this complaint?
                </Text>
                
                <RadioButton.Group
                  onValueChange={(value) => setVoteDialog(prev => ({ ...prev, vote: value }))}
                  value={voteDialog.vote}
                >
                  <View style={styles.radioOption}>
                    <RadioButton value="accept" />
                    <Text style={styles.radioLabel}>Accept - I agree with this complaint</Text>
                  </View>
                  <View style={styles.radioOption}>
                    <RadioButton value="reject" />
                    <Text style={styles.radioLabel}>Reject - I disagree with this complaint</Text>
                  </View>
                </RadioButton.Group>

                <TextInput
                  label="Reason (Optional)"
                  value={voteDialog.reason}
                  onChangeText={(text) => setVoteDialog(prev => ({ ...prev, reason: text }))}
                  multiline
                  numberOfLines={3}
                  style={styles.reasonInput}
                  placeholder="Explain your vote (optional)"
                />
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeVoteDialog} disabled={voteDialog.submitting}>
              Cancel
            </Button>
            <Button 
              onPress={submitVote} 
              loading={voteDialog.submitting}
              disabled={!voteDialog.vote || voteDialog.submitting}
            >
              Submit Vote
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
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
    elevation: 4,
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
  complaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  priorityChip: {
    height: 28,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    lineHeight: 20,
  },
  votingSummary: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  votingSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  voteStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  voteStat: {
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  voteLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionContainer: {
    marginTop: 8,
  },
  voteButton: {
    backgroundColor: '#6200EE',
  },
  expiredButton: {
    borderColor: '#ccc',
  },
  dialogComplaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dialogQuestion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  reasonInput: {
    marginTop: 16,
  },
});