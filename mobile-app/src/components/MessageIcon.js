import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Button, Chip } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../services/api';
import Toast from 'react-native-toast-message';

export default function MessageIcon({ style }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [composeMode, setComposeMode] = useState(false);
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    priority: 'normal'
  });

  useEffect(() => {
    fetchMessages();
    // Set up polling for new messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getMessages();
      if (response.data.success) {
        setMessages(response.data.messages);
        const unread = response.data.messages.filter(msg => !msg.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await messageAPI.markAsRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true } : msg
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.title.trim() || !newMessage.content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const response = await messageAPI.sendMessage({
        ...newMessage,
        department: user.department
      });
      
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Message sent to all department students',
        });
        setNewMessage({ title: '', content: '', priority: 'normal' });
        setComposeMode(false);
        fetchMessages();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send message',
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
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
      default: return '#2196F3';
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.iconContainer, style]}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="message" size={24} color="#fff" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setComposeMode(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {composeMode ? 'Send Message' : 'Messages'}
              </Text>
              <View style={styles.headerButtons}>
                {user.userType === 'hod' && !composeMode && (
                  <TouchableOpacity
                    style={styles.composeButton}
                    onPress={() => setComposeMode(true)}
                  >
                    <MaterialIcons name="edit" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible(false);
                    setComposeMode(false);
                  }}
                >
                  <MaterialIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {composeMode ? (
              <ScrollView style={styles.composeContainer}>
                <Text style={styles.label}>Message Title</Text>
                <TextInput
                  style={styles.input}
                  value={newMessage.title}
                  onChangeText={(text) => setNewMessage(prev => ({ ...prev, title: text }))}
                  placeholder="Enter message title"
                  multiline={false}
                />

                <Text style={styles.label}>Message Content</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newMessage.content}
                  onChangeText={(text) => setNewMessage(prev => ({ ...prev, content: text }))}
                  placeholder="Enter your message here..."
                  multiline={true}
                  numberOfLines={6}
                />

                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityContainer}>
                  {['low', 'normal', 'medium', 'high'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityChip,
                        newMessage.priority === priority && styles.selectedPriority,
                        { borderColor: getPriorityColor(priority) }
                      ]}
                      onPress={() => setNewMessage(prev => ({ ...prev, priority }))}
                    >
                      <Text style={[
                        styles.priorityText,
                        newMessage.priority === priority && { color: '#fff' }
                      ]}>
                        {priority.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.composeActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setComposeMode(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={sendMessage}
                    style={styles.sendButton}
                  >
                    Send to Department
                  </Button>
                </View>
              </ScrollView>
            ) : (
              <ScrollView style={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <View style={styles.noMessages}>
                    <MaterialIcons name="inbox" size={64} color="#ccc" />
                    <Text style={styles.noMessagesText}>No messages yet</Text>
                  </View>
                ) : (
                  messages.map((message) => (
                    <TouchableOpacity
                      key={message._id}
                      onPress={() => !message.isRead && markAsRead(message._id)}
                    >
                      <Card style={[
                        styles.messageCard,
                        !message.isRead && styles.unreadMessage
                      ]}>
                        <Card.Content>
                          <View style={styles.messageHeader}>
                            <View style={styles.messageInfo}>
                              <Text style={styles.messageTitle}>
                                {message.title}
                              </Text>
                              <Text style={styles.messageSender}>
                                From: {message.senderName} ({message.senderDepartment})
                              </Text>
                            </View>
                            <View style={styles.messageMeta}>
                              <Chip
                                style={[
                                  styles.priorityBadge,
                                  { backgroundColor: getPriorityColor(message.priority) }
                                ]}
                                textStyle={styles.priorityBadgeText}
                              >
                                {message.priority.toUpperCase()}
                              </Chip>
                              {!message.isRead && (
                                <View style={styles.unreadDot} />
                              )}
                            </View>
                          </View>
                          <Text style={styles.messageContent}>
                            {message.content}
                          </Text>
                          <Text style={styles.messageDate}>
                            {formatDate(message.createdAt)}
                          </Text>
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  composeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 5,
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 5,
  },
  messagesContainer: {
    padding: 15,
    maxHeight: 400,
  },
  noMessages: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  noMessagesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  messageCard: {
    marginBottom: 10,
    elevation: 2,
  },
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  messageInfo: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  messageSender: {
    fontSize: 12,
    color: '#666',
  },
  messageMeta: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    height: 20,
    marginBottom: 5,
  },
  priorityBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  messageDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  composeContainer: {
    padding: 15,
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  priorityChip: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedPriority: {
    backgroundColor: '#6200EE',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  composeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
  },
  sendButton: {
    flex: 1,
    marginLeft: 10,
  },
});