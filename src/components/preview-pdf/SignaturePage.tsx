import { Page, View, Text, StyleSheet, Link } from "@react-pdf/renderer";

const SignaturePage = () => {
  return (
    <Page style={styles.page}>
      <View style={styles.sectionContainer}>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Sign Name</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>Print Name</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>Title</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.line} />
        </View>

        <Link src="/confirm-agreement" style={styles.button}>
          <Text style={styles.buttonText}>Accept Quote</Text>
        </Link>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    width: 612, // 8.5 inches
    height: 792, // 11 inches
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
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  line: {
    borderBottomWidth: 2,
    borderBottomColor: "#D1D5DB",
    width: "100%",
    height: 2,
  },
  button: {
    backgroundColor: "#0EA5E9", // sky-500
    paddingVertical: 16,
    paddingHorizontal: 28,
    marginTop: 32,
    alignSelf: "flex-start",
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default SignaturePage;
