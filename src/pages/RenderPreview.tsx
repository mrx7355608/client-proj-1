import { PDFViewer } from "@react-pdf/renderer";
import AgreementPDF from "../components/preview-pdf/AgreementPDF";

export default function RenderPreview() {
  const proposalTypeInfo = {
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
      />
    </PDFViewer>
  );
}
