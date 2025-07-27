import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import StudentTabNavigator from './StudentTabNavigator';
import HODTabNavigator from './HODTabNavigator';
import GatePassDetailScreen from '../screens/GatePassDetailScreen';
import CreateGatePassScreen from '../screens/student/CreateGatePassScreen';

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
        </>
      ) : (
        <Stack.Screen 
          name="HODTabs" 
          component={HODTabNavigator}
          options={{ headerShown: false }}
        />
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
    </Stack.Navigator>
  );
}