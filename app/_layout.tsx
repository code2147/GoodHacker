import { Stack } from "expo-router/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="login" />
        <Stack.Screen name="reset" />
        <Stack.Screen name="passwords" />
      </Stack>
    </SafeAreaProvider>
  );
}