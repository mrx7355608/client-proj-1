import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "semibold",
    color: "#111827",
    marginBottom: 16,
    backgroundColor: "#F3F4F6",
    padding: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "semibold",
    color: "#1F2937",
    marginBottom: 12,
    backgroundColor: "#fff",
    padding: 0,
  },
  container: {
    width: "100%",
  },
  paragraphContainer: {
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 11,
    color: "#374151",
    lineHeight: 1.5,
    marginBottom: 15,
    width: "100%",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 12,
    paddingLeft: 8,
    paddingRight: 8,
    alignItems: "flex-start",
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
    marginTop: 4,
    marginRight: 12,
    flexShrink: 0,
  },
  listText: {
    fontSize: 11,
    color: "#374151",
    flex: 1,
    lineHeight: 1.5,
    paddingRight: 8,
  },
  boldText: {
    fontWeight: "bold",
    color: "#111827",
  },
  section: {
    marginBottom: 24,
  },
  termBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
  },
  termHeading: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 12,
  },
  bulletLabel: {
    fontWeight: "600",
    color: "#111827",
  },
}); 