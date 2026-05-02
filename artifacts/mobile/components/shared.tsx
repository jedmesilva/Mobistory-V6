import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  Modal,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { C, R, S, F, I } from "@/constants/theme";

export { C, R, S, F, I };

type FeatherName = React.ComponentProps<typeof Feather>["name"];

interface BackButtonProps {
  onPress: (e: GestureResponderEvent) => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ padding: S.xs, alignSelf: "flex-start" }}>
      <Feather name="arrow-left" size={I.xl} color={C.textSecondary} />
    </TouchableOpacity>
  );
}

export function getActivityIcon(iconType: string): FeatherName {
  switch (iconType) {
    case "fuel": return "droplet";
    case "gauge": return "disc";
    case "user": return "user";
    case "file": return "file-text";
    case "clock": return "clock";
    case "check": return "check-circle";
    case "shield": return "shield";
    default: return "activity";
  }
}

interface IconBoxProps {
  iconType: FeatherName;
  size?: number;
  boxSize?: number;
  radius?: number;
  bgColor?: string;
  iconColor?: string;
}

export function IconBox({ iconType, size = I.xl, boxSize = 44, radius = R.md, bgColor = C.iconBg, iconColor = C.iconColor }: IconBoxProps) {
  return (
    <View style={{ width: boxSize, height: boxSize, borderRadius: radius, backgroundColor: bgColor, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Feather name={iconType} size={size} color={iconColor} />
    </View>
  );
}

interface SectionLabelProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionLabel({ title, actionLabel, onAction }: SectionLabelProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.md }}>
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={{ fontSize: F.sm, fontWeight: "500" as const, color: C.accentForeground === C.textInverse ? C.primary : C.textSecondary }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface VerifiedBadgeProps {
  label?: string;
  small?: boolean;
}

export function VerifiedBadge({ label = "Verificado", small = false }: VerifiedBadgeProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.successBg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
      <Feather name="check-circle" size={small ? 9 : I.xs} color={C.success} />
      <Text style={{ fontSize: small ? F.xxs : F.xs, fontWeight: "600" as const, color: C.success }}>{label}</Text>
    </View>
  );
}

interface ActiveBadgeProps {
  active: boolean;
}

export function ActiveBadge({ active }: ActiveBadgeProps) {
  if (active) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.successBg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.md }}>
        <Feather name="check-circle" size={I.xs} color={C.success} />
        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.success }}>Ativo</Text>
      </View>
    );
  }
  return (
    <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.md }}>
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary }}>Encerrado</Text>
    </View>
  );
}

interface ActionButtonSquareProps {
  iconName: FeatherName;
  label: string;
  onPress?: () => void;
}

export function ActionButtonSquare({ iconName, label, onPress }: ActionButtonSquareProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ flex: 1, alignItems: "center", gap: S.sm, backgroundColor: C.surface, borderRadius: R.xl, paddingVertical: S.lg, paddingHorizontal: S.sm }}>
      <View style={{ width: 40, height: 40, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
        <Feather name={iconName} size={I.xl} color={C.iconColor} />
      </View>
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textSecondary }}>{label}</Text>
    </TouchableOpacity>
  );
}

export interface MenuAction {
  label: string;
  icon?: FeatherName;
  destructive?: boolean;
  onPress?: () => void;
}

interface MoreOptionsButtonProps {
  actions: MenuAction[];
  topOffset?: number;
  iosTitle?: string;
}

export function MoreOptionsButton({ actions, topOffset = 60, iosTitle }: MoreOptionsButtonProps) {
  const [open, setOpen] = useState(false);

  function handlePress() {
    if (Platform.OS === "ios") {
      const options = [...actions.map(a => a.label), "Cancelar"];
      const destructiveIndex = actions.findIndex(a => a.destructive);
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: iosTitle,
          options,
          cancelButtonIndex: options.length - 1,
          ...(destructiveIndex >= 0 ? { destructiveButtonIndex: destructiveIndex } : {}),
        },
        (i) => { if (i < actions.length) actions[i].onPress?.(); }
      );
    } else {
      setOpen(true);
    }
  }

  return (
    <>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={{ padding: S.xs }}>
        <Feather name="more-vertical" size={I.xxl} color={C.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setOpen(false)}>
          <View
            style={{
              position: "absolute",
              top: topOffset,
              right: S.xl,
              backgroundColor: C.surface,
              borderRadius: R.xl,
              shadowColor: "#000",
              shadowOpacity: 0.14,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 4 },
              elevation: 12,
              minWidth: 200,
              overflow: "hidden",
            }}
          >
            {actions.map((action, idx) => (
              <TouchableOpacity
                key={action.label}
                activeOpacity={0.7}
                onPress={() => { setOpen(false); action.onPress?.(); }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: S.md,
                  paddingVertical: 14,
                  paddingHorizontal: S.lg,
                  borderBottomWidth: idx < actions.length - 1 ? 1 : 0,
                  borderBottomColor: C.border,
                }}
              >
                {action.icon && (
                  <Feather
                    name={action.icon}
                    size={I.lg}
                    color={action.destructive ? C.destructive : C.textSecondary}
                  />
                )}
                <Text
                  style={{
                    fontSize: F.base,
                    fontWeight: "500" as const,
                    color: action.destructive ? C.destructive : C.textPrimary,
                  }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const searchBarStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: S.md,
  backgroundColor: C.surface,
  borderRadius: R.xl,
  paddingVertical: S.md,
  paddingHorizontal: S.lg,
};

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export function SearchBar({ value, onChangeText, placeholder = "Buscar...", autoFocus, rightElement, style }: SearchBarProps) {
  return (
    <View style={[searchBarStyle, style]}>
      <Feather name="search" size={I.lg} color={C.textTertiary} />
      <TextInput
        autoFocus={autoFocus}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textTertiary}
        style={{ flex: 1, fontSize: F.base, color: C.textPrimary, padding: 0, margin: 0 }}
      />
      {value.length > 0 && !rightElement && (
        <TouchableOpacity onPress={() => onChangeText("")} activeOpacity={0.7}>
          <Feather name="x" size={I.sm} color={C.textTertiary} />
        </TouchableOpacity>
      )}
      {rightElement}
    </View>
  );
}

interface SearchButtonProps {
  onPress: () => void;
  placeholder?: string;
  value?: string;
  style?: ViewStyle;
}

export function SearchButton({ onPress, placeholder = "Buscar...", value, style }: SearchButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[searchBarStyle, style]}>
      <Feather name="search" size={I.lg} color={C.textTertiary} />
      <Text style={{ flex: 1, fontSize: F.base, color: C.textTertiary }}>{value || placeholder}</Text>
    </TouchableOpacity>
  );
}

interface TimelineItemProps {
  iconName: FeatherName;
  label: string;
  desc: string;
  date: string;
  isLast?: boolean;
  iconColor?: string;
}

export function TimelineItem({ iconName, label, desc, date, isLast = false, iconColor = C.success }: TimelineItemProps) {
  return (
    <View style={{ flexDirection: "row", gap: S.lg, marginBottom: isLast ? 0 : S.xl }}>
      <View style={{ alignItems: "center" }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" }}>
          <Feather name={iconName} size={I.md} color={iconColor} />
        </View>
        {!isLast && <View style={{ width: 1, flex: 1, backgroundColor: C.border, marginTop: 4 }} />}
      </View>
      <View style={{ flex: 1, paddingTop: S.xs }}>
        <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{label}</Text>
        <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 2 }}>{desc}</Text>
        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: S.xs }}>{date}</Text>
      </View>
    </View>
  );
}
