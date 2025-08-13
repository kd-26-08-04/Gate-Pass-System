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
import { TextInput, Button, Card, Title, RadioButton, Paragraph } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electronics and Telecommunication',
  'Mechanical',
  'Civil',
  'Electrical',
  'Chemical',
  'Biotechnology',
];

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    department: departments[0],
    usn: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();

  // Animation references (same background as Sign In)
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

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
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

    createFloatingAnimation(floatingAnim1, 2500, 0).start();
    createFloatingAnimation(floatingAnim2, 3500, 500).start();
    createFloatingAnimation(floatingAnim3, 4500, 1000).start();
    createFloatingAnimation(floatingAnim4, 3000, 1500).start();
    createFloatingAnimation(floatingAnim5, 2800, 2000).start();

    createWaveAnimation(waveAnim, 6000).start();

    createParticleAnimation(particleAnim1, 8000, 0).start();
    createParticleAnimation(particleAnim2, 10000, 2000).start();
    createParticleAnimation(particleAnim3, 12000, 4000).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();

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

  const handleInputChange = (field, value) => {
    // Helper: derive department from email tokens
    const deriveDeptFromEmail = (e) => {
      if (!e) return null;
      // Only use local-part before '@' to avoid matching 'it' in domains like 'sbjit'
      const lower = e.toLowerCase().split('@')[0];
      // Stronger/less ambiguous tokens first to avoid accidental matches
      const mapping = {
        CS: ['cse', 'cs', 'comp', 'computer'],
        EE: ['ee', 'electrical'],
        ET: ['et', 'entc', 'etc'], // Electronics & Telecommunication
        EC: ['ec', 'ece', 'electro'],
        ME: ['mech', 'me'],
        CV: ['civil', 'cv'],
        IT: ['it', 'info', 'infotech'], // Keep IT last so 'sbjit' doesn't override EE/ET
      };

      // Try to extract tokens like '.ee22', '.et22', '.cse22' from the local-part for higher precision
      const tokenMatch = lower.match(/(?:^|[._-])([a-z]{2,3})\d{2}/i);
      if (tokenMatch) {
        const token = tokenMatch[1].toLowerCase();
        const tokenToCode = { cse: 'CS', cs: 'CS', ee: 'EE', et: 'ET', it: 'IT', me: 'ME', ec: 'EC', ece: 'EC', cv: 'CV' };
        if (tokenToCode[token]) return tokenToCode[token];
      }

      for (const code of Object.keys(mapping)) {
        if (mapping[code].some(k => lower.includes(k))) return code;
      }
      return null;
    };

    const deptNameFromCode = (code) => {
      const names = {
        CS: 'Computer Science',
        IT: 'Information Technology',
        EC: 'Electronics',
        ET: 'Electronics and Telecommunication',
        ME: 'Mechanical',
        CV: 'Civil',
        EE: 'Electrical',
      };
      return names[code] || null;
    };

    setFormData(prev => {
      let next = { ...prev };

      if (field === 'email') {
        next.email = value;
        // When student: auto-select department from email and enforce USN dept code
        if (next.userType === 'student') {
          const code = deriveDeptFromEmail(value);
          if (code) {
            const name = deptNameFromCode(code);
            if (name) next.department = name;
            // If USN present, enforce dept code as first two letters (e.g., EE22187)
            if (next.usn) {
              const usnUp = (next.usn || '').toUpperCase().replace(/\s+/g, '');
              const remainder = usnUp.replace(/^[A-Z]{2}/, ''); // strip existing dept code if any
              next.usn = `${code}${remainder}`;
            }
          }
        }
        return next;
      }

      if (field === 'usn') {
        // Uppercase and enforce dept code inferred from email if student
        let usnUp = (value || '').toUpperCase().replace(/\s+/g, '');
        if (next.userType === 'student') {
          const emailCode = deriveDeptFromEmail(next.email);
          if (emailCode) {
            // Replace any existing leading department letters with the inferred code
            const remainder = usnUp.replace(/^[A-Z]{2}/, '');
            usnUp = `${emailCode}${remainder}`;
            // Also sync department name
            const name = deptNameFromCode(emailCode);
            if (name) next.department = name;
          }
        }
        next.usn = usnUp;
        return next;
      }

      // Default
      next[field] = value;
      return next;
    });
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, phone, usn, userType } = formData;

    if (!name || !email || !password || !phone) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all required fields',
      });
      return false;
    }

    if (userType === 'student' && !usn) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'USN is required for students',
      });
      return false;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return false;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must be at least 6 characters long',
      });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Registration successful!',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: result.message || 'Please try again',
      });
    }
    setLoading(false);
  };

  // Shared Futuristic Background copied from Sign In screen
  const FuturisticBackground = () => {
    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const float1 = floatingAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -40] });
    const float2 = floatingAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, 35] });
    const float3 = floatingAnim3.interpolate({ inputRange: [0, 1], outputRange: [0, -25] });
    const float4 = floatingAnim4.interpolate({ inputRange: [0, 1], outputRange: [0, 30] });
    const float5 = floatingAnim5.interpolate({ inputRange: [0, 1], outputRange: [0, -35] });

    const wave = waveAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-50, 0, 50] });

    const particle1Move = particleAnim1.interpolate({ inputRange: [0, 1], outputRange: [height, -100] });
    const particle2Move = particleAnim2.interpolate({ inputRange: [0, 1], outputRange: [height, -100] });
    const particle3Move = particleAnim3.interpolate({ inputRange: [0, 1], outputRange: [height, -100] });

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
          style={[styles.waveBackground, { transform: [{ translateX: wave }] }]}
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
          style={[styles.floatingShape1, { transform: [{ translateY: float1 }, { rotate: rotate }, { scale: pulseAnim }] }]}
        >
          <LinearGradient colors={['rgba(0, 123, 255, 0.2)', 'rgba(0, 123, 255, 0.1)']} style={styles.shape1} />
        </Animated.View>

        <Animated.View
          style={[styles.floatingShape2, { transform: [{ translateY: float2 }, { rotate: rotate }] }]}
        >
          <LinearGradient colors={['rgba(255, 99, 132, 0.15)', 'rgba(255, 99, 132, 0.08)']} style={styles.shape2} />
        </Animated.View>

        <Animated.View
          style={[styles.floatingShape3, { transform: [{ translateY: float3 }, { rotate: rotate }] }]}
        >
          <LinearGradient colors={['rgba(75, 192, 192, 0.12)', 'rgba(75, 192, 192, 0.06)']} style={styles.shape3} />
        </Animated.View>

        {/* Additional floating shapes */}
        <Animated.View
          style={[styles.floatingShape4, { transform: [{ translateY: float4 }, { rotate: rotate }, { scale: pulseAnim }] }]}
        >
          <LinearGradient colors={['rgba(153, 102, 255, 0.15)', 'rgba(153, 102, 255, 0.08)']} style={styles.shape4} />
        </Animated.View>

        <Animated.View
          style={[styles.floatingShape5, { transform: [{ translateY: float5 }, { rotate: rotate }] }]}
        >
          <LinearGradient colors={['rgba(255, 159, 64, 0.12)', 'rgba(255, 159, 64, 0.06)']} style={styles.shape5} />
        </Animated.View>

        {/* Floating particles */}
        <Animated.View style={[styles.particle1, { transform: [{ translateY: particle1Move }] }]} />
        <Animated.View style={[styles.particle2, { transform: [{ translateY: particle2Move }] }]} />
        <Animated.View style={[styles.particle3, { transform: [{ translateY: particle3Move }] }]} />

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
        <Animated.View style={[styles.glowOrb1, { transform: [{ scale: pulseAnim }] }]} />
        <Animated.View style={[styles.glowOrb2, { transform: [{ scale: pulseAnim }] }]} />
        <Animated.View style={[styles.glowOrb3, { transform: [{ scale: pulseAnim }] }]} />
        <Animated.View style={[styles.glowOrb4, { transform: [{ scale: pulseAnim }] }]} />
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
            <Text style={styles.logoText}>Create Account</Text>
            <Text style={styles.logoSubtext}>Join Gate Pass System</Text>
          </View>

          <Card style={styles.card}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
              style={styles.cardGradient}
            >
              <Card.Content style={styles.cardContent}>
                <Title style={styles.title}>Sign Up</Title>
                <Paragraph style={styles.subtitle}>Create a new account</Paragraph>

                <TextInput
                  label="Full Name"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />

                <TextInput
                  label="Email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email" />}
                />

                <TextInput
                  label="Phone Number"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone" />}
                />

                <View style={styles.radioContainer}>
                  <Text style={styles.radioLabel}>User Type:</Text>
                  <RadioButton.Group
                    onValueChange={(value) => handleInputChange('userType', value)}
                    value={formData.userType}
                  >
                    <View style={styles.radioRow}>
                      <RadioButton.Item label="Student" value="student" />
                      <RadioButton.Item label="HOD" value="hod" />
                    </View>
                  </RadioButton.Group>
                </View>

                {formData.userType === 'student' && (
                  <TextInput
                    label="USN"
                    value={formData.usn}
                    onChangeText={(value) => handleInputChange('usn', value.toUpperCase())}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., EE22187"
                    left={<TextInput.Icon icon="badge-account" />}
                  />
                )}

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Department (auto-detected from email):</Text>
                  <Picker
                    selectedValue={formData.department}
                    enabled={false}
                    style={[styles.picker, { opacity: 0.7 }]}
                  >
                    {departments.map((dept) => (
                      <Picker.Item key={dept} label={dept} value={dept} />
                    ))}
                  </Picker>
                </View>

                <TextInput
                  label="Password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
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

                <TextInput
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!showConfirmPassword}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                  left={<TextInput.Icon icon="lock" />}
                />

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  style={styles.button}
                  loading={loading}
                  disabled={loading}
                >
                  Sign Up
                </Button>

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>Sign In</Text>
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
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(0, 123, 255, 0.6)',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 123, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  logoSubtext: {
    fontSize: 16,
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
    shadowOffset: { width: 0, height: 15 },
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
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 123, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#34495e',
    fontSize: 16,
    opacity: 0.8,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(0, 123, 255, 0.2)',
    elevation: 3,
  },
  radioContainer: {
    marginBottom: 15,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  picker: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(0, 123, 255, 0.2)',
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 123, 255, 0.8)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(0, 123, 255, 0.4)',
    elevation: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#34495e',
  },
  loginLink: {
    color: '#2c3e50',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  // Shapes
  floatingShape1: {
    position: 'absolute',
    top: height * 0.15,
    left: -60,
  },
  floatingShape2: {
    position: 'absolute',
    top: height * 0.3,
    right: -50,
  },
  floatingShape3: {
    position: 'absolute',
    top: height * 0.55,
    left: -40,
  },
  floatingShape4: {
    position: 'absolute',
    top: height * 0.7,
    right: -60,
  },
  floatingShape5: {
    position: 'absolute',
    top: height * 0.85,
    left: -50,
  },
  shape1: { width: 140, height: 140, borderRadius: 30 },
  shape2: { width: 180, height: 180, borderRadius: 40 },
  shape3: { width: 120, height: 120, borderRadius: 25 },
  shape4: { width: 160, height: 160, borderRadius: 35 },
  shape5: { width: 130, height: 130, borderRadius: 30 },

  // Particles
  particle1: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 123, 255, 0.5)',
    left: width * 0.2,
    top: -50,
  },
  particle2: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 99, 132, 0.4)',
    left: width * 0.7,
    top: -50,
  },
  particle3: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(75, 192, 192, 0.4)',
    left: width * 0.4,
    top: -50,
  },

  // Grid pattern overlay
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 123, 255, 0.15)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0, 123, 255, 0.15)',
  },

  // Glowing orbs
  glowOrb1: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.1,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 123, 255, 0.15)',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  glowOrb2: {
    position: 'absolute',
    top: height * 0.3,
    right: width * 0.1,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 99, 132, 0.12)',
    shadowColor: '#ff6384',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
  },
  glowOrb3: {
    position: 'absolute',
    bottom: height * 0.2,
    left: width * 0.2,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(75, 192, 192, 0.12)',
    shadowColor: '#4bc0c0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  glowOrb4: {
    position: 'absolute',
    bottom: height * 0.1,
    right: width * 0.2,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 159, 64, 0.12)',
    shadowColor: '#ff9f40',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
  },
});