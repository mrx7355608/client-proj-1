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
import BuildoutsFeesPage from "./buildouts/BuildoutsFeesPage";

// Main Document Component
const MyProposalPdf = ({
  pdfFilename,
  proposalId,
  proposalTypeInfo,
  clientInfo,
  sections,
  fees,
  tax,
}: any) => {
  const calculateTotalEquipments = () => {
    const totalEquipments = sections.map((s: any) => s.equipment).flat();
    return totalEquipments.reduce(
      (acc: number, curr: any) => acc + curr.quantity,
      0
    );
  };

  const calculateTotalEquipmentsFee = () => {
    const totalEquipments = sections.map((s: any) => s.equipment).flat();
    return totalEquipments.reduce(
      (acc: number, curr: any) => acc + (curr.unit_price || 0) * curr.quantity,
      0
    );
  };

  return (
    <Document style={{ fontFamily: "Helvetica" }}>
      <CoverPage proposalTypeInfo={proposalTypeInfo} clientInfo={clientInfo} />
      {proposalTypeInfo.id === "unm" && <UNMServicesPage />}
      {proposalTypeInfo.id === "msp" && <MSPServicesPage />}
      {proposalTypeInfo.id === "vulscan" && <VulscanServicePage />}
      {proposalTypeInfo.id === "pentest" && <VulscanServicePage />}
      {proposalTypeInfo.id === "fullsuite" && <VulscanServicePage />}
      {proposalTypeInfo.id === "compliancy" && <VulscanServicePage />}

      <EquipmentPage sections={sections} proposalType={proposalTypeInfo.id} />

      {proposalTypeInfo.id === "buildouts" ? (
        <BuildoutsFeesPage
          fees={fees}
          totalEquipment={calculateTotalEquipments()}
          tax={tax}
          totalEquipmentFees={calculateTotalEquipmentsFee()}
        />
      ) : (
        <ServiceFeesPage fees={fees} proposalType={proposalTypeInfo.id} />
      )}

      {proposalTypeInfo.id === "unm" && <UNMTermsPage />}
      {proposalTypeInfo.id === "msp" && <MSPTermsPage />}
      {proposalTypeInfo.id === "vulscan" && <VulscanTermsPage />}
      {proposalTypeInfo.id === "pentest" && <VulscanTermsPage />}
      {proposalTypeInfo.id === "fullsuite" && <VulscanTermsPage />}
      {proposalTypeInfo.id === "compliancy" && <VulscanTermsPage />}
      <SignaturePage
        proposalType={proposalTypeInfo.id}
        proposalId={proposalId}
        filename={pdfFilename}
      />
    </Document>
  );
};

export default MyProposalPdf;
