import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Package } from "lucide-react";
import { Section } from "../../lib/types";

const EquipmentPage = ({
  sections,
  proposalType,
}: {
  sections: Section[];
  proposalType?: string;
}) => {
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
                      <Package size={20} color="#9CA3AF" />
                    </View>
                  )}

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {proposalType === "buildouts" && item.description && (
                      <Text style={styles.itemDescription}>
                        {item.description}
                      </Text>
                    )}
                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>

                  <View style={styles.priceQuantityContainer}>
                    {proposalType === "buildouts" && item.unit_price && (
                      <Text style={styles.itemPrice}>
                        ${item.unit_price.toFixed(2)}/unit
                      </Text>
                    )}
                    <Text style={styles.itemQuantity}>
                      Quantity: {item.quantity}
                    </Text>
                  </View>
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
    padding: 40, // Reduced from 54
    marginTop: 24, // Reduced from 32
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20, // Reduced from 25
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 32, // Reduced from 48
  },
  contentBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 8, // Reduced from 12
    padding: 20, // Reduced from 28
    marginBottom: 24, // Reduced from 32
  },
  section: {
    marginBottom: 24, // Reduced from 32
  },
  sectionTitle: {
    fontSize: 11, // Reduced from 12
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12, // Reduced from 16
  },
  equipmentList: {
    backgroundColor: "#ffffff",
    borderRadius: 6, // Reduced from 8
    overflow: "hidden",
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  equipmentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // Reduced from 16
    padding: 8, // Reduced from 12
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 28, // Reduced from 34
    height: 28, // Reduced from 34
    borderRadius: 6, // Reduced from 8
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  imagePlaceholder: {
    width: 28, // Reduced from 34
    height: 28, // Reduced from 34
    borderRadius: 6, // Reduced from 8
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 11, // Reduced from 12
    fontWeight: "500",
    color: "#111827",
    marginBottom: 1,
  },
  itemCategory: {
    fontSize: 9,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  itemDescription: {
    fontSize: 9,
    color: "#4B5563",
    marginBottom: 4,
    marginTop: 2,
  },
  priceQuantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemPrice: {
    fontSize: 10,
    fontWeight: "600",
    color: "#15803D",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemQuantity: {
    fontSize: 9,
    fontWeight: "500",
    color: "#111827",
  },
});

export default EquipmentPage;
