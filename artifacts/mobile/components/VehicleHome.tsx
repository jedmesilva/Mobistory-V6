import React, { useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Animated, PanResponder, Platform,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { VEHICLE, RECORDS } from "@/constants/data";
import { R, S, F, I, IconBox, SectionLabel, VerifiedBadge, BackButton } from "@/components/shared";

const C = colors.light;

const RECORD_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  fuel: "droplet",
  tire: "disc",
  bonds: "user",
};

function handleRecordSelect(router: ReturnType<typeof useRouter>, id: string) {
  if (id === "bonds") {
    router.push("/all-bonds");
  } else {
    router.push("/activities");
  }
}

export default function VehicleHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [viewerExpanded, setViewerExpanded] = useState(false);
  const viewerHeight = useRef(new Animated.Value(200)).current;
  const isExpanded = useRef(false);
  const dragStartY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gs) => { dragStartY.current = gs.y0; },
      onPanResponderRelease: (_, gs) => {
        const dy = dragStartY.current - gs.moveY;
        if (dy > 40 && !isExpanded.current) {
          isExpanded.current = true;
          setViewerExpanded(true);
          Animated.spring(viewerHeight, { toValue: 340, useNativeDriver: false }).start();
        } else if (dy < -40 && isExpanded.current) {
          isExpanded.current = false;
          setViewerExpanded(false);
          Animated.spring(viewerHeight, { toValue: 200, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 100 : insets.bottom + 100;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.md, paddingTop: topPad + 8, paddingBottom: S.md }}>
        <BackButton onPress={() => router.push("/vehicles")} />
        <TouchableOpacity activeOpacity={0.7} style={{ padding: S.xs }}>
          <Feather name="message-circle" size={I.xxl} color={C.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* VEHICLE VIEWER */}
      <Animated.View style={{ height: viewerHeight, marginHorizontal: S.lg, borderRadius: S.xl, backgroundColor: "#EEF0F4", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <FontAwesome5 name="car" size={I.hero} color="#B0B7C3" />
        <Text style={{ fontSize: F.xxs, color: "#B0B7C3", fontWeight: "600" as const, letterSpacing: 1.5, marginTop: S.sm, textTransform: "uppercase" as const }}>Visualização 3D em breve</Text>
        <View {...panResponder.panHandlers} style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingVertical: S.md, alignItems: "center" }}>
          <View style={{ width: 40, height: 4, backgroundColor: C.separator, borderRadius: R.pill }} />
        </View>
        {viewerExpanded && (
          <TouchableOpacity
            onPress={() => { setViewerExpanded(false); isExpanded.current = false; Animated.spring(viewerHeight, { toValue: 200, useNativeDriver: false }).start(); }}
            activeOpacity={0.8}
            style={{ position: "absolute", bottom: 28, backgroundColor: "rgba(0,0,0,0.10)", borderRadius: R.pill, paddingVertical: S.xs, paddingHorizontal: S.xl }}>
            <Text style={{ fontSize: F.sm, color: C.textSecondary, fontWeight: "600" as const }}>Recolher</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* IDENTITY */}
      <View style={{ paddingHorizontal: S.xl, paddingTop: S.xl }}>
        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>Identidade</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, flexWrap: "wrap", marginTop: S.sm }}>
          <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5 }}>{VEHICLE.name}</Text>
          {VEHICLE.verified && <VerifiedBadge />}
        </View>
        <Text style={{ fontSize: F.base, color: C.textSecondary, marginTop: 3 }}>Versão {VEHICLE.version}</Text>

        {/* META CHIPS */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: S.xs, marginTop: S.md }}>
          {[
            { icon: "hashtag" as const, value: VEHICLE.plate },
            { icon: "calendar" as const, value: String(VEHICLE.year) },
            { icon: "droplet" as const, value: VEHICLE.fuel },
          ].map(({ icon, value }) => (
            <View key={value} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
              <Feather name={icon} size={I.xs} color={C.textTertiary} />
              <Text style={{ fontSize: F.xs, fontWeight: "500" as const, color: C.textSecondary }}>{value}</Text>
            </View>
          ))}
        </View>

        {/* QUICK ACTIONS */}
        <View style={{ flexDirection: "row", gap: S.sm, marginTop: S.md }}>
          <TouchableOpacity onPress={() => router.push("/identity")} activeOpacity={0.8}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: S.md, paddingHorizontal: S.md, backgroundColor: C.surface, borderRadius: R.xl }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}>
              <View style={{ width: 36, height: 36, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
                <FontAwesome5 name="car" size={I.lg} color={C.iconColor} />
              </View>
              <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary }}>Identidade</Text>
            </View>
            <Feather name="chevron-right" size={I.md} color={C.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/bond")} activeOpacity={0.8}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: S.md, paddingHorizontal: S.md, backgroundColor: C.surface, borderRadius: R.xl }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}>
              <IconBox iconType="user" size={I.lg} boxSize={36} radius={R.md} />
              <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary }}>Meu vínculo</Text>
            </View>
            <Feather name="chevron-right" size={I.md} color={C.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* RECORDS */}
      <View style={{ paddingHorizontal: S.xl, paddingTop: S.xxl }}>
        <SectionLabel title="Registros" actionLabel="Ver tudo" onAction={() => router.push("/records")} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: S.sm }}>
          {RECORDS.map(({ id, label, lastDate, lastValue }) => (
            <TouchableOpacity key={id} activeOpacity={0.8}
              onPress={() => handleRecordSelect(router, id)}
              style={{ width: "47.5%", flexGrow: 0, backgroundColor: C.surface, borderRadius: R.xl, padding: S.xl }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.md }}>
                <IconBox iconType={RECORD_ICONS[id] ?? "activity"} size={I.xl} boxSize={40} radius={R.md} />
                <Text style={{ fontSize: F.xs, color: C.textTertiary }}>{lastDate}</Text>
              </View>
              <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary }}>{label}</Text>
              <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 2 }}>{lastValue}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
