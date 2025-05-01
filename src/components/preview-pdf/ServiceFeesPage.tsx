import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Clock, DollarSign } from "lucide-react";

const fees = {
  mrc: 129.99, // example monthly cost
  nrc: [
    {
      description: "Installation Fee",
      amount: 199.99,
      notes: "Includes hardware setup",
    },
    { description: "Configuration Fee", amount: 99.99 },
  ],
};

const formatCurrency = (value: number) => {
  return value.toFixed(2);
};

const calculateNRCTotal = () => {
  return fees.nrc.reduce((total, fee) => total + fee.amount, 0);
};

const ServiceFeesPage = () => {
  return (
    <Page style={styles.page}>
      <Text style={styles.title}>Service Fees</Text>

      <View style={styles.feeContainer}>
        {/* MRC */}
        <View style={styles.feeBox}>
          <View style={styles.feeHeader}>
            <Image
              src={`${import.meta.env.VITE_BASE_URL}/clock.png`}
              style={styles.icons}
            />{" "}
            <Text style={styles.feeHeading}>
              Monthly Recurring Charges (MRC)
            </Text>
          </View>
          <Text style={styles.feeSubText}>Billed monthly for 36 months</Text>
          <Text style={styles.amountText}>
            ${formatCurrency(fees.mrc)}
            <Text style={styles.amountUnit}>/month</Text>
          </Text>
        </View>

        {/* NRC */}
        <View style={styles.feeBox}>
          <View style={styles.feeHeader}>
            <Image
              src={`${import.meta.env.VITE_BASE_URL}/dollar.png`}
              style={styles.icons}
            />{" "}
            <Text style={styles.feeHeading}>Non-Recurring Charges (NRC)</Text>
          </View>
          <Text style={styles.feeSubText}>One-time setup and installation</Text>
          <Text style={styles.amountText}>
            ${formatCurrency(calculateNRCTotal())}
          </Text>

          <View style={styles.nrcList}>
            {fees.nrc.map((fee, index) => (
              <View key={index} style={styles.nrcItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nrcDescription}>{fee.description}</Text>
                  {fee.notes && (
                    <Text style={styles.nrcNotes}>{fee.notes}</Text>
                  )}
                </View>
                <Text style={styles.nrcAmount}>
                  ${formatCurrency(fee.amount)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Payment Terms */}
      <View style={styles.termsBox}>
        <Text style={styles.termsTitle}>Payment Terms</Text>
        {[
          "First payment due upon agreement signing",
          "Monthly payments due on the 1st of each month",
          "Net 30 payment terms",
          "Late payments subject to 1.5% monthly fee",
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
    padding: 44,
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: "relative",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 48,
  },
  feeContainer: {
    gap: 24,
    maxWidth: 512, // max-w-2xl
  },
  feeBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  feeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  feeHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  feeSubText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 16,
  },
  amountText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2563EB",
  },
  amountUnit: {
    fontSize: 18,
    color: "#6B7280",
  },
  nrcList: {
    marginTop: 14,
    gap: 10,
  },
  nrcItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nrcDescription: {
    fontSize: 10,
    fontWeight: "500",
    color: "#111827",
  },
  nrcNotes: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  nrcAmount: {
    fontSize: 10,
    fontWeight: "500",
    color: "#111827",
  },
  termsBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 32,
    marginTop: 22,
    paddingBottom: 25,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
  },
  termItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },
  termText: {
    fontSize: 12,
    color: "#6B7280",
    flexShrink: 1,
  },
  icons: {
    width: 18,
    height: 18,
  },
});

export default ServiceFeesPage;
