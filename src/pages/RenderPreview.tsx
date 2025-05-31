import { PDFViewer } from "@react-pdf/renderer";
import AgreementPDF from "../components/preview-pdf/AgreementPDF";
import { Fee } from "../lib/types";

const mockSections = [
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
        description:
          "Firewall Z300 is a security device that protects the network from unauthorized access.",
        unit_price: 100,
      },
      {
        id: "3",
        name: "Firewall Z300",
        category: "Firewall",
        quantity: 1,
        image_url: "https://via.placeholder.com/64", // mock image
        description:
          "Firewall Z300 is a security device that protects the network from unauthorized access.",
        unit_price: 100,
      },
      {
        id: "3",
        name: "Firewall Z300",
        category: "Firewall",
        quantity: 1,
        image_url: "https://via.placeholder.com/64", // mock image
        description:
          "Firewall Z300 is a security device that protects the network from unauthorized access.",
        unit_price: 100,
      },
      {
        id: "3",
        name: "Firewall Z300",
        category: "Firewall",
        quantity: 1,
        image_url: "https://via.placeholder.com/64", // mock image
        description:
          "Firewall Z300 is a security device that protects the network from unauthorized access.",
        unit_price: 100,
      },
    ],
  },
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
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "2",
        name: "Switch Y200",
        category: "Switch",
        quantity: 5,
        image_url: "https://via.placeholder.com/64", // mock image
        description:
          "Switch Y200 is a network device that connects devices to the network.",
        unit_price: 100,
      },
    ],
  },
  {
    id: "3",
    name: "Security Devices",
    equipment: [
      {
        id: "2",
        name: "Switch Y200",
        category: "Switch",
        quantity: 5,
        image_url: "https://via.placeholder.com/64", // mock image
        description:
          "Switch Y200 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "2",
        name: "Switch Y200",
        category: "Switch",
        quantity: 5,
        image_url: "https://via.placeholder.com/64", // mock image
        description:
          "Switch Y200 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
      {
        id: "1",
        name: "Router X100",
        category: "Router",
        quantity: 2,
        image_url: null, // no image, should show fallback
        description:
          "Router X100 is a network device that connects devices to the network.",
        unit_price: 100,
      },
    ],
  },
];

const mockFees: Fee[] = [
  {
    id: "1",
    amount: "100",
    description: "Setup Fee",
    notes: `9U Wall Mounted Rack x 1 (In Room with no Rack) 
24 Port Patch Panel x 4 (Possible Replacements) 
Patch Cables x 700 DAC Cables (10GB) x 16 
SmartPower Cables x 26 
SFP Modules (Fiber SM/MM LC -10GB) x 30`,
    type: "nrc",
    feesPerUser: "10",
    totalUser: "10",
  },
  {
    id: "2",
    amount: "100",
    description: "Monthly Fee",
    notes: `- Tear down all the existing network equipment (HP Procurve and Cisco Catalyst Switches, Ruckus Appliance) in the MDF and all the HP Procurve and Cisco Catalyst Switches in the IDF locations throughout the campus. Replace all the HP and Cisco switches with Unifi Pro Switches. Replace Juniper Firewall with Unifi Pro Max 10GB Firewall. Clean up all patch cables in the MDF and each IDF location. Update cabling for better management and organization with shorter CAT 6 cables. Use existing Fiber uplink cables (Single Mode and Multiple Mode) that connect from building to building. Replace, existing SPF modules with Unifi compatible fiber modules, up to 10GB.
    - Replace existing HP 1GB Fiber aggregation switch with Unifi 10GB Fiber aggregation switch. - Network Cabling – Use the existing cabling that is CAT5e & CAT6 rated for Access Points hardline connections. **May need to replace some cabling, this would be updated on a final proposal and walk through. We say a lot of CAT5 cabling throughout the campus and old patch panels being used in different IDF locations.**
- Network Cabling – New Drops required for new equipment placement for Access Points on the Outside.
Drop for Access Point pointed to the Grass Field mounted on the outside of the GYM Building (East Side). Drop for Access Point pointed to the Courtyard mounted on the outside of the GYM (South Side). Drop for Access Point pointed to the Snake Bar mounted on the outside of the Field House (South Side). Total of 3 new CAT6 Cable Drops to the Outside Locations.
- Program the Unified Management Appliance and Firewall. Configure all VLAN tagging, internet throughput, IP separations, DHCP and DNS Protocols, port spanning, with stacking, security deployments, and traffic management. Follow the same subnet that are currently being used – 10.10.10.x (Phone) and 10.0.10.x (Data), and 10.10.40.x (Paging System) - Remove all existing Ruckus Access Points inside all campus buildings and mount all NextGen Access Points at key indoor locations. Using existing cable network runs, as long as they are CAT5e or better.
- Configure all the Wireless Access Points throughout the campus for expanded coverage and bandwidth for the classrooms and open areas. Internet access will be provisioned for Teachers, Students, and Guests.
- Test all equipment and programing. VLAN’s, Wireless Access Points, Switch Ports and Unified Cloud Management System.`,
    type: "nrc",
    feesPerUser: "10",
    totalUser: "10",
  },
];

export default function RenderPreview() {
  const proposalTypeInfo = {
    id: "buildouts",
    name: "Vulnerability Scanning",
    description: "Managed Service Provider",
    bgImage: "/proposal-cyber-bg.png",
  };
  const clientInfo = {
    organization: "Acme Corporation",
    name: "Jane Doe",
    title: "Director of Operations",
    email: "jane.doe@acmecorp.com",
    phone: "(555) 123-4567",
    streetAddress: "123 Innovation Drive, Orlando, FL 32801",
  };

  return (
    <PDFViewer style={{ width: "100vw", height: "100vh" }}>
      <AgreementPDF
        proposalTypeInfo={proposalTypeInfo}
        clientInfo={clientInfo}
        sections={mockSections}
        fees={mockFees}
      />
    </PDFViewer>
  );
}
