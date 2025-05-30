import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Fee } from "../../lib/types";

const ServiceFeesPage = ({
  fees,
  proposalType,
}: {
  fees: Fee[];
  proposalType?: string;
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateNRCTotal = () => {
    return fees
      .filter((fee) => fee.type === "nrc")
      .reduce((total: number, fee: Fee) => total + Number(fee.amount), 0);
  };

  const getMRCFee = () => fees.find((fee) => fee.type === "mrc");
  const getMRCAmount = () => {
    const mrcFee = getMRCFee();
    return mrcFee ? Number(mrcFee.amount) : 0;
  };

  const nrcFees = fees.filter((fee) => fee.type === "nrc");
  const mrcFee = getMRCFee();

  // For MSP: extract per user and user count if available
  const perUser =
    mrcFee && mrcFee.feesPerUser ? Number(mrcFee.feesPerUser) : undefined;
  const totalUsers =
    mrcFee && mrcFee.totalUser ? Number(mrcFee.totalUser) : undefined;

  return (
    <Page style={styles.page}>
      <Text style={styles.title}>Service Fees</Text>

      <View style={styles.feeContainer}>
        {/* MRC Section */}
        <View style={styles.feeBox}>
          <View style={styles.feeHeader}>
            <Image
              src={`${import.meta.env.VITE_BASE_URL}/clock.png`}
              style={styles.icons}
            />
            <View>
              <Text style={styles.feeHeading}>
                Monthly Recurring Charges (MRC)
              </Text>
            </View>
          </View>

          {proposalType === "msp" && perUser && totalUsers ? (
            <>
              <View
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <Text style={styles.feeSubText}>Monthly Service Fee</Text>
                <Text style={styles.mspPerUserText}>
                  {formatCurrency(perUser)}/user x {totalUsers} Users
                </Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.feeSubText}>Total Monthly Fee</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(getMRCAmount())}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.feeSubText}>
                Billed Monthly for 36 months
              </Text>
              <Text style={styles.amountText}>
                {formatCurrency(getMRCAmount())}
                <Text style={styles.amountUnit}>/month</Text>
              </Text>
            </>
          )}
        </View>

        {/* NRC Section */}
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

          <Text style={styles.feeSubText}>One-time setup and installation</Text>

          <Text style={styles.amountText}>
            {formatCurrency(calculateNRCTotal())}
          </Text>

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
                  {formatCurrency(Number(fee.amount))}
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
    padding: 40,
    marginTop: 24,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 32,
  },
  feeContainer: {
    gap: 18,
    maxWidth: 512,
  },
  feeBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
  },
  feeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  feeHeading: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  feeSubText: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 0,
    marginTop: 4,
  },
  mspPerUserText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    marginVertical: 5,
    width: "100%",
  },
  nrcList: {
    marginTop: 16,
    gap: 8,
  },
  nrcItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 0,
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
    fontSize: 8,
    color: "#6B7280",
    marginTop: 4,
  },
  nrcAmount: {
    fontSize: 9,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2563EB",
    marginLeft: 4,
    marginTop: 8,
  },
  amountText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563EB",
    marginTop: 12,
  },
  amountUnit: {
    fontSize: 14,
    color: "#6B7280",
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
    width: 16,
    height: 16,
  },
});

export default ServiceFeesPage;
