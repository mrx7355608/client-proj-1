import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Package } from "lucide-react";

const mockSections = [
  {
    id: "1",
    name: "Networking Equipment",
    equipment: [
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
      },
      {
        id: "2",
        name: "Switch Y200",
        category: "Switch",
        quantity: 5,
        image_url: "https://via.placeholder.com/64", // mock image
      },
    ],
  },
  {
    id: "2",
    name: "Security Devices",
    equipment: [
      {
        id: "3",
        name: "Firewall Z300",
        category: "Firewall",
        quantity: 1,
        image_url: "https://via.placeholder.com/64", // mock image
      },
    ],
  },
];

const EquipmentPage = () => {
  return (
    <Page style={styles.page}>
      <Text style={styles.title}>Equipment</Text>

      <View style={styles.contentBox}>
        {mockSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.name}</Text>

            <View style={styles.equipmentList}>
              {section.equipment.map((item) => (
                <View key={item.id} style={styles.equipmentItem}>
                  {item.image_url ? (
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.itemImage}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Package size={24} color="#9CA3AF" /> {/* gray-400 */}
                    </View>
                  )}

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>

                  <Text style={styles.itemQuantity}>
                    Quantity: {item.quantity}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    width: 612, // 8.5in
    height: 792, // 11in
    alignSelf: "center",
    padding: 54, // 0.75in
    marginTop: 32,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 48,
  },
  contentBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 32,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  equipmentList: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  equipmentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#F3F4F6", // gray-100
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  itemCategory: {
    fontSize: 14,
    color: "#6B7280", // gray-500
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
});

export default EquipmentPage;
