import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Card, Title, RadioButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { complaintAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function CreateComplaintScreen({ navigation, route }) {
  const { user } = useAuth();
  const { relatedGatePassId } = route.params || {};
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    relatedGatePass: relatedGatePassId || null,
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { label: 'Gate Pass Related', value: 'gate_pass' },
    { label: 'System Issue', value: 'system_issue' },
    { label: 'Security Concern', value: 'security' },
    { label: 'Other', value: 'other' },
  ];

  const priorities = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { title, description, category } = formData;

    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a complaint title',
      });
      return false;
    }

    if (title.trim().length < 5) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Title must be at least 5 characters long',
      });
      return false;
    }

    if (!description.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a complaint description',
      });
      return false;
    }

    if (description.trim().length < 20) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Description must be at least 20 characters long',
      });
      return false;
    }

    if (!category) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a category',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Submitting complaint with data:', formData);
      
      const response = await complaintAPI.createComplaint(formData);
      console.log('Complaint creation response:', response.data);
      
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Complaint submitted successfully!',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.message || 'Failed to submit complaint',
        });
      }
    } catch (error) {
      console.error('Complaint creation error:', error);
      
      let errorMessage = 'Failed to submit complaint';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Submit a Complaint</Title>
            
            <View style={styles.studentInfo}>
              <Text style={styles.infoText}>Student: {user.name}</Text>
              <Text style={styles.infoText}>USN: {user.usn}</Text>
              <Text style={styles.infoText}>Department: {user.department}</Text>
            </View>

            <TextInput
              label="Complaint Title *"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              mode="outlined"
              style={styles.input}
              placeholder="Brief title describing your complaint"
              maxLength={200}
            />

            <TextInput
              label="Description *"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={5}
              placeholder="Please provide detailed information about your complaint"
              maxLength={1000}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Category *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  style={styles.picker}
                >
                  {categories.map((category) => (
                    <Picker.Item
                      key={category.value}
                      label={category.label}
                      value={category.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Priority</Text>
              <RadioButton.Group
                onValueChange={(value) => handleInputChange('priority', value)}
                value={formData.priority}
              >
                <View style={styles.priorityOptions}>
                  {priorities.map((priority) => (
                    <View key={priority.value} style={styles.priorityOption}>
                      <RadioButton value={priority.value} />
                      <Text style={styles.priorityText}>{priority.label}</Text>
                    </View>
                  ))}
                </View>
              </RadioButton.Group>
            </View>

            {relatedGatePassId && (
              <View style={styles.relatedInfo}>
                <Text style={styles.relatedLabel}>
                  This complaint is related to a gate pass
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            >
              Submit Complaint
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
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
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  priorityContainer: {
    marginBottom: 20,
  },
  priorityLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '500',
  },
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  relatedInfo: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  relatedLabel: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
});