import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Button, Chip, TextInput, Modal, Portal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { gatePassAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function PendingApprovalsScreen({ navigation }) {
  const [pendingGatePasses, setPendingGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedGatePass, setSelectedGatePass] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingGatePasses();
  }, []);

  const fetchPendingGatePasses = async () => {
    try {
      const response = await gatePassAPI.getPendingGatePasses();
      if (response.data.success) {
        setPendingGatePasses(response.data.gatePasses);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch pending gate passes',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingGatePasses();
  };

  const handleApprove = async (gatePassId) => {
    Alert.alert(
      'Approve Gate Pass',
      'Are you sure you want to approve this gate pass?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setProcessingId(gatePassId);
            try {
              const response = await gatePassAPI.approveGatePass(gatePassId);
              if (response.data.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Gate pass approved successfully',
                });
                fetchPendingGatePasses();
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to approve gate pass',
              });
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = (gatePass) => {
    setSelectedGatePass(gatePass);
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please provide a reason for rejection',
      });
      return;
    }

    setProcessingId(selectedGatePass._id);
    try {
      const response = await gatePassAPI.rejectGatePass(selectedGatePass._id, rejectionReason);
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Gate pass rejected successfully',
        });
        fetchPendingGatePasses();
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedGatePass(null);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to reject gate pass',
      });
    } finally {
      setProcessingId(null);
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
    <Card style={styles.gatePassCard}>
      <Card.Content>
        <View style={styles.gatePassHeader}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.studentUSN}>{item.studentUSN}</Text>
          </View>
          <Chip
            icon="pending"
            style={styles.pendingChip}
            textStyle={styles.pendingText}
          >
            PENDING
          </Chip>
        </View>

        <View style={styles.gatePassDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="place" size={16} color="#666" />
            <Text style={styles.detailLabel}>Destination:</Text>
            <Text style={styles.detailValue}>{item.destination}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="info" size={16} color="#666" />
            <Text style={styles.detailLabel}>Reason:</Text>
            <Text style={styles.detailValue}>{item.reason}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="exit-to-app" size={16} color="#666" />
            <Text style={styles.detailLabel}>Exit Time:</Text>
            <Text style={styles.detailValue}>
              {formatDate(item.exitTime)} at {formatTime(item.exitTime)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="keyboard-return" size={16} color="#666" />
            <Text style={styles.detailLabel}>Return Time:</Text>
            <Text style={styles.detailValue}>
              {formatDate(item.expectedReturnTime)} at {formatTime(item.expectedReturnTime)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={16} color="#666" />
            <Text style={styles.detailLabel}>Emergency:</Text>
            <Text style={styles.detailValue}>{item.emergencyContact}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="family-restroom" size={16} color="#666" />
            <Text style={styles.detailLabel}>Parent:</Text>
            <Text style={styles.detailValue}>{item.parentContact}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={() => handleApprove(item._id)}
            style={[styles.actionButton, styles.approveButton]}
            loading={processingId === item._id}
            disabled={processingId !== null}
            icon="check"
          >
            Approve
          </Button>
          <Button
            mode="contained"
            onPress={() => handleReject(item)}
            style={[styles.actionButton, styles.rejectButton]}
            loading={processingId === item._id}
            disabled={processingId !== null}
            icon="close"
          >
            Reject
          </Button>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => navigation.navigate('GatePassDetail', { gatePassId: item._id })}
        >
          <Text style={styles.viewDetailsText}>View Full Details</Text>
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
      <Text style={styles.emptyStateText}>No pending approvals</Text>
      <Text style={styles.emptyStateSubtext}>
        All gate passes have been processed
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingGatePasses}
        renderItem={renderGatePassItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <Portal>
        <Modal
          visible={showRejectModal}
          onDismiss={() => setShowRejectModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Reject Gate Pass</Text>
          <Text style={styles.modalSubtitle}>
            Student: {selectedGatePass?.studentName}
          </Text>
          <TextInput
            label="Reason for Rejection *"
            value={rejectionReason}
            onChangeText={setRejectionReason}
            mode="outlined"
            style={styles.rejectionInput}
            multiline
            numberOfLines={4}
            placeholder="Please provide a clear reason for rejection..."
          />
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={submitRejection}
              style={[styles.modalButton, styles.rejectButton]}
              loading={processingId !== null}
            >
              Reject
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 20,
  },
  gatePassCard: {
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  studentUSN: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  pendingChip: {
    backgroundColor: '#FFA500',
    height: 28,
  },
  pendingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gatePassDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  viewDetailsButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  viewDetailsText: {
    color: '#6200EE',
    fontWeight: 'bold',
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
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  rejectionInput: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});