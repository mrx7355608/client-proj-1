import { View, Text, Page } from "@react-pdf/renderer";
import { pdfStyles as styles } from "../styles/pdfStyles";

export default function UNMServicesPage() {
  const services = [
    "Collaborating with pre-existing or new ISP.",
    "Implementing network cabling using CAT6.",
    "Programming the Unified Management Appliance and Firewall, with configurations including Wireless VLAN tagging, internet throughput, DHCP and DNS protocols, port spanning, switch stacking, security installations, and traffic control.",
    "Handling the installation and positioning of Access Point, Cameras, Firewall, and Switch.",
    "Testing all installed hardware and programmed elements - Guest Wireless Access, Switch Ports, Cameras and the Unified Cloud Management System",
    "Overhauling the existing setup for a cleaner, more efficient configuration.",
    "Provide Bi-Weekly Maintenance on Firmware and Software updates on the Network system.",
    "Provide Standard IT support on trouble shooting any devices that have any network related issues.",
    "Proactive engagement with carrier in resolving low latency or internet disconnects.",
  ];

  return (
    <Page>
      <View style={styles.page}>
        <Text style={styles.title}>Services</Text>
        {services.map((service, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>{service}</Text>
          </View>
        ))}
      </View>
    </Page>
  );
}
