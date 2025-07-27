import { digestStringAsync } from "expo-crypto";
import * as LocalAuthentication from 'expo-local-authentication';

export const MASTER_KEY = "goodhackers_master_password";
export const SEC_Q1_KEY = "goodhackers_security_question_1";
export const SEC_Q1_ANSWER_KEY = "goodhackers_security_answer_1";
export const SEC_Q2_KEY = "goodhackers_security_question_2";
export const SEC_Q2_ANSWER_KEY = "goodhackers_security_answer_2";
export const BIOMETRIC_ENABLED_KEY = "goodhackers_biometric_enabled";

export async function sha256(input: string): Promise<string> {
  return await digestStringAsync("SHA-256", input);
}

// Check if device supports biometric authentication
export async function isBiometricSupported(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    // Check if fingerprint is specifically supported
    const supportsFingerprint = supportedTypes.includes(
      LocalAuthentication.AuthenticationType.FINGERPRINT
    );
    
    return hasHardware && isEnrolled && supportsFingerprint;
  } catch (error) {
    console.error('Error checking biometric support:', error);
    return false;
  }
}

// Authenticate with biometrics
export async function authenticateWithBiometrics(): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Good Hackers',
      subtitle: 'Use your fingerprint to access your passwords',
      fallbackLabel: 'Use Master Password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    
    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
}