import { PDFViewer } from "@react-pdf/renderer";
import AgreementPDF from "../components/preview-pdf/AgreementPDF";

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
      },
      {
        id: "2",
        name: "Switch Y200",
        category: "Switch",
        quantity: 5,
        image_url: "https://via.placeholder.com/64", // mock image
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
      },
    ],
  },
];

export default function RenderPreview() {
  const proposalTypeInfo = {
    id: "msp",
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
      />
    </PDFViewer>
  );
}
