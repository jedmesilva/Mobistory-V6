import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, Animated,
  FlatList, Platform,
} from "react-native";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { ACTIVITIES, ACTIVITY_TYPES, ActivityItem } from "@/constants/data";
import { R, S, F, I, getActivityIcon, SearchBar, SearchButton } from "@/components/shared";

const C = colors.light;

// The scroll threshold at which the large title is fully hidden
const THRESHOLD = 90;

function ActivityRow({ item, onPress }: { item: ActivityItem; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: S.md,
        paddingVertical: S.md,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        marginHorizontal: S.xl,
      }}
    >
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

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
);

export default function ActivitiesScreen() {
  const router = useRouter();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const insets = useSafeAreaInsets();
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const [activeType, setActiveType] = useState(filter && ACTIVITY_TYPES.some(t => t.id === filter) ? filter : "todos");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const scrollY = useRef(new Animated.Value(0)).current;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const activeFilters = activeType !== "todos" ? 1 : 0;

  // Only animate opacity — runs on native driver (smooth)
  const smallTitleOpacity = scrollY.interpolate({
    inputRange: [THRESHOLD * 0.6, THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [0, THRESHOLD * 0.6],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const filtered = ACTIVITIES.filter(a => {
    const matchType = activeType === "todos" || a.type === activeType;
    const matchQuery =
      query === "" ||
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  // Large title + search bar live INSIDE the FlatList as a header.
  // This means they scroll away naturally — no feedback loop with short lists.
  const ListHeader = (
    <Animated.View style={{ paddingHorizontal: S.xl, paddingBottom: S.md, opacity: largeTitleOpacity }}>
      <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.md }}>
        Atividades
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.sm }}>
        <SearchButton
          onPress={() => setSearchOpen(true)}
          placeholder="Buscar atividades..."
          value={query}
          style={{ flex: 1 }}
        />
        <TouchableOpacity
          onPress={() => filterSheetRef.current?.present()}
          activeOpacity={0.7}
          style={{ aspectRatio: 1, backgroundColor: C.surface, borderRadius: R.xl, alignItems: "center", justifyContent: "center", alignSelf: "stretch" }}
        >
          <Feather name="sliders" size={I.lg} color={activeFilters > 0 ? C.primary : C.iconColor} />
          {activeFilters > 0 && (
            <View style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, backgroundColor: C.primary, borderRadius: 4, borderWidth: 2, borderColor: C.background }} />
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>

      {/* ── STICKY TOP BAR ── fixed, always visible ──────────────────────── */}
      <View style={{ paddingTop: topPad + 8, paddingHorizontal: S.xl, paddingBottom: S.sm, backgroundColor: C.background }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {/* Back + fading small title */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}
          >
            <Feather name="arrow-left" size={I.xl} color={C.textSecondary} />
            <Animated.Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary, opacity: smallTitleOpacity }}>
              Atividades
            </Animated.Text>
          </TouchableOpacity>

          {/* Action buttons fade in as user scrolls */}
          <Animated.View style={{ flexDirection: "row", gap: S.sm, opacity: smallTitleOpacity }}>
            <TouchableOpacity
              onPress={() => setSearchOpen(true)}
              activeOpacity={0.7}
              style={{ width: 40, height: 40, backgroundColor: C.surface, borderRadius: R.xl, alignItems: "center", justifyContent: "center" }}
            >
              <Feather name="search" size={I.lg} color={C.iconColor} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => filterSheetRef.current?.present()}
              activeOpacity={0.7}
              style={{ width: 40, height: 40, backgroundColor: C.surface, borderRadius: R.xl, alignItems: "center", justifyContent: "center" }}
            >
              <Feather name="sliders" size={I.lg} color={activeFilters > 0 ? C.primary : C.iconColor} />
              {activeFilters > 0 && (
                <View style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, backgroundColor: C.primary, borderRadius: 4, borderWidth: 2, borderColor: C.background }} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* ── SCROLLABLE LIST — large title is PART of scroll content ─────── */}
      <Animated.FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={ListHeader}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }  // only opacity animated — native driver OK
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: bottomPad + 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: S.xxxl, gap: S.sm, paddingHorizontal: S.xl }}>
            <Feather name="activity" size={48} color={C.textTertiary} />
            <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textSecondary }}>
              Nenhuma atividade encontrada
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ActivityRow
            item={item}
            onPress={() => router.push(`/activities/${item.id}`)}
          />
        )}
      />

      {/* ── SEARCH FULLSCREEN OVERLAY ─────────────────────────────────────── */}
      {searchOpen && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.background, zIndex: 10 }}>
          <View style={{ paddingTop: topPad + 8, paddingHorizontal: S.xl, paddingBottom: S.md }}>
            <SearchBar
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar atividades..."
              rightElement={
                <TouchableOpacity onPress={() => { setQuery(""); setSearchOpen(false); }} activeOpacity={0.7}>
                  <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary }}>Cancelar</Text>
                </TouchableOpacity>
              }
            />
          </View>
          {query.length > 0 ? (
            <FlatList
              data={ACTIVITIES.filter(a =>
                a.title.toLowerCase().includes(query.toLowerCase()) ||
                a.desc.toLowerCase().includes(query.toLowerCase())
              )}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={{ paddingHorizontal: S.xl }}
              renderItem={({ item }) => (
                <ActivityRow
                  item={item}
                  onPress={() => { setSearchOpen(false); router.push(`/activities/${item.id}`); }}
                />
              )}
            />
          ) : (
            <View style={{ paddingHorizontal: S.xl }}>
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>
                Recentes
              </Text>
              <View style={{ alignItems: "center", paddingVertical: S.xxxl, gap: S.sm }}>
                <Feather name="search" size={I.xxxl} color={C.textTertiary} />
                <Text style={{ fontSize: F.sm, color: C.textTertiary }}>Nenhuma busca recente</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* ── FILTER BOTTOM SHEET ───────────────────────────────────────────── */}
      <BottomSheetModal
        ref={filterSheetRef}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={{ paddingBottom: bottomPad + 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.xl, paddingTop: S.sm, paddingBottom: S.md }}>
            <Text style={{ fontSize: F.xxl, fontWeight: "700" as const, color: C.textPrimary }}>Filtros</Text>
            <TouchableOpacity onPress={() => filterSheetRef.current?.dismiss()} activeOpacity={0.7}>
              <Feather name="x" size={I.md} color={C.textTertiary} />
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: S.xl }}>
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.md }}>
              Tipo de atividade
            </Text>
            {ACTIVITY_TYPES.map(f => (
              <TouchableOpacity
                key={f.id}
                onPress={() => { setActiveType(f.id); filterSheetRef.current?.dismiss(); }}
                activeOpacity={0.7}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.border }}
              >
                <Text style={{ fontSize: F.base, fontWeight: "500" as const, color: activeType === f.id ? C.textPrimary : C.textSecondary }}>
                  {f.label}
                </Text>
                {activeType === f.id && <Feather name="check" size={I.lg} color={C.success} />}
              </TouchableOpacity>
            ))}
            {activeFilters > 0 && (
              <TouchableOpacity
                onPress={() => { setActiveType("todos"); filterSheetRef.current?.dismiss(); }}
                activeOpacity={0.7}
                style={{ marginTop: S.lg, padding: S.md, backgroundColor: "#FEF2F2", borderRadius: R.xl, alignItems: "center" }}
              >
                <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.destructive }}>Limpar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
