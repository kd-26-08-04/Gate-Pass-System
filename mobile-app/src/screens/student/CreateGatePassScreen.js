import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
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
    exitTime: new Date(),
    expectedReturnTime: new Date(),
    emergencyContact: '',
    parentContact: '',
  });
  const [loading, setLoading] = useState(false);
  const [showExitTimePicker, setShowExitTimePicker] = useState(false);
  const [showReturnTimePicker, setShowReturnTimePicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { reason, destination, emergencyContact, parentContact } = formData;

    if (!reason || !destination || !emergencyContact || !parentContact) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all required fields',
      });
      return false;
    }

    if (formData.exitTime >= formData.expectedReturnTime) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Return time must be after exit time',
      });
      return false;
    }

    if (formData.exitTime < new Date()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Exit time cannot be in the past',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await gatePassAPI.createGatePass(formData);
      
      if (response.data.success) {
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to create gate pass',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExitTimeConfirm = (date) => {
    setShowExitTimePicker(false);
    handleInputChange('exitTime', date);
    
    // Automatically set return time to 4 hours later
    const returnTime = new Date(date);
    returnTime.setHours(returnTime.getHours() + 4);
    handleInputChange('expectedReturnTime', returnTime);
  };

  const handleReturnTimeConfirm = (date) => {
    setShowReturnTimePicker(false);
    handleInputChange('expectedReturnTime', date);
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
                  <Text style={styles.dateTimeLabel}>Exit Time *</Text>
                  <Text style={styles.dateTimeValue}>{formatDateTime(formData.exitTime)}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowReturnTimePicker(true)}
            >
              <View style={styles.dateTimeButtonContent}>
                <MaterialIcons name="keyboard-return" size={24} color="#6200EE" />
                <View style={styles.dateTimeText}>
                  <Text style={styles.dateTimeLabel}>Expected Return Time *</Text>
                  <Text style={styles.dateTimeValue}>{formatDateTime(formData.expectedReturnTime)}</Text>
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

      {showExitTimePicker && (
        <DateTimePicker
          value={formData.exitTime}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setShowExitTimePicker(false);
            if (selectedDate) {
              handleExitTimeConfirm(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {showReturnTimePicker && (
        <DateTimePicker
          value={formData.expectedReturnTime}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setShowReturnTimePicker(false);
            if (selectedDate) {
              handleReturnTimeConfirm(selectedDate);
            }
          }}
          minimumDate={formData.exitTime}
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
});