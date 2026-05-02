import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform,
  Modal, Animated, Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { MY_VEHICLES } from "@/constants/data";
import { R, S, F, I, VerifiedBadge, SearchBar } from "@/components/shared";

const C = colors.light;
const DRAWER_WIDTH = Dimensions.get("window").width * 0.72;

type FeatherName = React.ComponentProps<typeof Feather>["name"];

const MENU_ITEMS: { icon: FeatherName; label: string; route?: string }[] = [
  { icon: "home",       label: "Início" },
  { icon: "truck",        label: "Veículos" },
  { icon: "activity",   label: "Atividades" },
  { icon: "file-text",  label: "Registros" },
];

const MENU_BOTTOM: { icon: FeatherName; label: string }[] = [
  { icon: "settings",   label: "Configurações" },
  { icon: "log-out",    label: "Sair" },
];

function SideDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 180 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Backdrop */}
        <Animated.View
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", opacity }}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        {/* Drawer */}
        <Animated.View style={{
          width: DRAWER_WIDTH,
          height: "100%",
          backgroundColor: C.background,
          transform: [{ translateX }],
          paddingTop: (Platform.OS === "web" ? 67 : insets.top) + S.xl,
          paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + S.xl,
          paddingHorizontal: S.xl,
        }}>
          {/* Profile area */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, marginBottom: S.xxl }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" }}>
              <Feather name="user" size={I.xl} color={C.textSecondary} />
            </View>
            <View>
              <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary }}>Lucas Mendes</Text>
              <Text style={{ fontSize: F.xs, color: C.textTertiary }}>Proprietário</Text>
            </View>
          </View>

          {/* Nav items */}
          <View style={{ flex: 1, gap: S.xs }}>
            {MENU_ITEMS.map(({ icon, label }) => (
              <TouchableOpacity
                key={label}
                onPress={onClose}
                activeOpacity={0.7}
                style={{ flexDirection: "row", alignItems: "center", gap: S.md, paddingVertical: S.md, paddingHorizontal: S.md, borderRadius: R.xl }}
              >
                <Feather name={icon} size={I.lg} color={C.textSecondary} />
                <Text style={{ fontSize: F.base, fontWeight: "500" as const, color: C.textPrimary }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom items */}
          <View style={{ gap: S.xs }}>
            <View style={{ height: 1, backgroundColor: C.border, marginBottom: S.xs }} />
            {MENU_BOTTOM.map(({ icon, label }) => (
              <TouchableOpacity
                key={label}
                onPress={onClose}
                activeOpacity={0.7}
                style={{ flexDirection: "row", alignItems: "center", gap: S.md, paddingVertical: S.md, paddingHorizontal: S.md, borderRadius: R.xl }}
              >
                <Feather name={icon} size={I.lg} color={label === "Sair" ? C.destructive : C.textSecondary} />
                <Text style={{ fontSize: F.base, fontWeight: "500" as const, color: label === "Sair" ? C.destructive : C.textPrimary }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function VehiclesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = MY_VEHICLES.filter(v =>
    v.name.toLowerCase().includes(query.toLowerCase()) ||
    v.plate.toLowerCase().includes(query.toLowerCase()) ||
    v.bond.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: topPad + S.lg, paddingBottom: S.xxxl + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.xl }}>
          <TouchableOpacity onPress={() => setDrawerOpen(true)} activeOpacity={0.7} style={{ padding: S.xs }}>
            <Feather name="menu" size={I.xxl} color={C.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={{ padding: S.xs }}>
            <Feather name="plus" size={I.xxl} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.xxl }}>Veículos</Text>

        {/* SEARCH */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar veículo..."
          style={{ marginBottom: S.lg }}
        />

        {/* VEHICLE CARDS */}
        {filtered.length > 0 ? (
          filtered.map(v => (
            <TouchableOpacity key={v.id} onPress={() => router.back()} activeOpacity={0.8}
              style={{ flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.surface, borderRadius: R.xxl, padding: S.lg, marginBottom: S.sm }}>
              <View style={{ width: 72, height: 72, borderRadius: R.xl, backgroundColor: "#EEF0F4", alignItems: "center", justifyContent: "center" }}>
                <Feather name="truck" size={I.xxxl} color={C.textTertiary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: 3 }}>
                  <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary }} numberOfLines={1}>{v.name}</Text>
                  {v.verified && <VerifiedBadge label="" small />}
                </View>
                <Text style={{ fontSize: F.sm, color: C.textSecondary, marginBottom: 4 }}>Versão {v.version}</Text>
                <Text style={{ fontSize: F.xs, color: C.textTertiary }}>{v.plate} · {v.year} · {v.bond}</Text>
              </View>
              <Feather name="chevron-right" size={I.md} color={C.textTertiary} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ alignItems: "center", paddingVertical: S.xxxl, gap: S.sm }}>
            <Feather name="truck" size={48} color={C.textTertiary} />
            <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textSecondary, textAlign: "center" }}>
              {query ? `Nenhum veículo encontrado para "${query}"` : "Você ainda não tem veículos"}
            </Text>
            <Text style={{ fontSize: F.sm, color: C.textTertiary, textAlign: "center", maxWidth: 240 }}>
              {query ? "Tente buscar por nome, placa ou tipo de vínculo" : "Adicione um veículo para começar a registrar eventos"}
            </Text>
          </View>
        )}

        {/* ADD BUTTON */}
        <TouchableOpacity activeOpacity={0.85}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, backgroundColor: C.primary, borderRadius: R.xxl, paddingVertical: S.lg, marginTop: filtered.length > 0 ? S.xl : S.lg }}>
          <Feather name="plus" size={I.lg} color={C.primaryForeground} />
          <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.primaryForeground }}>Adicionar veículo</Text>
        </TouchableOpacity>
      </ScrollView>

      <SideDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}
