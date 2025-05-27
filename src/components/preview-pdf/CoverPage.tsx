import { Page, View, Text, StyleSheet, Image } from "@react-pdf/renderer";

const CoverPage = ({ proposalTypeInfo, clientInfo }: any) => {
  const todayDate = new Date().toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });

  const proposalWords = proposalTypeInfo.description.split(" ");

  return (
    <Page style={styles.page}>
      {/* Top Half - Cover */}
      <View style={styles.cover}>
        {/* Background Image */}
        <Image
          src={`${import.meta.env.VITE_BASE_URL}${proposalTypeInfo.bgImage}`}
          style={styles.coverBackground}
        />

        {/* Agreement Date */}
        <View style={styles.agreementDate}>
          <Text style={styles.agreementDateLabel}>Agreement Date</Text>
          <Text style={styles.agreementDateValue}>{todayDate}</Text>
        </View>

        {/* Content */}
        <View style={styles.coverContent}>
          <View style={styles.coverTitle}>
            <Text style={styles.coverTitleText}>ITX Solutions</Text>
            <View style={styles.coverTitleLine} />
          </View>

          {/* Name of the Proposal */}
          <View style={styles.proposalName}>
            <Text style={styles.proposalNameText}>
              {proposalWords[0]}
              {"\n"}
              {proposalWords[1]}
              {"\n"}
              {proposalWords[2]}
            </Text>
            <Text style={styles.proposalSubTitle}>Service Agreement</Text>
          </View>
        </View>
      </View>

      {/* Bottom Half - Client Info */}
      <View style={styles.clientInfoSection}>
        <View style={styles.clientInfoCard}>
          <Text style={styles.clientInfoTitle}>Client Information</Text>

          <View style={styles.clientInfoGrid}>
            <View style={styles.clientInfoItem}>
              <Text style={styles.clientInfoLabel}>Business Name</Text>
              <Text style={styles.clientInfoValue}>
                {clientInfo.organization}
              </Text>
            </View>

            <View style={styles.clientInfoItem}>
              <Text style={styles.clientInfoLabel}>Contact Name</Text>
              <Text style={styles.clientInfoValue}>{clientInfo.name}</Text>
            </View>

            <View style={styles.clientInfoItem}>
              <Text style={styles.clientInfoLabel}>Title</Text>
              <Text style={styles.clientInfoValue}>{clientInfo.title}</Text>
            </View>

            <View style={styles.clientInfoItem}>
              <Text style={styles.clientInfoLabel}>Email</Text>
              <Text style={styles.clientInfoValue}>{clientInfo.email}</Text>
            </View>

            <View style={styles.clientInfoItem}>
              <Text style={styles.clientInfoLabel}>Phone</Text>
              <Text style={styles.clientInfoValue}>{clientInfo.phone}</Text>
            </View>

            <View style={styles.clientInfoItem}>
              <Text style={styles.clientInfoLabel}>Business Address</Text>
              <Text style={styles.clientInfoValue}>
                {clientInfo.streetAddress}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    width: 815, // 8.5in * 72dpi
    height: 1056, // 11in * 72dpi
    alignSelf: "center",
  },
  cover: {
    height: 396, // 5.5in * 72dpi
    position: "relative",
  },
  coverBackground: {
    width: "856px",
    height: "1000px",
  },
  agreementDate: {
    position: "absolute",
    top: 32,
    right: 54, // roughly 0.75in at 72dpi
    alignItems: "flex-end",
  },
  agreementDateLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
  },
  agreementDateValue: {
    fontSize: 13,
    color: "#ffffff",
    marginTop: 4,
  },
  coverContent: {
    position: "absolute",
    padding: 54, // 0.75in
    paddingTop: 86, // 24 * 4
  },
  coverTitle: {
    marginBottom: 28,
  },
  coverTitleText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  coverTitleLine: {
    width: 70,
    height: 4,
    backgroundColor: "#ffffff",
  },
  proposalName: {
    marginTop: 20,
  },
  proposalNameText: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  proposalSubTitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 20,
  },
  clientInfoSection: {
    height: 396, // 5.5in * 72dpi
    padding: 54, // 0.75in
    position: "relative",
  },
  clientInfoCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 32,
    height: "100%",
  },
  clientInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 32,
  },
  clientInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  clientInfoItem: {
    width: "48%",
    marginBottom: 30,
  },
  clientInfoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  clientInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
});

export default CoverPage;
