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
}) => {
  Font.register({
    family: "Oswald",
    src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
  });
  return (
    <Document style={{ fontFamily: "Oswald" }}>
      <CoverPage proposalTypeInfo={proposalTypeInfo} clientInfo={clientInfo} />
      <ServicesPage />
      <EquipmentPage />
      <ServiceFeesPage />
      <TermsAndConditionsPage />
      <SignaturePage proposalId={proposalId} filename={pdfFilename} />
    </Document>
  );
};

export default MyProposalPdf;
