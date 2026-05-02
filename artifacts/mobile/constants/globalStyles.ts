import { StyleSheet } from "react-native";
import { C, R, S, F, I } from "./theme";

const g = StyleSheet.create({
  flex1: { flex: 1 },

  screenBg: { flex: 1, backgroundColor: C.background },
  surfaceBg: { flex: 1, backgroundColor: C.surface },

  screenPadH: { paddingHorizontal: S.xl },

  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowCenter: { flexDirection: "row", alignItems: "center", justifyContent: "center" },

  heroTitle: {
    fontSize: F.hero,
    fontWeight: "700",
    color: C.textPrimary,
    letterSpacing: -0.5,
    marginBottom: S.xxl,
  },
  sectionLabel: {
    fontSize: F.xs,
    fontWeight: "600",
    color: C.textTertiary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: S.md,
  },
  bodyText: { fontSize: F.base, color: C.textPrimary },
  bodyBold: { fontSize: F.base, fontWeight: "600", color: C.textPrimary },
  subText: { fontSize: F.sm, color: C.textSecondary },
  caption: { fontSize: F.xs, color: C.textTertiary },

  card: {
    backgroundColor: C.surface,
    borderRadius: R.xxl,
    padding: S.xl,
  },
  cardSm: {
    backgroundColor: C.surface,
    borderRadius: R.xl,
    padding: S.lg,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    backgroundColor: C.surface,
    borderRadius: R.xl,
    paddingVertical: 14,
    paddingHorizontal: S.lg,
    marginBottom: S.lg,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: R.md,
    backgroundColor: C.iconBg,
    alignItems: "center",
    justifyContent: "center",
  },

  divider: { height: 1, backgroundColor: C.border },

  backBtn: { padding: S.xs, marginBottom: S.xl, alignSelf: "flex-start" as const },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    backgroundColor: C.primary,
    borderRadius: R.xxl,
    paddingVertical: S.lg,
  },
  primaryBtnText: {
    fontSize: F.base,
    fontWeight: "700",
    color: C.primaryForeground,
  },

  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    backgroundColor: C.surface,
    borderRadius: R.xl,
    paddingVertical: S.md,
    paddingHorizontal: S.lg,
  },
  ghostBtnText: {
    fontSize: F.sm,
    fontWeight: "600",
    color: C.textSecondary,
  },

  destructiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    backgroundColor: "#FEF2F2",
    borderRadius: R.xl,
    paddingVertical: S.md,
    paddingHorizontal: S.lg,
  },
  destructiveBtnText: {
    fontSize: F.sm,
    fontWeight: "600",
    color: C.destructive,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.iconBg,
    borderRadius: R.pill,
    paddingVertical: 3,
    paddingHorizontal: S.sm,
  },
  chipText: { fontSize: F.xs, fontWeight: "500", color: C.textSecondary },

  successChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#DCFCE7",
    borderRadius: R.pill,
    paddingVertical: 3,
    paddingHorizontal: S.md,
  },
  successChipText: { fontSize: F.xs, fontWeight: "600", color: "#16A34A" },

  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.lg,
    paddingVertical: S.lg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  listRowLast: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.lg,
    paddingVertical: S.lg,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: S.xxxl,
    gap: S.sm,
  },
  emptyStateText: {
    fontSize: F.base,
    fontWeight: "600",
    color: C.textSecondary,
    textAlign: "center",
  },
  emptyStateCaption: {
    fontSize: F.sm,
    color: C.textTertiary,
    textAlign: "center",
    maxWidth: 240,
  },

  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: S.lg,
    borderRadius: R.pill,
    marginRight: S.sm,
  },
  filterChipText: { fontSize: F.sm, fontWeight: "600" },

  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  shadowLg: {
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});

export default g;
export { C, R, S, F, I };
