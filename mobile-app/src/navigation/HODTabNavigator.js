import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import HODDashboardScreen from '../screens/hod/HODDashboardScreen';
import PendingApprovalsScreen from '../screens/hod/PendingApprovalsScreen';
import DepartmentGatePassesScreen from '../screens/hod/DepartmentGatePassesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function HODTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Pending') {
            iconName = 'pending-actions';
          } else if (route.name === 'Department') {
            iconName = 'domain';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={HODDashboardScreen}
        options={{ title: 'HOD Dashboard' }}
      />
      <Tab.Screen 
        name="Pending" 
        component={PendingApprovalsScreen}
        options={{ title: 'Pending Approvals' }}
      />
      <Tab.Screen 
        name="Department" 
        component={DepartmentGatePassesScreen}
        options={{ title: 'Department Passes' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}