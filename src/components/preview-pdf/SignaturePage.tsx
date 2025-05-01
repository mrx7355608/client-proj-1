import { Page, View, Text, StyleSheet, Link } from "@react-pdf/renderer";

const SignaturePage = ({
  proposalId,
  filename,
}: {
  proposalId: string;
  filename: string;
}) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;

  return (
    <Page style={styles.page}>
      <View style={styles.sectionContainer}>
        <View style={styles.inputBlock}>
          <View style={styles.line} />
          <Text style={styles.label}>Print Name</Text>
        </View>

        <View style={styles.inputBlock}>
          <View style={styles.line} />
          <Text style={styles.label}>Title</Text>
        </View>

        <View style={styles.inputBlock}>
          <View style={styles.line} />
          <Text style={styles.label}>Date</Text>
        </View>

        <View style={{ ...styles.inputBlock, marginTop: 35 }}>
          <View style={styles.line} />
          <Text style={styles.label}>Sign Name</Text>
        </View>

        <Link
          src={`${baseUrl}/confirm-agreement/${proposalId}?pdf=${filename}`}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Accept Quote</Text>
        </Link>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    width: 816, // 8.5 inches
    height: 1056, // 11 inches
    alignSelf: "center",
    padding: 54,
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  sectionContainer: {
    gap: 32,
    marginTop: 8,
  },
  inputBlock: {},
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#374151",
    marginTop: 8,
  },
  line: {
    borderBottomWidth: 2,
    borderBottomColor: "#D1D5DB",
    width: "100%",
    height: 2,
  },
  button: {
    backgroundColor: "#0EA5E9", // sky-500
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 32,
    alignSelf: "flex-start",
    borderRadius: 8,
    textDecoration: "none",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default SignaturePage;
