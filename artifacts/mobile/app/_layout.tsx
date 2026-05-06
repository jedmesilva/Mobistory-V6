import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InspectionsProvider } from "@/contexts/InspectionsContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="vehicles" options={{ headerShown: false, animation: "slide_from_left" }} />
      <Stack.Screen name="bond" options={{ headerShown: false }} />
      <Stack.Screen name="all-bonds" options={{ headerShown: false }} />
      <Stack.Screen name="activities" options={{ headerShown: false }} />
      <Stack.Screen name="activities/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="records" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="add-vehicle" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="add-bond" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="add-inspection" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="inspection-run" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <InspectionsProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <BottomSheetModalProvider>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </InspectionsProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
