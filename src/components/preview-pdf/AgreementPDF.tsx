import { Font, Document } from "@react-pdf/renderer";
import CoverPage from "./CoverPage";
import EquipmentPage from "./EquipmentPage";
import ServicesPage from "./ServicesPage";
import ServiceFeesPage from "./ServiceFeesPage";
import TermsAndConditionsPage from "./TermsAndCondition";
import SignaturePage from "./SignaturePage";

// Main Document Component
const MyProposalPdf = ({
  pdfFilename,
  proposalId,
  proposalTypeInfo,
  clientInfo,
  sections,
  fees,
}) => {
  return (
    <Document style={{ fontFamily: "Helvetica" }}>
      <CoverPage proposalTypeInfo={proposalTypeInfo} clientInfo={clientInfo} />
      <ServicesPage />
      <EquipmentPage sections={sections} />
      <ServiceFeesPage fees={fees} />
      <TermsAndConditionsPage />
      <SignaturePage proposalId={proposalId} filename={pdfFilename} />
    </Document>
  );
};

export default MyProposalPdf;
