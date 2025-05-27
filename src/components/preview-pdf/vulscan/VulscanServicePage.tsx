import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfStyles as shared } from "../styles/pdfStyles";

const styles = StyleSheet.create({
  ...shared,
  blueBullet: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: "#2563EB",
    marginTop: 4,
    marginRight: 12,
    flexShrink: 0,
  },
  sectionHeading: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 7,
    marginTop: 4,
    backgroundColor: "#F3F4F6",
    padding: 6,
    color: "#111827",
  },
  list: {
    marginLeft: 12,
    marginBottom: 6,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  listText: {
    fontSize: 11,
    lineHeight: 1.5,
    flex: 1,
  },
  bold: {
    fontWeight: "bold",
    color: "#1D4ED8",
  },
});

const whatWereDoing = [
  {
    label: "Monthly Automated Scans:",
    text: "We will use VulScan by RapidFireTools to identify security weaknesses within your network and systems. Scans are scheduled for the 15th of every month.",
  },
  {
    label: "Comprehensive Reporting:",
    text: "After each scan, you'll receive a clear, prioritized report detailing any discovered vulnerabilities and recommended remediation steps.",
  },
  {
    label: "Ongoing Support:",
    text: "We'll review findings with you, offer guidance on patching and configuration changes, and schedule additional scans if needed.\nScan Coverage: We'll be covering internal",
  },
  {
    label: "Internal Vulnerability Scanning:",
    text: "This process will help identify potential security risks within your internal infrastructure (e.g., servers, workstations, and other networked devices). Any recommended changes or configuration adjustments arising from these scans that fall outside the initial scope of this agreement may require additional fees. If such changes become necessary, we will provide a written estimate for your review and approval before proceeding.",
  },
];

const whyItMatters = [
  {
    label: "Enhanced Security:",
    text: "Regular scans help detect and address potential entry points for cyber threats, reducing the risk of a successful attack.",
  },
  {
    label: "Regulatory Compliance:",
    text: "Many industry regulations require or strongly recommend routine vulnerability assessments to maintain compliance.",
  },
  {
    label: "Proactive Risk Management:",
    text: "By identifying and mitigating risks early, you minimize disruptions and avoid costly breaches or downtime.",
  },
  {
    label: "Peace of Mind:",
    text: "Monthly scans ensure that you always have an up-to-date understanding of your security posture.",
  },
];

const howItHelps = [
  {
    label: "Protect Data & Reputation:",
    text: "Vulnerability scanning helps safeguard sensitive data and maintains customer trust.",
  },
  {
    label: "Prioritize Resources:",
    text: "Reports highlight the most critical issues first, enabling you to focus on the most impactful fixes.",
  },
  {
    label: "Visibility & Transparency:",
    text: "Regular assessments provide ongoing insight into your IT environment's weaknesses, keeping you informed about your security status.",
  },
];

const VulscanServicePage = () => (
  <Page style={styles.page}>
    <View>
      <Text style={styles.title}>Services</Text>

      {/* What We're Doing */}
      <Text style={styles.sectionHeading}>What We're Doing</Text>
      <View style={styles.list}>
        {whatWereDoing.map((item, idx) => (
          <View style={styles.listItem} key={idx}>
            <View style={styles.blueBullet} />
            <Text style={styles.listText}>
              <Text style={styles.bold}>{item.label}</Text> {item.text}
            </Text>
          </View>
        ))}
      </View>

      {/* Why It Matters */}
      <Text style={styles.sectionHeading}>Why It Matters</Text>
      <View style={styles.list}>
        {whyItMatters.map((item, idx) => (
          <View style={styles.listItem} key={idx}>
            <View style={styles.blueBullet} />
            <Text style={styles.listText}>
              <Text style={styles.bold}>{item.label}</Text> {item.text}
            </Text>
          </View>
        ))}
      </View>

      {/* How It Helps You */}
      <Text style={styles.sectionHeading}>How It Helps You</Text>
      <View style={styles.list}>
        {howItHelps.map((item, idx) => (
          <View style={styles.listItem} key={idx}>
            <View style={styles.blueBullet} />
            <Text style={styles.listText}>
              <Text style={styles.bold}>{item.label}</Text> {item.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  </Page>
);

export default VulscanServicePage;
