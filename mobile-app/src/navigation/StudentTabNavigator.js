import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import MyGatePassesScreen from '../screens/student/MyGatePassesScreen';
import MyComplaintsScreen from '../screens/student/MyComplaintsScreen';
import VotingScreen from '../screens/VotingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function StudentTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'MyPasses') {
            iconName = 'assignment';
          } else if (route.name === 'MyComplaints') {
            iconName = 'report-problem';
          } else if (route.name === 'Voting') {
            iconName = 'how-to-vote';
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
        component={StudentDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="MyPasses" 
        component={MyGatePassesScreen}
        options={{ title: 'Gate Passes' }}
      />
      <Tab.Screen 
        name="MyComplaints" 
        component={MyComplaintsScreen}
        options={{ title: 'My Complaints' }}
      />
      <Tab.Screen 
        name="Voting" 
        component={VotingScreen}
        options={{ title: 'Voting' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}