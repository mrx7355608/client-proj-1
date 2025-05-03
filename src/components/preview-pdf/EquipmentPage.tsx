import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Package } from "lucide-react";
import { Section } from "../../lib/types";

const EquipmentPage = ({ sections }: { sections: Section[] }) => {
  return (
    <Page style={styles.page}>
      <Text style={styles.title}>Equipment</Text>

      <View style={styles.contentBox}>
        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.name}</Text>

            <View style={styles.equipmentList}>
              {section.equipment.map((item) => (
                <View key={item.inventory_item_id} style={styles.equipmentItem}>
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
    width: 816, // 8.5in
    height: 1056, // 11in
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
    fontSize: 25,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 48,
  },
  contentBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 28,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
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
    padding: 12,
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 34,
    height: 34,
    borderRadius: 8,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  imagePlaceholder: {
    width: 34,
    height: 34,
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
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 1,
  },
  itemCategory: {
    fontSize: 10,
    color: "#6B7280", // gray-500
  },
  itemQuantity: {
    fontSize: 10,
    fontWeight: "500",
    color: "#111827",
  },
});

export default EquipmentPage;
