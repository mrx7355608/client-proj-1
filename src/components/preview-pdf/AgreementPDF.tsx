import { Document } from "@react-pdf/renderer";
import CoverPage from "./CoverPage";
import EquipmentPage from "./EquipmentPage";
import SignaturePage from "./SignaturePage";
import UNMServicesPage from "./unm/UNMServicesPage";
import MSPServicesPage from "./msp/MSPServicePage";
import UNMTermsPage from "./unm/UNMTermsPage";
import MSPTermsPage from "./msp/MSPTermsPage";
import ServiceFeesPage from "./ServiceFeesPage";
import VulscanTermsPage from "./vulscan/VulscanTermsPage";
import VulscanServicePage from "./vulscan/VulscanServicePage";

// Main Document Component
const MyProposalPdf = ({
  pdfFilename,
  proposalId,
  proposalTypeInfo,
  clientInfo,
  sections,
  fees,
}: any) => {
  return (
    <Document style={{ fontFamily: "Helvetica" }}>
      <CoverPage proposalTypeInfo={proposalTypeInfo} clientInfo={clientInfo} />
      {proposalTypeInfo.id === "unm" && <UNMServicesPage />}
      {proposalTypeInfo.id === "msp" && <MSPServicesPage />}
      {proposalTypeInfo.id === "vulscan" && <VulscanServicePage />}
      {proposalTypeInfo.id === "pentest" && <UNMServicesPage />}
      {proposalTypeInfo.id === "fullsuite" && <UNMServicesPage />}
      {proposalTypeInfo.id === "compliancy" && <UNMServicesPage />}

      <EquipmentPage sections={sections} proposalType={proposalTypeInfo.id} />

      <ServiceFeesPage fees={fees} proposalType={proposalTypeInfo.id} />

      {proposalTypeInfo.id === "unm" && <UNMTermsPage />}
      {proposalTypeInfo.id === "msp" && <MSPTermsPage />}
      {proposalTypeInfo.id === "vulscan" && <VulscanTermsPage />}
      {proposalTypeInfo.id === "pentest" && <UNMTermsPage />}
      {proposalTypeInfo.id === "fullsuite" && <UNMTermsPage />}
      {proposalTypeInfo.id === "compliancy" && <UNMTermsPage />}
      <SignaturePage proposalId={proposalId} filename={pdfFilename} />
    </Document>
  );
};

export default MyProposalPdf;
