import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('kuldeept.cse22@sbjit.edu.in'); // Pre-fill for testing
  const [password, setPassword] = useState('password123'); // Pre-fill for testing
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  const { login } = useAuth();

  // Animation references
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const floatingAnim3 = useRef(new Animated.Value(0)).current;
  const floatingAnim4 = useRef(new Animated.Value(0)).current;
  const floatingAnim5 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const particleAnim1 = useRef(new Animated.Value(0)).current;
  const particleAnim2 = useRef(new Animated.Value(0)).current;
  const particleAnim3 = useRef(new Animated.Value(0)).current;

  // Test backend connection on component mount
  useEffect(() => {
    testConnection();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Enhanced floating animations with more complex movements
    const createFloatingAnimation = (animValue, duration, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Create wave animation for background elements
    const createWaveAnimation = (animValue, duration) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: -1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Create particle movement animations
    const createParticleAnimation = (animValue, duration, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start all animations
    createFloatingAnimation(floatingAnim1, 2500, 0).start();
    createFloatingAnimation(floatingAnim2, 3500, 500).start();
    createFloatingAnimation(floatingAnim3, 4500, 1000).start();
    createFloatingAnimation(floatingAnim4, 3000, 1500).start();
    createFloatingAnimation(floatingAnim5, 2800, 2000).start();

    // Wave animation for background flow
    createWaveAnimation(waveAnim, 6000).start();

    // Particle animations
    createParticleAnimation(particleAnim1, 8000, 0).start();
    createParticleAnimation(particleAnim2, 10000, 2000).start();
    createParticleAnimation(particleAnim3, 12000, 4000).start();

    // Faster rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();

    // Enhanced pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

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

  // Futuristic Background Component
  const FuturisticBackground = () => {
    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const float1 = floatingAnim1.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -40],
    });

    const float2 = floatingAnim2.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 35],
    });

    const float3 = floatingAnim3.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -25],
    });

    const float4 = floatingAnim4.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 30],
    });

    const float5 = floatingAnim5.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -35],
    });

    const wave = waveAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [-50, 0, 50],
    });

    const particle1Move = particleAnim1.interpolate({
      inputRange: [0, 1],
      outputRange: [height, -100],
    });

    const particle2Move = particleAnim2.interpolate({
      inputRange: [0, 1],
      outputRange: [height, -100],
    });

    const particle3Move = particleAnim3.interpolate({
      inputRange: [0, 1],
      outputRange: [height, -100],
    });

    return (
      <View style={styles.backgroundContainer}>
        {/* Primary light gradient background */}
        <LinearGradient
          colors={['#f0f8ff', '#e6f3ff', '#ddeeff', '#d4e9ff']}
          style={styles.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Secondary overlay gradient with light colors */}
        <LinearGradient
          colors={['rgba(135, 206, 250, 0.3)', 'rgba(173, 216, 230, 0.2)', 'rgba(176, 224, 230, 0.1)', 'rgba(240, 248, 255, 0.4)']}
          style={styles.overlayGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Animated wave background */}
        <Animated.View
          style={[
            styles.waveBackground,
            {
              transform: [{ translateX: wave }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(0, 191, 255, 0.1)', 'rgba(30, 144, 255, 0.05)', 'rgba(135, 206, 250, 0.08)']}
            style={styles.waveGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Animated geometric shapes with light colors */}
        <Animated.View
          style={[
            styles.floatingShape1,
            {
              transform: [
                { translateY: float1 },
                { rotate: rotate },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(0, 123, 255, 0.2)', 'rgba(0, 123, 255, 0.1)']}
            style={styles.shape1}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingShape2,
            {
              transform: [
                { translateY: float2 },
                { rotate: rotate },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 99, 132, 0.15)', 'rgba(255, 99, 132, 0.08)']}
            style={styles.shape2}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingShape3,
            {
              transform: [
                { translateY: float3 },
                { rotate: rotate },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(75, 192, 192, 0.12)', 'rgba(75, 192, 192, 0.06)']}
            style={styles.shape3}
          />
        </Animated.View>

        {/* Additional floating shapes */}
        <Animated.View
          style={[
            styles.floatingShape4,
            {
              transform: [
                { translateY: float4 },
                { rotate: rotate },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(153, 102, 255, 0.15)', 'rgba(153, 102, 255, 0.08)']}
            style={styles.shape4}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingShape5,
            {
              transform: [
                { translateY: float5 },
                { rotate: rotate },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 159, 64, 0.12)', 'rgba(255, 159, 64, 0.06)']}
            style={styles.shape5}
          />
        </Animated.View>

        {/* Floating particles */}
        <Animated.View
          style={[
            styles.particle1,
            {
              transform: [{ translateY: particle1Move }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle2,
            {
              transform: [{ translateY: particle2Move }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle3,
            {
              transform: [{ translateY: particle3Move }],
            },
          ]}
        />

        {/* Enhanced grid pattern overlay */}
        <View style={styles.gridPattern}>
          {Array.from({ length: 15 }).map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineHorizontal, { top: (height / 15) * i }]} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineVertical, { left: (width / 10) * i }]} />
          ))}
        </View>

        {/* Light mode glowing orbs */}
        <Animated.View
          style={[
            styles.glowOrb1,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.glowOrb2,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.glowOrb3,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.glowOrb4,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FuturisticBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/Login.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Gate Pass</Text>
            <Text style={styles.logoSubtext}>Management System</Text>
          </View>

          <Card style={styles.card}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
              style={styles.cardGradient}
            >
              <Card.Content style={styles.cardContent}>
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
            </LinearGradient>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  primaryGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  waveBackground: {
    position: 'absolute',
    top: 0,
    left: -50,
    right: -50,
    bottom: 0,
    opacity: 0.6,
  },
  waveGradient: {
    flex: 1,
    borderRadius: 100,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
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
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 15,
    borderRadius: 20, // changed from 60 to 20 for rounded square
    borderWidth: 3,
    borderColor: 'rgba(0, 123, 255, 0.6)',
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 123, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  logoSubtext: {
    fontSize: 18,
    color: '#34495e',
    opacity: 0.8,
    textAlign: 'center',
    textShadowColor: 'rgba(52, 73, 94, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    elevation: 25,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(0, 123, 255, 0.3)',
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.2,
    shadowRadius: 25,
  },
  cardGradient: {
    borderRadius: 25,
    padding: 0,
  },
  cardContent: {
    backgroundColor: 'transparent',
    padding: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 123, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#34495e',
    fontSize: 18,
    opacity: 0.8,
  },
  input: {
    marginBottom: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(0, 123, 255, 0.2)',
    elevation: 3,
  },
  button: {
    marginTop: 20,
    marginBottom: 25,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 123, 255, 0.8)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(0, 123, 255, 0.4)',
    elevation: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#34495e',
    fontSize: 16,
  },
  registerLink: {
    color: '#007bff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  connectionStatus: {
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(0, 123, 255, 0.2)',
    elevation: 5,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 99, 132, 0.8)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 132, 0.4)',
    elevation: 3,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Enhanced futuristic background elements
  floatingShape1: {
    position: 'absolute',
    top: height * 0.08,
    left: width * 0.08,
    width: 120,
    height: 120,
  },
  shape1: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    transform: [{ rotate: '45deg' }],
  },
  floatingShape2: {
    position: 'absolute',
    top: height * 0.25,
    right: width * 0.03,
    width: 90,
    height: 90,
  },
  shape2: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  floatingShape3: {
    position: 'absolute',
    bottom: height * 0.18,
    left: width * 0.03,
    width: 70,
    height: 70,
  },
  shape3: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    transform: [{ rotate: '30deg' }],
  },
  floatingShape4: {
    position: 'absolute',
    top: height * 0.45,
    left: width * 0.85,
    width: 50,
    height: 50,
  },
  shape4: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    transform: [{ rotate: '60deg' }],
  },
  floatingShape5: {
    position: 'absolute',
    bottom: height * 0.35,
    right: width * 0.85,
    width: 40,
    height: 40,
  },
  shape5: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    transform: [{ rotate: '90deg' }],
  },
  // Floating particles
  particle1: {
    position: 'absolute',
    left: width * 0.2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 123, 255, 0.6)',
  },
  particle2: {
    position: 'absolute',
    left: width * 0.6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 99, 132, 0.6)',
  },
  particle3: {
    position: 'absolute',
    left: width * 0.8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(75, 192, 192, 0.6)',
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#007bff',
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: '#007bff',
  },
  glowOrb1: {
    position: 'absolute',
    top: height * 0.12,
    right: width * 0.15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 123, 255, 0.15)',
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  glowOrb2: {
    position: 'absolute',
    bottom: height * 0.22,
    right: width * 0.12,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 99, 132, 0.15)',
    shadowColor: '#ff6384',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  glowOrb3: {
    position: 'absolute',
    top: height * 0.35,
    left: width * 0.05,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(75, 192, 192, 0.15)',
    shadowColor: '#4bc0c0',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  glowOrb4: {
    position: 'absolute',
    bottom: height * 0.45,
    left: width * 0.75,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(153, 102, 255, 0.15)',
    shadowColor: '#9966ff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 7,
  },
});