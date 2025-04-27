import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Shield, Server } from "lucide-react";

const ServicesPage = () => {
  return (
    <Page style={styles.page}>
      <Text style={styles.title}>Services</Text>

      <View style={styles.servicesGrid}>
        {/* Service 1 - Network Security */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <View style={styles.iconContainer}>
              <Shield size={20} color="#2563EB" />{" "}
            </View>
            <Text style={styles.serviceTitle}>Network Security</Text>
          </View>
          <Text style={styles.serviceDescription}>
            24/7 monitoring, threat detection, and immediate response to
            security incidents
          </Text>
        </View>

        {/* Service 2 - Infrastructure Management */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <View style={styles.iconContainer}>
              <Server size={20} color="#2563EB" />
            </View>
            <Text style={styles.serviceTitle}>Infrastructure Management</Text>
          </View>
          <Text style={styles.serviceDescription}>
            Proactive maintenance and optimization of your network
            infrastructure
          </Text>
        </View>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    width: 612, // 8.5in * 72dpi
    height: 792, // 11in * 72dpi
    alignSelf: "center",
    padding: 54, // 0.75in
    marginTop: 32, // mt-8
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, // for Android shadow
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 48,
  },
  servicesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 24, // gap-6 (6 * 4 = 24)
    marginBottom: 48,
  },
  serviceCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 24,
    width: "48%", // 2 columns
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#DBEAFE", // Tailwind blue-100
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  serviceDescription: {
    color: "#4B5563", // text-gray-600
    fontSize: 16,
  },
});

export default ServicesPage;
