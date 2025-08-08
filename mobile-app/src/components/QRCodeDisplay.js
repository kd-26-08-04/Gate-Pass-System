import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Button, Card, Title } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function QRCodeDisplay({ visible, onClose, gatePassData }) {
  const [qrCodeUri, setQrCodeUri] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && gatePassData) {
      generateQRCode();
    }
  }, [visible, gatePassData]);

  const generateQRData = () => {
    return JSON.stringify({
      type: 'GATE_PASS',
      gatePassId: gatePassData._id,
      studentName: gatePassData.studentName,
      studentUSN: gatePassData.studentUSN,
      department: gatePassData.department,
      status: gatePassData.status,
      destination: gatePassData.destination,
      exitTime: gatePassData.exitTime,
      expectedReturnTime: gatePassData.expectedReturnTime,
      approvalDate: gatePassData.approvalDate,
      approvedBy: gatePassData.approvedBy,
      verificationCode: gatePassData._id.slice(-8).toUpperCase(),
      timestamp: new Date().toISOString(),
      version: '1.0'
    });
  };

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const qrData = generateQRData();
      
      // Use QR Server API to generate QR code
      const encodedData = encodeURIComponent(qrData);
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedData}&format=png&margin=10`;
      
      setQrCodeUri(qrCodeUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
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

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="verified-user" size={32} color="#fff" />
          <Text style={styles.headerText}>Gate Pass QR Code</Text>
          <Text style={styles.subHeaderText}>
            Show this QR code to security personnel
          </Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <Card style={styles.qrCard}>
            <Card.Content style={styles.qrCardContent}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <MaterialIcons name="hourglass-empty" size={60} color="#6200EE" />
                  <Text style={styles.loadingText}>Generating QR Code...</Text>
                </View>
              ) : qrCodeUri ? (
                <View style={styles.qrCodeContainer}>
                  <Image 
                    source={{ uri: qrCodeUri }} 
                    style={styles.qrCodeImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrLabel}>Scan this QR Code</Text>
                </View>
              ) : (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error" size={60} color="#F44336" />
                  <Text style={styles.errorText}>Failed to generate QR Code</Text>
                  <Button 
                    mode="outlined" 
                    onPress={generateQRCode}
                    style={styles.retryButton}
                  >
                    Retry
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Verification Code */}
        <Card style={styles.codeCard}>
          <Card.Content>
            <View style={styles.codeHeader}>
              <MaterialIcons name="security" size={20} color="#4CAF50" />
              <Text style={styles.codeTitle}>Verification Code</Text>
            </View>
            <Text style={styles.verificationCode}>
              {gatePassData._id.slice(-8).toUpperCase()}
            </Text>
            <Text style={styles.codeSubtext}>
              Security can verify this code manually if QR scanner fails
            </Text>
          </Card.Content>
        </Card>

        {/* Gate Pass Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <MaterialIcons name="info" size={24} color="#6200EE" />
              <Title style={styles.infoTitle}>Gate Pass Details</Title>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Student Name:</Text>
                <Text style={styles.dataValue}>{gatePassData.studentName}</Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>USN:</Text>
                <Text style={styles.dataValue}>{gatePassData.studentUSN}</Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Department:</Text>
                <Text style={styles.dataValue}>{gatePassData.department}</Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Status:</Text>
                <Text style={[styles.dataValue, styles.approvedStatus]}>
                  ✅ {gatePassData.status.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Destination:</Text>
                <Text style={styles.dataValue}>{gatePassData.destination}</Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Exit Time:</Text>
                <Text style={styles.dataValue}>
                  {formatDateTime(gatePassData.exitTime)}
                </Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Return Time:</Text>
                <Text style={styles.dataValue}>
                  {formatDateTime(gatePassData.expectedReturnTime)}
                </Text>
              </View>
              
              {gatePassData.approvalDate && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Approved On:</Text>
                  <Text style={styles.dataValue}>
                    {formatDateTime(gatePassData.approvalDate)}
                  </Text>
                </View>
              )}
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Generated At:</Text>
                <Text style={styles.dataValue}>
                  {new Date().toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Card.Content>
            <View style={styles.instructionsHeader}>
              <MaterialIcons name="help-outline" size={20} color="#FF9800" />
              <Text style={styles.instructionsTitle}>Instructions</Text>
            </View>
            <Text style={styles.instructionsText}>
              • Show this QR code to security personnel at the gate{'\n'}
              • Provide the verification code if QR scanner is not available{'\n'}
              • Keep your ID card ready for verification{'\n'}
              • This pass can only be used once{'\n'}
              • Return within the specified time{'\n'}
              • QR code contains encrypted gate pass information
            </Text>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={onClose}
            style={styles.closeButton}
            icon="check"
          >
            Done
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  subHeaderText: {
    color: '#C8E6C9',
    fontSize: 16,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCard: {
    elevation: 8,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  qrCardContent: {
    alignItems: 'center',
    padding: 30,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6200EE',
    marginTop: 15,
  },
  qrCodeContainer: {
    alignItems: 'center',
  },
  qrCodeImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 15,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 15,
    marginBottom: 15,
  },
  retryButton: {
    borderColor: '#F44336',
  },
  codeCard: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
    backgroundColor: '#E8F5E8',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  verificationCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginVertical: 10,
  },
  codeSubtext: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
  },
  infoCard: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    color: '#6200EE',
    marginLeft: 10,
    fontSize: 18,
  },
  infoContainer: {
    marginTop: 10,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  approvedStatus: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  instructionsCard: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
    backgroundColor: '#FFF8E1',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginLeft: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#F57C00',
    lineHeight: 20,
  },
  actionContainer: {
    margin: 20,
    marginTop: 0,
  },
  closeButton: {
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
  },
});