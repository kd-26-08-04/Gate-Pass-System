import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const ProfileItem = ({ icon, label, value, onPress }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <MaterialIcons name={icon} size={24} color="#6200EE" />
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemLabel}>{label}</Text>
          <Text style={styles.profileItemValue}>{value}</Text>
        </View>
      </View>
      {onPress && <MaterialIcons name="chevron-right" size={24} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="account-circle" size={80} color="#fff" />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userType}>
          {user.userType === 'student' ? 'Student' : 'Head of Department'}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Personal Information</Title>
          <ProfileItem
            icon="person"
            label="Full Name"
            value={user.name}
          />
          <ProfileItem
            icon="email"
            label="Email"
            value={user.email}
          />
          <ProfileItem
            icon="phone"
            label="Phone Number"
            value={user.phone}
          />
          <ProfileItem
            icon="domain"
            label="Department"
            value={user.department}
          />
          {user.userType === 'student' && (
            <ProfileItem
              icon="badge"
              label="USN"
              value={user.usn}
            />
          )}
          <ProfileItem
            icon="verified-user"
            label="User Type"
            value={user.userType === 'student' ? 'Student' : 'Head of Department'}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Account</Title>
          <ProfileItem
            icon="schedule"
            label="Member Since"
            value={new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
          <ProfileItem
            icon="security"
            label="Account Status"
            value={user.isActive ? 'Active' : 'Inactive'}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Settings</Title>
          {user.userType === 'hod' && (
            <ProfileItem
              icon="history"
              label="History"
              value="View gate pass history"
              onPress={() => navigation.navigate('History')}
            />
          )}
          <ProfileItem
            icon="notifications"
            label="Notifications"
            value="Enabled"
            onPress={() => {
              // TODO: Implement notification settings
              Alert.alert('Coming Soon', 'Notification settings will be available soon');
            }}
          />
          <ProfileItem
            icon="security"
            label="Privacy"
            value="Manage"
            onPress={() => {
              // TODO: Implement privacy settings
              Alert.alert('Coming Soon', 'Privacy settings will be available soon');
            }}
          />
          <ProfileItem
            icon="help"
            label="Help & Support"
            value="Get Help"
            onPress={() => {
              // TODO: Implement help screen
              Alert.alert('Help & Support', 'For support, please contact your system administrator');
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>App Information</Title>
          <ProfileItem
            icon="info"
            label="Version"
            value="1.0.0"
          />
          <ProfileItem
            icon="code"
            label="Build"
            value="Mobile App"
          />
        </Card.Content>
      </Card>

      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
          buttonColor="#F44336"
        >
          Logout
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Gate Pass Management System
        </Text>
        <Text style={styles.footerSubtext}>
          © 2024 All rights reserved
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
  header: {
    backgroundColor: '#6200EE',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  userType: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    margin: 20,
    marginBottom: 10,
    elevation: 3,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemText: {
    marginLeft: 15,
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutContainer: {
    margin: 20,
  },
  logoutButton: {
    paddingVertical: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});