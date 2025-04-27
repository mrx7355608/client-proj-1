import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import CoverPage from "./CoverPage";
import EquipmentPage from "./EquipmentPage";
import ServicesPage from "./ServicesPage";
import ServiceFeesPage from "./ServiceFeesPage";
import TermsAndConditionsPage from "./TermsAndCondition";
import SignaturePage from "./SignaturePage";

// Main Document Component
const MyProposalPdf = ({ proposalTypeInfo, clientInfo }) => {
  return (
    <Document>
      <CoverPage proposalTypeInfo={proposalTypeInfo} clientInfo={clientInfo} />
      <ServicesPage />
      <EquipmentPage />
      <ServiceFeesPage />
      <TermsAndConditionsPage />
      <SignaturePage proposalId="123" />
    </Document>
  );
};

export default MyProposalPdf;
