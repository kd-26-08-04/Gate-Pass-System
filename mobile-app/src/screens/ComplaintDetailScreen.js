import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Card, Title, Chip, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import Toast from 'react-native-toast-message';

export default function ComplaintDetailScreen({ route, navigation }) {
  const { complaintId } = route.params;
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchComplaintDetail();
  }, [complaintId]);

  const fetchComplaintDetail = async () => {
    try {
      const response = await complaintAPI.getComplaintById(complaintId);
      if (response.data.success) {
        setComplaint(response.data.complaint);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch complaint details',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaintDetail();
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'gate_pass':
        return 'exit-to-app';
      case 'system_issue':
        return 'bug-report';
      case 'security':
        return 'security';
      case 'other':
        return 'help-outline';
      default:
        return 'help-outline';
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

  if (!complaint) {
    return (
      <View style={styles.errorContainer}>
        <Text>Complaint not found</Text>
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
              style={[styles.statusChip, { backgroundColor: getStatusColor(complaint.status) }]}
              textStyle={styles.statusText}
            >
              {complaint.status.replace('_', ' ').toUpperCase()}
            </Chip>
          </View>
          
          <View style={styles.priorityContainer}>
            <MaterialIcons name="flag" size={20} color={getPriorityColor(complaint.priority)} />
            <Text style={[styles.priorityText, { color: getPriorityColor(complaint.priority) }]}>
              {complaint.priority.toUpperCase()} PRIORITY
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Complaint Details</Title>
          <DetailRow
            icon={getCategoryIcon(complaint.category)}
            label="Category"
            value={complaint.category.replace('_', ' ').toUpperCase()}
          />
          <DetailRow
            icon="title"
            label="Title"
            value={complaint.title}
          />
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionHeader}>
              <MaterialIcons name="description" size={20} color="#6200EE" />
              <Text style={styles.detailLabel}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>{complaint.description}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Student Information</Title>
          <DetailRow
            icon="person"
            label="Student Name"
            value={complaint.studentName}
          />
          <DetailRow
            icon="badge"
            label="USN"
            value={complaint.studentUSN}
          />
          <DetailRow
            icon="domain"
            label="Department"
            value={complaint.department}
          />
        </Card.Content>
      </Card>

      {complaint.relatedGatePass && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Related Gate Pass</Title>
            <DetailRow
              icon="exit-to-app"
              label="Destination"
              value={complaint.relatedGatePass.destination}
            />
            <DetailRow
              icon="info"
              label="Reason"
              value={complaint.relatedGatePass.reason}
            />
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title>Timeline</Title>
          <DetailRow
            icon="schedule"
            label="Submitted On"
            value={formatDateTime(complaint.createdAt)}
          />
          {complaint.assignedTo && (
            <DetailRow
              icon="person-outline"
              label="Assigned To"
              value={complaint.assignedTo.name}
            />
          )}
          {complaint.responseDate && (
            <DetailRow
              icon="event"
              label="Response Date"
              value={formatDateTime(complaint.responseDate)}
            />
          )}
        </Card.Content>
      </Card>

      {complaint.response && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Response</Title>
            <View style={styles.responseContainer}>
              <Text style={styles.responseText}>{complaint.response}</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Complaint ID: {complaint._id}
        </Text>
      </View>
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
    marginBottom: 10,
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
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
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
  descriptionContainer: {
    marginBottom: 15,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginLeft: 35,
  },
  responseContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  responseText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
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