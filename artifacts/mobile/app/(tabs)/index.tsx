import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { I, F, S, R } from "@/components/shared";
import VehicleHome from "@/components/VehicleHome";
import ActivitiesScreen from "@/components/ActivitiesScreen";
import VehiclesScreen from "@/components/VehiclesScreen";
import RegisterScreen from "@/components/RegisterScreen";
import BondScreen from "@/components/BondScreen";
import AllBondsScreen from "@/components/AllBondsScreen";

const C = colors.light;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [bondOpen, setBondOpen] = useState(false);
  const [allBondsOpen, setAllBondsOpen] = useState(false);

  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 50;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <VehicleHome
        onOpenVehicles={() => setVehiclesOpen(true)}
        onOpenBond={() => setBondOpen(true)}
        onOpenAllBonds={() => setAllBondsOpen(true)}
        onOpenRegister={() => setRegisterOpen(true)}
        onOpenActivities={() => setActivitiesOpen(true)}
        onOpenActions={() => setActivitiesOpen(true)}
      />

      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom, paddingTop: S.sm }]}>
        {/* HOME TAB */}
        <TouchableOpacity style={styles.navTab} activeOpacity={0.7}>
          <Feather name="home" size={I.xxl} color={C.primary} />
          <Text style={{ fontSize: F.xxs, fontWeight: "700" as const, color: C.primary }}>Início</Text>
        </TouchableOpacity>

        {/* FAB */}
        <TouchableOpacity onPress={() => setRegisterOpen(true)} activeOpacity={0.85}
          style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 }}>
          <Feather name="plus" size={I.xxxl} color={C.primaryForeground} />
        </TouchableOpacity>

        {/* ACTIVITIES TAB */}
        <TouchableOpacity style={styles.navTab} activeOpacity={0.7} onPress={() => setActivitiesOpen(true)}>
          <Feather name="activity" size={I.xxl} color={C.mutedForeground} />
          <Text style={{ fontSize: F.xxs, fontWeight: "500" as const, color: C.mutedForeground }}>Atividades</Text>
        </TouchableOpacity>
      </View>

      {/* MODALS */}
      <ActivitiesScreen visible={activitiesOpen} onClose={() => setActivitiesOpen(false)} />
      <VehiclesScreen visible={vehiclesOpen} onClose={() => setVehiclesOpen(false)} />
      <RegisterScreen visible={registerOpen} onClose={() => setRegisterOpen(false)} />
      <BondScreen
        visible={bondOpen}
        onClose={() => setBondOpen(false)}
        onOpenAllBonds={() => { setBondOpen(false); setAllBondsOpen(true); }}
      />
      <AllBondsScreen visible={allBondsOpen} onClose={() => setAllBondsOpen(false)} />
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  navTab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: S.sm,
  },
});
