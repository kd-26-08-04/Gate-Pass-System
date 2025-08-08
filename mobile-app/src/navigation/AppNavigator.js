import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import StudentTabNavigator from './StudentTabNavigator';
import HODTabNavigator from './HODTabNavigator';
import DeanTabNavigator from './DeanTabNavigator';
import GatePassDetailScreen from '../screens/GatePassDetailScreen';
import CreateGatePassScreen from '../screens/student/CreateGatePassScreen';
import CreateComplaintScreen from '../screens/student/CreateComplaintScreen';
import ComplaintDetailScreen from '../screens/ComplaintDetailScreen';
import VotingScreen from '../screens/VotingScreen';
import HODComplaintsScreen from '../screens/hod/HODComplaintsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {user?.userType === 'student' ? (
        <>
          <Stack.Screen 
            name="StudentTabs" 
            component={StudentTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CreateGatePass" 
            component={CreateGatePassScreen}
            options={{ 
              title: 'Create Gate Pass',
              headerStyle: { backgroundColor: '#6200EE' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen 
            name="CreateComplaint" 
            component={CreateComplaintScreen}
            options={{ 
              title: 'Submit Complaint',
              headerStyle: { backgroundColor: '#6200EE' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen 
            name="Voting" 
            component={VotingScreen}
            options={{ 
              title: 'Student Voting',
              headerStyle: { backgroundColor: '#6200EE' },
              headerTintColor: '#fff',
            }}
          />
        </>
      ) : user?.userType === 'dean' ? (
        <Stack.Screen 
          name="DeanTabs" 
          component={DeanTabNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen 
            name="HODTabs" 
            component={HODTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="HODComplaints" 
            component={HODComplaintsScreen}
            options={{ 
              title: 'Department Complaints',
              headerStyle: { backgroundColor: '#6200EE' },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
      <Stack.Screen 
        name="GatePassDetail" 
        component={GatePassDetailScreen}
        options={{ 
          title: 'Gate Pass Details',
          headerStyle: { backgroundColor: '#6200EE' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="ComplaintDetail" 
        component={ComplaintDetailScreen}
        options={{ 
          title: 'Complaint Details',
          headerStyle: { backgroundColor: '#6200EE' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}