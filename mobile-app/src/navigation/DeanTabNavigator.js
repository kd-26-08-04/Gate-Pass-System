import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import DeanDashboard from '../screens/DeanDashboard';
import VotingScreen from '../screens/VotingScreen';
import ComplaintListScreen from '../screens/ComplaintListScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function DeanTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Complaints') {
            iconName = 'assignment';
          } else if (route.name === 'Voting') {
            iconName = 'how-to-vote';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#6200EE',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DeanDashboard}
        options={{
          title: 'Dean Dashboard',
        }}
      />
      <Tab.Screen 
        name="Complaints" 
        component={ComplaintListScreen}
        options={{
          title: 'All Complaints',
        }}
        initialParams={{ isDean: true }}
      />
      <Tab.Screen 
        name="Voting" 
        component={VotingScreen}
        options={{
          title: 'Voting Results',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}