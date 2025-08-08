import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { gatePassAPI } from '../services/api';
import Toast from 'react-native-toast-message';
import QRCodeDisplay from '../components/QRCodeDisplay';

export default function GatePassDetailScreen({ route, navigation }) {
  const { gatePassId } = route.params;
  const { user } = useAuth();
  const [gatePass, setGatePass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchGatePassDetail();
  }, [gatePassId]);

  const fetchGatePassDetail = async () => {
    try {
      const response = await gatePassAPI.getGatePassById(gatePassId);
      if (response.data.success) {
        setGatePass(response.data.gatePass);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch gate pass details',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGatePassDetail();
  };

  const handleReturn = () => {
    Alert.alert(
      'Mark as Returned',
      'Are you sure you want to mark this gate pass as returned?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Returned',
          onPress: async () => {
            setProcessing(true);
            try {
              const response = await gatePassAPI.updateReturnTime(gatePassId, new Date());
              if (response.data.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Gate pass marked as returned',
                });
                fetchGatePassDetail();
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update return status',
              });
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenScanner = async () => {
    try {
      setProcessing(true);
      
      // Mark scanner as used in the backend
      const response = await gatePassAPI.markScannerUsed(gatePassId);
      
      if (response.data.success) {
        setShowScanner(true);
        
        // Update local state to reflect scanner usage
        setGatePass(prev => ({
          ...prev,
          scannerUsed: true,
          scannerUsedAt: new Date().toISOString()
        }));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to open scanner';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
    // Refresh gate pass data to get updated information
    fetchGatePassDetail();
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const DetailRow = ({ icon, label, value, color = '#333' }) => (
    <View style={styles.detailRow}>
      <MaterialIcons name={icon} size={20} color="#6200EE" />
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, { color }]}>{value}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!gatePass) {
    return (
      <View style={styles.errorContainer}>
        <Text>Gate pass not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <Title style={styles.statusTitle}>Status</Title>
            <Chip
              icon={getStatusIcon(gatePass.status)}
              style={[styles.statusChip, { backgroundColor: getStatusColor(gatePass.status) }]}
              textStyle={styles.statusText}
            >
              {gatePass.status.toUpperCase()}
            </Chip>
          </View>
          
          {gatePass.status === 'rejected' && gatePass.rejectionReason && (
            <View style={styles.rejectionContainer}>
              <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
              <Text style={styles.rejectionReason}>{gatePass.rejectionReason}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Student Information</Title>
          <DetailRow
            icon="person"
            label="Student Name"
            value={gatePass.studentName}
          />
          <DetailRow
            icon="badge"
            label="USN"
            value={gatePass.studentUSN}
          />
          <DetailRow
            icon="domain"
            label="Department"
            value={gatePass.department}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Gate Pass Details</Title>
          <DetailRow
            icon="place"
            label="Destination"
            value={gatePass.destination}
          />
          <DetailRow
            icon="info"
            label="Reason"
            value={gatePass.reason}
          />
          <DetailRow
            icon="exit-to-app"
            label="Planned Exit Time"
            value={formatDateTime(gatePass.exitTime)}
          />
          <DetailRow
            icon="keyboard-return"
            label="Expected Return Time"
            value={formatDateTime(gatePass.expectedReturnTime)}
          />
          {gatePass.actualReturnTime && (
            <DetailRow
              icon="check-circle"
              label="Actual Return"
              value={formatDateTime(gatePass.actualReturnTime)}
              color="#4CAF50"
            />
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Contact Information</Title>
          <DetailRow
            icon="phone"
            label="Emergency Contact"
            value={gatePass.emergencyContact}
          />
          <DetailRow
            icon="family-restroom"
            label="Parent/Guardian"
            value={gatePass.parentContact}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Approval Information</Title>
          <DetailRow
            icon="schedule"
            label="Created On"
            value={formatDateTime(gatePass.createdAt)}
          />
          {gatePass.approvedBy && (
            <>
              <DetailRow
                icon="verified-user"
                label="Approved By"
                value="HOD"
              />
              <DetailRow
                icon="event"
                label="Approval Date"
                value={formatDateTime(gatePass.approvalDate)}
              />
            </>
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      {user.userType === 'student' && gatePass.status === 'approved' && (
        <View style={styles.actionContainer}>
          {/* QR Scanner Button */}
          <Button
            mode="contained"
            onPress={handleOpenScanner}
            style={[
              styles.scannerButton,
              gatePass.scannerUsed && styles.disabledButton
            ]}
            loading={processing}
            disabled={processing || gatePass.scannerUsed}
            icon="qr-code-scanner"
          >
            {gatePass.scannerUsed ? 'Scanner Used' : 'Open Scanner'}
          </Button>

          {/* Scanner Usage Info */}
          {gatePass.scannerUsed && gatePass.scannerUsedAt && (
            <View style={styles.scannerInfo}>
              <MaterialIcons name="info" size={16} color="#666" />
              <Text style={styles.scannerInfoText}>
                Scanner used on {formatDateTime(gatePass.scannerUsedAt)}
              </Text>
            </View>
          )}

          {/* Return Button */}
          {!gatePass.isReturned && (
            <Button
              mode="contained"
              onPress={handleReturn}
              style={styles.returnButton}
              loading={processing}
              disabled={processing}
              icon="keyboard-return"
            >
              Mark as Returned
            </Button>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Gate Pass ID: {gatePass._id}
        </Text>
      </View>

      {/* QR Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <QRCodeDisplay
          visible={showScanner}
          onClose={handleCloseScanner}
          gatePassData={gatePass}
        />
      </Modal>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    margin: 20,
    marginBottom: 10,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    color: '#6200EE',
  },
  statusChip: {
    height: 32,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rejectionContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  rejectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 5,
  },
  rejectionReason: {
    fontSize: 14,
    color: '#d32f2f',
  },
  card: {
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailContent: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionContainer: {
    margin: 20,
    marginTop: 10,
  },
  scannerButton: {
    paddingVertical: 8,
    backgroundColor: '#6200EE',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  scannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  scannerInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    fontStyle: 'italic',
  },
  returnButton: {
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
});