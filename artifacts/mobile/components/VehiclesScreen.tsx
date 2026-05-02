import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { MY_VEHICLES } from "@/constants/data";
import { R, S, F, I, VerifiedBadge } from "@/components/shared";

const C = colors.light;

export default function VehiclesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

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
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ padding: S.xs }}>
            <Feather name="menu" size={I.xxl} color={C.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={{ padding: S.xs }}>
            <Feather name="plus" size={I.xxl} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.xxl }}>Veículos</Text>

        {/* SEARCH */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.surface, borderRadius: R.xl, paddingVertical: 14, paddingHorizontal: S.lg, marginBottom: S.lg }}>
          <Feather name="search" size={I.lg} color={C.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar veículo..."
            placeholderTextColor={C.textTertiary}
            style={{ flex: 1, fontSize: F.base, color: C.textPrimary }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <Feather name="x" size={I.sm} color={C.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

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
    </View>
  );
}
