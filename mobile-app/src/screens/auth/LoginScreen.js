import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('kuldeept.cse22@sbjit.edu.in'); // Pre-fill for testing
  const [password, setPassword] = useState('password123'); // Pre-fill for testing
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  const { login } = useAuth();

  // Test backend connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await authAPI.testConnection();
      console.log('Connection test successful:', response.data);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('failed');
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: 'Cannot connect to backend server',
      });
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields',
      });
      return;
    }

    console.log('Login attempt with email:', email);
    setLoading(true);
    
    try {
      const result = await login(email, password);
      console.log('Login result:', result);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Login successful!',
        });
      } else {
        console.log('Login failed with message:', result.message);
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: result.message || 'Please check your credentials',
        });
      }
    } catch (error) {
      console.error('Login screen error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: 'An unexpected error occurred',
      });
    }
    
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#6200EE', '#3700B3']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Gate Pass</Text>
            <Text style={styles.logoSubtext}>Management System</Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Welcome Back</Title>
              <Paragraph style={styles.subtitle}>
                Sign in to your account
              </Paragraph>
              
              {/* Connection Status Indicator */}
              <View style={styles.connectionStatus}>
                <Text style={[
                  styles.connectionText,
                  { color: connectionStatus === 'connected' ? '#4CAF50' : 
                           connectionStatus === 'failed' ? '#F44336' : '#FF9800' }
                ]}>
                  Backend: {connectionStatus === 'connected' ? '✓ Connected' : 
                           connectionStatus === 'failed' ? '✗ Disconnected' : '⟳ Checking...'}
                </Text>
                {connectionStatus === 'failed' && (
                  <TouchableOpacity onPress={testConnection} style={styles.retryButton}>
                    <Text style={styles.retryText}>Retry Connection</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                left={<TextInput.Icon icon="lock" />}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                loading={loading}
                disabled={loading || connectionStatus !== 'connected'}
              >
                {connectionStatus !== 'connected' ? 'Backend Disconnected' : 'Sign In'}
              </Button>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  logoSubtext: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  card: {
    elevation: 8,
    borderRadius: 15,
  },
  title: {
    textAlign: 'center',
    marginBottom: 5,
    color: '#6200EE',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  connectionStatus: {
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: '#6200EE',
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});