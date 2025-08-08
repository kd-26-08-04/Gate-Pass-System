import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Button, Chip } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import Toast from 'react-native-toast-message';

export default function NotificationIcon({ style }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      if (response.data.success) {
        setNotifications(response.data.notifications);
        const unread = response.data.notifications.filter(notif => !notif.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'All notifications marked as read',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to mark notifications as read',
      });
    }
  };

  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationAPI.deleteNotification(notificationId);
              setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Notification deleted',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete notification',
              });
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'gatepass_approved':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'gatepass_rejected':
        return { name: 'cancel', color: '#F44336' };
      case 'gatepass_expired':
        return { name: 'schedule', color: '#FF9800' };
      case 'complaint_response':
        return { name: 'reply', color: '#2196F3' };
      case 'complaint_status_update':
        return { name: 'update', color: '#9C27B0' };
      case 'new_message':
        return { name: 'message', color: '#6200EE' };
      case 'system_update':
        return { name: 'system-update', color: '#607D8B' };
      default:
        return { name: 'notifications', color: '#757575' };
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'gatepass_approved':
        return 'Gate Pass Approved';
      case 'gatepass_rejected':
        return 'Gate Pass Rejected';
      case 'gatepass_expired':
        return 'Gate Pass Expired';
      case 'complaint_response':
        return 'Complaint Response';
      case 'complaint_status_update':
        return 'Complaint Update';
      case 'new_message':
        return 'New Message';
      case 'system_update':
        return 'System Update';
      default:
        return 'Notification';
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.iconContainer, style]}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="notifications" size={24} color="#fff" />
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <View style={styles.headerButtons}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    style={styles.markAllButton}
                    onPress={markAllAsRead}
                  >
                    <MaterialIcons name="done-all" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.notificationsContainer}>
              {notifications.length === 0 ? (
                <View style={styles.noNotifications}>
                  <MaterialIcons name="notifications-none" size={64} color="#ccc" />
                  <Text style={styles.noNotificationsText}>No notifications yet</Text>
                </View>
              ) : (
                notifications.map((notification) => {
                  const iconInfo = getNotificationIcon(notification.type);
                  return (
                    <TouchableOpacity
                      key={notification._id}
                      onPress={() => !notification.isRead && markAsRead(notification._id)}
                      onLongPress={() => deleteNotification(notification._id)}
                    >
                      <Card style={[
                        styles.notificationCard,
                        !notification.isRead && styles.unreadNotification
                      ]}>
                        <Card.Content>
                          <View style={styles.notificationHeader}>
                            <View style={styles.notificationIcon}>
                              <MaterialIcons 
                                name={iconInfo.name} 
                                size={24} 
                                color={iconInfo.color} 
                              />
                            </View>
                            <View style={styles.notificationInfo}>
                              <Text style={styles.notificationTitle}>
                                {getNotificationTitle(notification.type)}
                              </Text>
                              <Text style={styles.notificationTime}>
                                {formatDate(notification.createdAt)}
                              </Text>
                            </View>
                            <View style={styles.notificationMeta}>
                              {!notification.isRead && (
                                <View style={styles.unreadDot} />
                              )}
                            </View>
                          </View>
                          <Text style={styles.notificationContent}>
                            {notification.message}
                          </Text>
                          {notification.actionData && (
                            <View style={styles.actionData}>
                              <Text style={styles.actionDataText}>
                                Related to: {notification.actionData.title || notification.actionData.destination || 'N/A'}
                              </Text>
                            </View>
                          )}
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            {notifications.length > 0 && (
              <View style={styles.modalFooter}>
                <Text style={styles.footerText}>
                  Long press to delete • {unreadCount} unread
                </Text>
              </View>
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
  markAllButton: {
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
  notificationsContainer: {
    padding: 15,
    maxHeight: 400,
  },
  noNotifications: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  notificationCard: {
    marginBottom: 10,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  notificationMeta: {
    alignItems: 'flex-end',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  notificationContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 36,
  },
  actionData: {
    marginTop: 8,
    marginLeft: 36,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  actionDataText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});