import { View, Text, Page } from "@react-pdf/renderer";
import { pdfStyles as styles } from "../styles/pdfStyles";

const ParagraphSection = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => (
  <View style={styles.paragraphContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.paragraph}>{content}</Text>
  </View>
);

const ListSection = ({
  title,
  items,
}: {
  title: string;
  items: { title: string; content: string }[];
}) => (
  <View style={styles.paragraphContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {items.map((item, index) => (
      <View key={index} style={styles.listItem}>
        <View style={styles.bullet} />
        <Text style={styles.listText}>
          <Text style={styles.boldText}>{item.title}</Text> {item.content}
        </Text>
      </View>
    ))}
  </View>
);

export default function UNMTermsPage() {
  const scopeOfServices = [
    {
      title: "Installation and Configuration:",
      content:
        "ITX Solutions will professionally install and configure the necessary network infrastructure. This includes, but is not limited to, the placement of ethernet drops, termination of cables, and installation of key networking components such as firewalls, routers, switches, and access points.",
    },
    {
      title: "Network Management:",
      content:
        "ITX Solutions will actively manage the network to ensure smooth and reliable operations. This includes monitoring network performance, troubleshooting issues as they arise, and making necessary adjustments or improvements to optimize performance and minimize downtime.",
    },
    {
      title: "Firmware and Licensing:",
      content:
        "ITX Solutions will take responsibility for the management and timely updating of firmware on all hardware components. Additionally, ITX Solutions will handle the licensing requirements for all related software, ensuring that all components are up-to-date, secure, and compliant with relevant licensing regulations.",
    },
    {
      title: "IT Support:",
      content:
        "ITX Solutions will provide Level 1 IT support, addressing concerns related to the network and devices. This support includes, but is not limited to, troubleshooting hardware and software issues, responding to user queries, and providing guidance on best practices for device and network use.",
    },
  ];

  return (
    <Page>
      <View style={styles.page}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.paragraph}>
          These Terms of Service constitute the agreement ("Agreement") between
          ITX Solutions ("Provider", "we", "us", or "ITX Solutions") and the End
          User ("You", "Your" or "Client") of ITX Solutions' Business Network
          and IT Support Services ("Service", "Services"). ITX Solutions and the
          Client may be collectively referred to herein as the "Parties", and
          individually as "Party". This Agreement governs the Services, as well
          as the use of any ITX Solutions-supplied hardware and software, and
          any other networking or IT devices used in conjunction with the
          Services.
        </Text>

        <ParagraphSection
          title="1. Term and Termination"
          content="This Agreement is effective for 12 months from the date of installation, after which it shall automatically renew for successive terms of 12 months each, unless and until terminated by either party giving not less than 30 days written notice to the other. Any early termination of this Agreement by the Client, without cause, shall result in a termination fee equal to the lesser of 4 times the monthly service fee or the remaining contract value."
        />

        <ListSection title="2. Scope of Services" items={scopeOfServices} />
      </View>

      <View style={styles.page}>
        <ParagraphSection
          title="3. Exclusions"
          content="The services covered under this Agreement do not include any equipment, software, or third-party systems not installed, provided, or otherwise authorized by ITX Solutions."
        />

        <ParagraphSection
          title="4. Support Hours and Fees"
          content="Standard support hours are Monday through Friday, 9AM - 6PM Eastern Time. Emergency support required outside these hours will be billed at a premium rate of $150 per hour."
        />

        <ParagraphSection
          title="5. Payment Terms"
          content="Client will pay Service Provider within 7 days of receipt of invoice. Invoices unpaid and past due will be subject to a late payment charge of 3.5% per month on the unpaid balance, or the maximum allowable by law, whichever is lower."
        />

        <ParagraphSection
          title="6. Limitation of Liability"
          content="Except for damages arising out of a party's gross negligence, willful misconduct, or breach of its confidentiality obligations, neither party will be liable to the other for any special, indirect, incidental, consequential, exemplary, or punitive damages, whether based in contract, tort, or otherwise, arising out of or relating to this Agreement."
        />

        <ParagraphSection
          title="7. Property Rights"
          content="ITX Solutions retains ownership rights to all intellectual property, hardware, and equipment installed or utilized under this Agreement."
        />

        <ParagraphSection
          title="8. Dispute Resolution"
          content="This Agreement shall be governed by and construed in accordance with the laws of Florida. Any disputes arising out of this Agreement shall be resolved by binding arbitration conducted in Orange County, Florida, under the rules of the American Arbitration Association."
        />
        <ParagraphSection
          title="9. Amendments"
          content="This Agreement may only be modified or amended in a writing signed by both parties."
        />

        <ParagraphSection
          title="10. Service Level Agreement (SLA)"
          content="ITX Solutions commits to a response time of no more than 4 hours for any critical system or component failure related to devices installed by ITX Solutions."
        />
      </View>

      <View style={styles.page}>
        <ParagraphSection
          title="11. Force Majeure"
          content="ITX Solutions shall not be liable for failure or delay in performing its obligations under this Agreement due to circumstances beyond its reasonable control, including but not limited to acts of God, governmental actions, labor unrest, war, civil disturbance, fire, flood, or natural disaster."
        />

        <ParagraphSection
          title="12. Indemnification"
          content="The Client agrees to indemnify, defend and hold harmless ITX Solutions, its officers, directors, employees, agents, licensors, suppliers, and any third-party information providers from all losses, liabilities, expenses, damages, claims, demands and costs, including reasonable attorneys' fees, due to or arising out of any breach of this Agreement by the Client."
        />

        <ParagraphSection
          title="13. Confidentiality"
          content="Each party agrees to maintain the confidentiality of the Confidential Information of the other party, and to use such Confidential Information only for the purposes of this Agreement. This provision shall survive the termination or expiration of this Agreement."
        />
        <ParagraphSection
          title="14. Notice"
          content="Any notices under this Agreement must be given in writing and delivered by certified mail, or by a nationally recognized overnight courier service, to the addresses set forth in this Agreement or such other addresses as the parties may designate in writing."
        />

        <ParagraphSection
          title="15. Equipment Replacement"
          content="If a piece of equipment installed by ITX Solutions fails and needs to be replaced, but the replacement part is not immediately available, ITX Solutions will install a temporary alternative part at no additional charge, to ensure the continuity of service until the replacement part arrives and can be installed."
        />
      </View>

      <View style={styles.page}></View>
    </Page>
  );
}
