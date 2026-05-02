import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, TextInput, Modal, SafeAreaView,
  Animated, FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { ACTIVITIES, ACTIVITY_TYPES, ActivityItem } from "@/constants/data";
import { R, S, F, I, getActivityIcon } from "@/components/shared";
import EventDetailScreen from "@/components/EventDetailScreen";

const C = colors.light;

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface ActivityRowProps {
  item: ActivityItem;
  onPress: () => void;
}

function ActivityRow({ item, onPress }: ActivityRowProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "flex-start", gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.border }}>
      <View style={{ width: 36, height: 36, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
        <Feather name={getActivityIcon(item.iconType)} size={16} color={C.iconColor} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: S.sm }}>
          <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary, flex: 1 }} numberOfLines={1}>{item.title}</Text>
          {item.subcount > 0 && (
            <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 2, paddingHorizontal: 6 }}>
              <Text style={{ fontSize: F.xxs, fontWeight: "700" as const, color: C.textTertiary }}>+{item.subcount}</Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 2 }} numberOfLines={1}>{item.desc}</Text>
        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: S.sm }}>{item.date} · {item.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ActivitiesScreen({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [filterSheet, setFilterSheet] = useState(false);
  const [activeType, setActiveType] = useState("todos");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<ActivityItem | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  const activeFilters = activeType !== "todos" ? 1 : 0;

  const filtered = ACTIVITIES.filter(a => {
    const matchType = activeType === "todos" || a.type === activeType;
    const matchQuery = query === "" || a.title.toLowerCase().includes(query.toLowerCase()) || a.desc.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const THRESHOLD = 60;
  const largeTitleOpacity = scrollY.interpolate({ inputRange: [0, THRESHOLD], outputRange: [1, 0], extrapolate: "clamp" });
  const smallTitleOpacity = scrollY.interpolate({ inputRange: [0, THRESHOLD], outputRange: [0, 1], extrapolate: "clamp" });

  const topPad = insets.top;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.background }}>

        {/* STICKY HEADER */}
        <View style={{ paddingTop: topPad + 8, paddingHorizontal: S.xl, backgroundColor: C.background }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}>
              <Feather name="arrow-left" size={I.lg} color={C.textSecondary} />
              <Animated.Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary, opacity: smallTitleOpacity }}>Atividades</Animated.Text>
            </TouchableOpacity>
            <Animated.View style={{ flexDirection: "row", gap: S.sm, opacity: smallTitleOpacity }}>
              <TouchableOpacity onPress={() => setSearchOpen(true)} activeOpacity={0.7}
                style={{ width: 40, height: 40, backgroundColor: C.surface, borderRadius: R.xl, alignItems: "center", justifyContent: "center" }}>
                <Feather name="search" size={I.lg} color={C.iconColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterSheet(true)} activeOpacity={0.7}
                style={{ width: 40, height: 40, backgroundColor: C.surface, borderRadius: R.xl, alignItems: "center", justifyContent: "center" }}>
                <Feather name="sliders" size={I.lg} color={activeFilters > 0 ? C.primary : C.iconColor} />
                {activeFilters > 0 && <View style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, backgroundColor: C.primary, borderRadius: 4, borderWidth: 2, borderColor: C.background }} />}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* LARGE TITLE */}
          <Animated.View style={{ opacity: largeTitleOpacity }}>
            <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.md }}>Atividades</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.md }}>
              <TouchableOpacity onPress={() => setSearchOpen(true)} activeOpacity={0.7}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: S.sm, backgroundColor: C.surface, borderRadius: R.xl, paddingVertical: 12, paddingHorizontal: S.lg }}>
                <Feather name="search" size={I.lg} color={C.textTertiary} />
                <Text style={{ fontSize: F.base, color: C.textTertiary }}>{query ? query : "Buscar atividades..."}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterSheet(true)} activeOpacity={0.7}
                style={{ width: 44, height: 44, backgroundColor: C.surface, borderRadius: R.xl, alignItems: "center", justifyContent: "center" }}>
                <Feather name="sliders" size={I.lg} color={activeFilters > 0 ? C.primary : C.iconColor} />
                {activeFilters > 0 && <View style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, backgroundColor: C.primary, borderRadius: 4, borderWidth: 2, borderColor: C.background }} />}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* FEED */}
        <Animated.FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: S.xl, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: S.xxxl, gap: S.sm }}>
              <Feather name="activity" size={48} color={C.textTertiary} />
              <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textSecondary }}>Nenhuma atividade encontrada</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ActivityRow item={item} onPress={() => setSelectedEvent(item)} />
          )}
        />

        {/* SEARCH FULLSCREEN */}
        {searchOpen && (
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: C.background, zIndex: 10 }}>
            <View style={{ paddingTop: topPad + 8, paddingHorizontal: S.xl, paddingBottom: S.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.surface, borderRadius: R.xl, paddingVertical: 14, paddingHorizontal: S.lg }}>
                <Feather name="search" size={I.lg} color={C.textTertiary} />
                <TextInput
                  autoFocus
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Buscar atividades..."
                  placeholderTextColor={C.textTertiary}
                  style={{ flex: 1, fontSize: F.base, color: C.textPrimary }}
                />
                <TouchableOpacity onPress={() => { setQuery(""); setSearchOpen(false); }} activeOpacity={0.7}>
                  <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
            {query.length > 0 ? (
              <FlatList
                data={ACTIVITIES.filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.desc.toLowerCase().includes(query.toLowerCase()))}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={{ paddingHorizontal: S.xl }}
                renderItem={({ item }) => (
                  <ActivityRow item={item} onPress={() => { setSelectedEvent(item); setSearchOpen(false); }} />
                )}
              />
            ) : (
              <View style={{ paddingHorizontal: S.xl }}>
                <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>Recentes</Text>
                <View style={{ alignItems: "center", paddingVertical: S.xxxl, gap: S.sm }}>
                  <Feather name="search" size={I.xxxl} color={C.textTertiary} />
                  <Text style={{ fontSize: F.sm, color: C.textTertiary }}>Nenhuma busca recente</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* FILTER SHEET */}
        <Modal visible={filterSheet} transparent animationType="slide" onRequestClose={() => setFilterSheet(false)}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} activeOpacity={1} onPress={() => setFilterSheet(false)} />
          <View style={{ backgroundColor: C.surface, borderTopLeftRadius: R.xxl, borderTopRightRadius: R.xxl, paddingBottom: insets.bottom + 20 }}>
            <View style={{ alignItems: "center", paddingTop: S.md, marginBottom: S.md }}>
              <View style={{ width: 40, height: 4, backgroundColor: C.separator, borderRadius: R.pill }} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.xl, paddingBottom: S.md }}>
              <Text style={{ fontSize: F.xxl, fontWeight: "700" as const, color: C.textPrimary }}>Filtros</Text>
              <TouchableOpacity onPress={() => setFilterSheet(false)} activeOpacity={0.7}>
                <Feather name="x" size={I.md} color={C.textTertiary} />
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: S.xl }}>
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.md }}>Tipo de atividade</Text>
              {ACTIVITY_TYPES.map(f => (
                <TouchableOpacity key={f.id} onPress={() => { setActiveType(f.id); setFilterSheet(false); }} activeOpacity={0.7}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.border }}>
                  <Text style={{ fontSize: F.base, fontWeight: "500" as const, color: activeType === f.id ? C.textPrimary : C.textSecondary }}>{f.label}</Text>
                  {activeType === f.id && <Feather name="check" size={I.lg} color={C.success} />}
                </TouchableOpacity>
              ))}
              {activeFilters > 0 && (
                <TouchableOpacity onPress={() => { setActiveType("todos"); setFilterSheet(false); }} activeOpacity={0.7}
                  style={{ marginTop: S.lg, padding: S.md, backgroundColor: "#FEF2F2", borderRadius: R.xl, alignItems: "center" }}>
                  <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.destructive }}>Limpar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>

        {/* EVENT DETAIL */}
        <EventDetailScreen event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      </View>
    </Modal>
  );
}

const StyleSheet = {
  absoluteFillObject: { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 },
};
