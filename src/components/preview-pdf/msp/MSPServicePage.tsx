import { View, Text, Page } from "@react-pdf/renderer";
import { pdfStyles as styles } from "../styles/pdfStyles";

const BulletPointSection = ({
  title,
  items,
  description,
}: {
  title: string;
  items: string[];
  description?: string;
}) => (
  <View style={styles.paragraphContainer}>
    {title && (
      <Text
        style={{ ...styles.sectionTitle, backgroundColor: "#eee", padding: 6 }}
      >
        {title}
      </Text>
    )}
    {description && <Text style={styles.paragraph}>{description}</Text>}
    {items.map((item, index) => (
      <View key={index} style={styles.listItem}>
        <View style={styles.bullet} />
        <Text style={styles.listText}>{item}</Text>
      </View>
    ))}
  </View>
);

const ParagraphSection = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => (
  <View style={styles.paragraphContainer}>
    <Text
      style={{ ...styles.sectionTitle, backgroundColor: "#eee", padding: 6 }}
    >
      {title}
    </Text>
    <Text style={styles.paragraph}>{content}</Text>
  </View>
);

export default function MSPServicePage() {
  const itSupportServices = [
    "Remote Support Services with a minimum of ½ hour increments",
    "Includes Onsite Support Services with a minimum of 1 hour increments",
    "Quick and Easy access to an online Trouble Ticket Support system (allows creation of new tickets, following updates on existing tickets, and checking old tickets)",
    "PC, iPad, MAC, Chromebook, and Laptop Troubleshooting and Support",
    "Software and Hardware Upgrades (hardware – additional cost will apply)",
    "Office Printers and Scanner Support",
    "Installations and Migration of older workstations",
    "Virus, Malware, and Spyware removal",
    "Wireless Networking and LAN Networking Support",
    "Email Management",
  ];

  const workstationServices = [
    "Remote Support Services",
    "User Account and Policy Management",
    "Security Patch Management",
    "File System Management",
    "Software License Reporting",
    "Client Network Configuration Management",
    "Disk Space and Usage Management",
    "Software Deployment",
    "Anti-Virus / Malware Management and Removal",
    "Printer Management",
  ];

  const auditReports = [
    "Summary of Work station and Server alerts in the Month.",
    "Windows Patch and Update Management.",
    "Virus Definitions Updates.",
    "Tickets- opened, in progress, and completed.",
    "Verification of Workstations, Firewall, and Server on or off the Network.",
  ];

  const thirdPartySupport = [
    "One call to ITX Engineers and they will be the liaison for issues with applications and vendors.",
    "Track issues through resolution and provide analysis of the service issue.",
    "Consistent communication to help expedite a resolution with one person responsible.",
    "Increased efficiency – users do not have to wait on-line with vendor representatives to resolve issues.",
    "Upgrading or replacing hardware or software normally requires on-site service. Fees do not include the cost of new or replacement hardware, software, cabling, or other equipment that may be required to perform services under this agreement. ITX will quote a price for new or replacement equipment and on-site support prior to installation. This service will be billed separately.",
  ];

  const userSupportAccess = {
    content:
      "Users may contact the Helpdesk for general IT support, questions, and issues as needed. Helpdesk hours of operation are from Monday-Friday 8am-6pm. During regular business hours, ITX Solutions provides end user support via email, telephone, and secure remote sessions where our technicians work directly on the end user's machine. We employ a sophisticated software-based application for remote access to the server, client desktops, and laptops. User chat, email interaction, and start control remote session are included. Most often, through the remote agent and start control support, we can resolve issues in this manner.",
  };

  const ticketingSystem = {
    content:
      "Keeping track of tasks through a ticketing system will allow for detailed updates and timelines throughout each process of the IT support and management. A client portal will be created, this will anyone to add, change, delete or monitor items on each ticket. There are additional user and admin permission controls providing various access levels to the system.",
  };

  const onsiteServices = [
    "Workstation moves and changes",
    "Chromebook and iPad moves and changes",
    "Server moves and changes",
    "Hardware upgrades and new setups",
    "Training and enhancing end user computer usage",
  ];

  const unifiedNetworkManagement = [
    "Client Account Management and Control",
    "Firewall Security Patch Management",
    "VLAN Management and Control",
    "Internet Circuit and Bandwidth Management",
    "Client Network Configuration Management",
    "Continuous Monitoring and Reporting",
    "Switch Level Management and Reporting",
    "Unified System Control and Cloud Network Management",
  ];

  const unifiedFeatures = [
    "Remote configuration and setup",
    "Onsite support during high level service outages",
    "Hardware maintenance and updates",
    "Equipment Warranty",
    "Increase efficiency - respond faster to problems and meet required service levels",
    "Increase effectiveness - unified control and consistency.",
    "Realize value - reduce your cost of ownership for managed expansion and growth",
  ];

  const unifiedServices = [
    "Assist with the allocation of new systems and network changes",
    "Assist in hardware failure determination and resolution",
    "Assist in hardware maintenance as needed; diagnosis and repair of defective hardware by replacing parts; and installation of hardware upgrades and new systems",
  ];

  const unifiedTroubleshooting = [
    "One point of contact - easy to remember and hand off for all aspects of the issue",
    "Consistent communication - helps to expedite a resolution",
    "Increased efficiency - users do not have to wait on-line with vendor representatives to resolve issues",
  ];

  const disasterRecovery = {
    content:
      "Hardware Failure – Manufacturer Warranty is covered by ITX's partner group. One year Manufacturer Warranty on all Unified Access Points. The UI Care – 5 year Priority Manufacturer Warranty, RMA Service, and Replacement Services on all Unified Switches and UDM Appliance. In case of any emergency hardware failures, all UI covered hardware is available for overnight delivery. Any equipment under UI Care will not be charged, this includes the Unified Firewall, and the Unified 48 Port and 24 Port Switches. Any equipment outside of warranty will include an equipment charge and overnight cost. All labor to re-program and install faulty equipment is included in the Unified Network / Cloud Management Services (SLA) – at no cost to you!",
  };

  return (
    <Page>
      <View style={styles.page}>
        <Text style={styles.title}>Services</Text>
        <BulletPointSection
          title="IT Support Services"
          items={itSupportServices}
        />
        <BulletPointSection
          title="Work Station Managed IT Service"
          items={workstationServices}
        />
      </View>

      <View style={styles.page}>
        <BulletPointSection
          title="Audit Reports Include"
          items={auditReports}
        />
        <BulletPointSection
          title="Third Party Software & Hardware Support"
          items={thirdPartySupport}
          description="As an added service, ITX will provide support coordination for any supported third-party software and Hardware vendor."
        />
        <ParagraphSection
          title="User Support Access"
          content={userSupportAccess.content}
        />
      </View>

      <View style={styles.page}>
        <ParagraphSection
          title="Ticketing System Features"
          content={ticketingSystem.content}
        />
        <BulletPointSection
          title="Onsite Services"
          items={onsiteServices}
          description="Onsite services will be included on an as-Needed basis. ITX Solutions will supply onsite support to fulfill end user IT related issues and questions."
        />
      </View>
      <View style={styles.page}>
        <Text style={{ ...styles.title, fontSize: 22 }}>
          Unified Network / Cloud Management Services (SLA)
        </Text>
        <Text style={styles.paragraph}>
          Unified Network Management Services provides a proactive network and
          cloud management support service for the unified network systems.
        </Text>

        <Text
          style={{
            ...styles.sectionTitle,
            backgroundColor: "#eee",
            padding: 6,
          }}
        >
          Network System Administration
        </Text>
        <Text style={styles.paragraph}>
          The SLA is bundled with discretionary onsite system administration
          hours that you can use whenever you need our engineers to perform
          network tasks on-site.
        </Text>

        <BulletPointSection
          title="On-going Unified Network Management"
          items={unifiedNetworkManagement}
        />
        <BulletPointSection
          title="Unified Features & Benefits"
          items={unifiedFeatures}
        />
      </View>

      <View style={styles.page}>
        <BulletPointSection
          title="Unified Comprehensive Services"
          items={unifiedServices}
          description="On-site engineer can perform any of these tasks:"
        />
        <BulletPointSection
          title="Unified Troubleshooting Benefits with Third Party Vendors"
          items={unifiedTroubleshooting}
        />
        <ParagraphSection
          title="Disaster Recovery Coverage"
          content={disasterRecovery.content}
        />
      </View>

      <View style={styles.page}>
        <Text style={styles.title}>Qualifications</Text>
        <BulletPointSection
          title=""
          items={[
            "A Network Rack or Cabinet must be available for all Unified Equipment",
            "Proper ventilation and temperature controls inside the Network environment.",
            "Uninterrupted Power Supply units with the proper voltage and available battery for any sudden surges",
            "Full Access to the network equipment for any equipment changes or updates.",
            "All Unified network appliances and switches is ONLY administered by Bluefire IT Solutions personnel.",
            "Under this coverage, during a major outage, Bluefire IT Solutions will restore any operational Unified appliances or switch to the point of the last successful backup if required.",
          ]}
          description="In order to qualify for the Bluefire IT Solutions Unified Management Coverage, your environment must comply with the following requirements."
        />
      </View>

      <View style={styles.page}>
        <Text style={styles.title}>
          DNS Filtering & Virus Protection Solution
        </Text>

        <BulletPointSection
          title="Advanced machine learning and cloud-based protection"
          items={[
            "Multi-vector protection against malicious files, scripts, exploits and URLs",
            "Remote policy definition and management",
            "Precision monitoring and roll-back capabilities for auto-restoring and infected files",
          ]}
        />

        <BulletPointSection
          title="Collective threat intelligence"
          items={[
            "Powered by advanced machine learning",
            "Predictive analytics provides automated protection against zero-day threats",
            "Requires minimal human interaction",
          ]}
        />

        <BulletPointSection
          title="Superior speed and efficiency"
          items={[
            "Nimble agent designed for minimal footprint and system performance impact",
            "Easy to deploy and installs in seconds",
            "Ultra-fast scans",
          ]}
        />

        <BulletPointSection
          title="Cloud-based architecture"
          items={[
            "Continuously correlates and analyzes data",
            "Access to advanced computing power",
          ]}
        />
      </View>
    </Page>
  );
}
