import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { TextInput, Button, Card, Title } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { gatePassAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function CreateGatePassScreen({ navigation }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    reason: '',
    destination: '',
    exitTime: new Date(Date.now() + 30 * 60 * 1000), // Default to 30 minutes from now
    emergencyContact: '',
    parentContact: '',
  });
  const [loading, setLoading] = useState(false);
  const [showExitTimePicker, setShowExitTimePicker] = useState(false);

  // Safe date picker event handler for exit time only
  const handleDatePickerChange = (event, selectedDate) => {
    try {
      console.log('Exit time picker event:', {
        eventType: event?.type,
        selectedDate,
        platform: Platform.OS
      });

      if (Platform.OS === 'android') {
        // Close the picker first on Android
        setShowExitTimePicker(false);
        
        // On Android, we only process if event type is 'set' and we have a date
        if (event?.type === 'set' && selectedDate) {
          handleExitTimeConfirm(selectedDate);
        }
        // If event.type is 'dismissed' or undefined, user cancelled - do nothing
      } else {
        // iOS handling - don't close picker immediately, let user interact
        if (event?.type === 'dismissed') {
          setShowExitTimePicker(false);
          return; // User cancelled
        }
        if (selectedDate) {
          handleExitTimeConfirm(selectedDate);
        }
      }
    } catch (error) {
      console.error('Error in exit time picker:', error);
      // Ensure picker is closed even if there's an error
      setShowExitTimePicker(false);
    }
  };

  // Close date picker for iOS
  const closeDatePicker = () => {
    setShowExitTimePicker(false);
  };

  const handleInputChange = (field, value) => {
    // Type validation for date field
    if (field === 'exitTime' && value && !(value instanceof Date)) {
      console.error(`Invalid date type for ${field}:`, typeof value, value);
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { reason, destination, emergencyContact, parentContact, exitTime } = formData;

    // Check required text fields
    if (!reason || !destination || !emergencyContact || !parentContact) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all required fields',
      });
      return false;
    }

    // Validate reason length
    if (reason.trim().length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please provide a detailed reason (at least 10 characters)',
      });
      return false;
    }

    // Validate phone numbers
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(emergencyContact)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid emergency contact number',
      });
      return false;
    }

    if (!phoneRegex.test(parentContact)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid parent contact number',
      });
      return false;
    }

    // Validate exit time
    if (!exitTime || !(exitTime instanceof Date)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a valid exit time',
      });
      return false;
    }

    // Allow a 5-minute buffer for form filling time
    const now = new Date();
    const bufferTime = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    

    
    if (exitTime < bufferTime) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Exit time cannot be more than 5 minutes in the past',
      });
      return false;
    }

    // Check if exit time is too far in the future (more than 7 days)
    const maxFutureDate = new Date();
    maxFutureDate.setDate(maxFutureDate.getDate() + 7);
    if (exitTime > maxFutureDate) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Exit time cannot be more than 7 days in the future',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Submitting gate pass with data:', formData);
      
      // Prepare data with proper date serialization
      const submitData = {
        ...formData,
        exitTime: formData.exitTime.toISOString(),
        // Set expected return time to 24 hours after exit time by default
        expectedReturnTime: new Date(formData.exitTime.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
      
      console.log('Serialized data:', submitData);
      const response = await gatePassAPI.createGatePass(submitData);
      console.log('Gate pass creation response:', response.data);
      
      // Check if response has gatePass (successful creation)
      if (response.data.gatePass || response.data.message === 'Gate pass created successfully') {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Gate pass created successfully!',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.message || 'Failed to create gate pass',
        });
      }
    } catch (error) {
      console.error('Gate pass creation error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to create gate pass';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error - please check your connection';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Select date and time';
      }
      
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const handleExitTimeConfirm = (date) => {
    try {
      console.log('Confirming exit time:', date);
      if (date && date instanceof Date && !isNaN(date.getTime())) {
        handleInputChange('exitTime', date);
        console.log('Exit time set successfully:', date);
      } else {
        console.warn('Invalid date received for exit time:', date);
      }
    } catch (error) {
      console.error('Error setting exit time:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Create New Gate Pass</Title>
            
            <View style={styles.studentInfo}>
              <Text style={styles.infoText}>Student: {user.name}</Text>
              <Text style={styles.infoText}>USN: {user.usn}</Text>
              <Text style={styles.infoText}>Department: {user.department}</Text>
            </View>

            <View style={styles.warningContainer}>
              <MaterialIcons name="warning" size={20} color="#FF9800" />
              <Text style={styles.warningText}>
                Important: Gate passes that remain pending for more than 24 hours will be automatically deleted.
              </Text>
            </View>

            <TextInput
              label="Reason for Exit *"
              value={formData.reason}
              onChangeText={(value) => handleInputChange('reason', value)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="Please specify the reason for leaving the campus"
            />

            <TextInput
              label="Destination *"
              value={formData.destination}
              onChangeText={(value) => handleInputChange('destination', value)}
              mode="outlined"
              style={styles.input}
              placeholder="Where are you going?"
            />

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowExitTimePicker(true)}
            >
              <View style={styles.dateTimeButtonContent}>
                <MaterialIcons name="exit-to-app" size={24} color="#6200EE" />
                <View style={styles.dateTimeText}>
                  <Text style={styles.dateTimeLabel}>Planned Exit Time *</Text>
                  <Text style={styles.dateTimeValue}>{formatDateTime(formData.exitTime)}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TextInput
              label="Emergency Contact Number *"
              value={formData.emergencyContact}
              onChangeText={(value) => handleInputChange('emergencyContact', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="Contact number in case of emergency"
            />

            <TextInput
              label="Parent/Guardian Contact Number *"
              value={formData.parentContact}
              onChangeText={(value) => handleInputChange('parentContact', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="Parent or guardian contact number"
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            >
              Submit Gate Pass Request
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {showExitTimePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showExitTimePicker}
          onRequestClose={closeDatePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeDatePicker}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Exit Time</Text>
                <TouchableOpacity onPress={() => {
                  handleExitTimeConfirm(formData.exitTime);
                  closeDatePicker();
                }}>
                  <Text style={styles.modalButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={formData.exitTime}
                mode="datetime"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setFormData(prev => ({ ...prev, exitTime: selectedDate }));
                  }
                }}
                minimumDate={new Date(Date.now() - 5 * 60 * 1000)} // Allow 5 minutes in the past
                maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                style={styles.iosDatePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {showExitTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={formData.exitTime}
          mode="datetime"
          display="default"
          onChange={handleDatePickerChange}
          minimumDate={new Date(Date.now() - 5 * 60 * 1000)} // Allow 5 minutes in the past
          maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 20,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#6200EE',
  },
  studentInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    marginBottom: 15,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  dateTimeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    marginLeft: 15,
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  iosDatePicker: {
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalButton: {
    fontSize: 16,
    color: '#6200EE',
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    marginLeft: 10,
    lineHeight: 20,
  },
});