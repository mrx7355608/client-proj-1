import { PDFViewer } from "@react-pdf/renderer";
import AgreementPDF from "../components/preview-pdf/AgreementPDF";
import { Fee } from "../lib/types";

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
    ],
  },
];

// description: string;
//   amount: string;
//   notes: string;
//   type: "nrc" | "mrc";
//   totalUser?: string;
//   feesPerUser?: string;

const mockFees: Fee[] = [
  {
    id: "1",
    amount: "100",
    description: "Setup Fee",
    notes: "This is a setup fee",
    type: "nrc",
    feesPerUser: "10",
    totalUser: "10",
  },
  {
    id: "2",
    amount: "100",
    description: "Monthly Fee",
    notes: "This is a monthly fee",
    type: "mrc",
    feesPerUser: "10",
    totalUser: "10",
  },
];

export default function RenderPreview() {
  const proposalTypeInfo = {
    id: "unm",
    name: "Managed IT Services",
    description: "Managed Service Provider",
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
