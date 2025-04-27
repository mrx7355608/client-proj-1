import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const TermsAndConditionsPage = () => {
  return (
    <Page>
      {/* Page 1 */}
      <View style={styles.page}>
        <Text style={styles.title}>Terms and Conditions</Text>

        <View style={styles.sectionContainer}>
          <Text style={styles.paragraph}>
            These Terms of Service constitute the agreement ("Agreement")
            between ITX Solutions ("Provider", "we", "us", or "ITX Solutions")
            and the End User ("You", "Your" or "Client") of ITX Solutions'
            Business Network and IT Support Services ("Service", "Services").
            This Agreement governs the Services, as well as the use of any ITX
            Solutions-supplied hardware and software.
          </Text>

          <View style={styles.section}>
            <Text style={styles.heading}>1. Term and Termination</Text>
            <Text style={styles.paragraph}>
              This Agreement is effective for 48 months from the date of
              installation, with automatic renewal for successive 48-month terms
              unless terminated with 30 days written notice. Early termination
              fees apply.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>2. Support Hours and Fees</Text>
            <Text style={styles.paragraph}>
              Standard support hours are Monday through Friday, 9AM - 6PM
              Eastern Time. Emergency support outside these hours will be billed
              at $150 per hour.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>3. Payment Terms</Text>
            <Text style={styles.paragraph}>
              Client will pay Service Provider within 25 days of receipt of
              invoice. Late payments subject to 3.5% monthly charge.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>4. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              Neither party will be liable for special, indirect, incidental,
              consequential, exemplary, or punitive damages, except in cases of
              gross negligence or willful misconduct.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>5. Property Rights</Text>
            <Text style={styles.paragraph}>
              ITX Solutions retains ownership rights to all intellectual
              property, hardware, and equipment installed or utilized under this
              Agreement.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>6. Dispute Resolution</Text>
            <Text style={styles.paragraph}>
              This Agreement shall be governed by Florida law. Disputes shall be
              resolved by binding arbitration in Orange County, Florida.
            </Text>
          </View>
        </View>
      </View>

      {/* Page 2 */}
      <View style={styles.page}>
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <Text style={styles.heading}>7. Service Level Agreement (SLA)</Text>
            <Text style={styles.paragraph}>
              ITX Solutions commits to a 4-hour maximum response time for
              critical system failures.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>8. Force Majeure</Text>
            <Text style={styles.paragraph}>
              ITX Solutions shall not be liable for failures due to
              circumstances beyond reasonable control, including acts of God,
              governmental actions, or natural disasters.
            </Text>
          </View>
        </View>
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
    overflow: "hidden",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 48,
  },
  sectionContainer: {
    gap: 24,
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 22,
  },
});

export default TermsAndConditionsPage;
