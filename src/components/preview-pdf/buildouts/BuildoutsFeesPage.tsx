import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Fee } from "../../../lib/types";

const BuildoutsFeesPage = ({
  fees,
  totalEquipment,
  tax,
  totalEquipmentFees,
}: {
  fees: Fee[];
  totalEquipment: number;
  tax: number;
  totalEquipmentFees: number;
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateHalfLaborFee = () => {
    const totalLaborFee = fees
      .filter((fee: Fee) => fee.type === "nrc")
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    return totalLaborFee / 2;
  };

  const nrcFees = fees.filter((fee) => fee.type === "nrc");

  return (
    <Page style={styles.page}>
      <Text style={styles.title}>Service Fees</Text>

      <View style={styles.feeBox}>
        <View style={styles.feeHeader}>
          <Image
            src={`${import.meta.env.VITE_BASE_URL}/dollar.png`}
            style={styles.icons}
          />
          <View>
            <Text style={styles.feeHeading}>Non-Recurring Charges (NRC)</Text>
          </View>
        </View>

        {/* Total Equipment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Total Equipment</Text>
            <Text style={styles.sectionAmount}>{totalEquipment}</Text>
          </View>
        </View>

        {/* Tax Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tax</Text>
            <Text style={styles.sectionAmount}>{tax}%</Text>
          </View>
        </View>

        {/* Total Labor Section with NRC List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Total Labor</Text>
          </View>

          <View style={styles.nrcList}>
            {nrcFees.map((fee) => (
              <View key={fee.id} style={styles.nrcItem}>
                <View style={styles.nrcInfo}>
                  <Text style={styles.nrcDescription}>{fee.description}</Text>
                  {fee.notes && (
                    <Text style={styles.nrcNotes}>{fee.notes}</Text>
                  )}
                </View>
                <Text style={styles.nrcAmount}>
                  ${formatCurrency(Number(fee.amount))}
                </Text>
              </View>
            ))}
            {nrcFees.length === 0 && (
              <Text style={styles.emptyText}>No labor charges added</Text>
            )}
          </View>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total due at signing:</Text>
        </View>

        <View
          style={{
            ...styles.section,
            marginBottom: 0,
            backgroundColor: "transparent",
          }}
        >
          <View style={styles.sectionHeader}>
            <Text style={{ color: "#111827", fontSize: 10 }}>Equipment:</Text>
            <Text style={styles.sectionAmount}>
              ${formatCurrency(totalEquipmentFees)}
            </Text>
          </View>
        </View>

        <View style={{ ...styles.section, backgroundColor: "transparent" }}>
          <View style={styles.sectionHeader}>
            <Text style={{ color: "#111827", fontSize: 10 }}>Labor:</Text>
            <Text style={styles.sectionAmount}>
              ${formatCurrency(calculateHalfLaborFee())}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment Terms */}
      <View style={styles.termsBox}>
        <Text style={styles.termsTitle}>Payment Terms</Text>
        {[
          "First payment due upon agreement signing",
          "Net 14 days",
          "100% Equipment and 50% Labor",
          "50% Labor remainder paid upon job completion",
        ].map((term, index) => (
          <View key={index} style={styles.termItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.termText}>{term}</Text>
          </View>
        ))}
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    width: 816, // 8.5in
    minHeight: 1056, // min-height 11in
    alignSelf: "center",
    padding: 40,
    marginTop: 24,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
  },
  feeBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
  },
  feeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  feeHeading: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  section: {
    marginBottom: 18,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    padding: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#111827",
  },
  sectionAmount: {
    fontSize: 12,
    fontWeight: "600",
  },
  nrcList: {
    marginTop: 12,
    gap: 8,
  },
  nrcItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nrcInfo: {
    flex: 1,
    minWidth: 0,
  },
  nrcDescription: {
    fontSize: 10,
    fontWeight: "500",
    color: "#111827",
  },
  nrcNotes: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 4,
  },
  nrcAmount: {
    fontSize: 10,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
  },
  totalContainer: {
    marginTop: 20,
    padding: 8,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  termsBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 24,
    marginTop: 24,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  termItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },
  termText: {
    fontSize: 11,
    color: "#6B7280",
  },
  icons: {
    width: 20,
    height: 20,
  },
});

export default BuildoutsFeesPage;
