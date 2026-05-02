import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { I, F, S, R } from "@/components/shared";
import VehicleHome from "@/components/VehicleHome";

const C = colors.light;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <VehicleHome />

      {/* BOTTOM NAV */}
      <View style={[
        styles.bottomNav,
        { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom, paddingTop: S.sm }
      ]}>
        <TouchableOpacity style={styles.navTab} activeOpacity={0.7}>
          <Feather name="home" size={I.xxl} color={C.primary} />
          <Text style={{ fontSize: F.xxs, fontWeight: "700" as const, color: C.primary }}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          activeOpacity={0.85}
          style={styles.fab}
        >
          <Feather name="plus" size={I.xxxl} color={C.primaryForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          activeOpacity={0.7}
          onPress={() => router.push("/activities")}
        >
          <Feather name="activity" size={I.xxl} color={C.mutedForeground} />
          <Text style={{ fontSize: F.xxs, fontWeight: "500" as const, color: C.mutedForeground }}>Atividades</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: S.xxxl,
    backgroundColor: C.surface,
    elevation: 0,
  },
  navTab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: S.sm,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});
