import { useState } from "react";
import ClientInfoStep from "../steps/ClientInfoStep";
import EquipmentStep from "../steps/EquipmentStep";
import FeesStep from "../steps/FeesStep";
import ReviewStep from "../steps/ReviewStep";
import { useProposal } from "../../../contexts/proposals";

type Props = {
  data: {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
  };
};

interface Section {
  id: string;
  name: string;
  equipment: {
    id: string;
    name: string;
    quantity: number;
    category: string;
    image_url: string | null;
  }[];
}

interface Fee {
  id: string;
  description: string;
  amount: string;
  notes: string;
  type: "nrc" | "mrc";
}

interface ClientForm {
  name: string;
  title: string;
  email: string;
  phone: string;
  organization: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

const INITIAL_CLIENT_FORM: ClientForm = {
  name: "",
  title: "",
  email: "",
  phone: "",
  organization: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
};
export default function ProposalItem({ data }: Props) {
  const [clientForm, setClientForm] = useState<ClientForm>(INITIAL_CLIENT_FORM);
  const [sections, setSections] = useState<Section[]>([
    { id: "1", name: "Network Equipment", equipment: [] },
  ]);
  const [fees, setFees] = useState<{
    nrc: Fee[];
    mrc: string;
  }>({
    nrc: [],
    mrc: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const { currentStep, setCurrentStep, onBack } = useProposal();

  // Handle submit operations
  const handleClientSubmit = (data: ClientForm) => {
    setClientForm(data);
    setCurrentStep(2);
  };

  const handleEquipmentSubmit = (updatedSections: Section[]) => {
    setSections(updatedSections);
    setCurrentStep(3);
  };

  const handleFeesSubmit = (submittedFees: Fee[]) => {
    const nrcFees = submittedFees.filter((fee) => fee.type === "nrc");
    const mrcFee = submittedFees.find((fee) => fee.type === "mrc");

    setFees({
      nrc: nrcFees,
      mrc: mrcFee?.amount || "",
    });
    setCurrentStep(4);
  };

  const handleReviewSubmit = (signature: string) => {
    // TODO: do something here please xd
    console.log("Proposal completed with signature:", signature);
    window.close();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Step Content */}
        {currentStep === 1 && (
          <ClientInfoStep
            proposalType={data.name}
            initialData={clientForm}
            onSubmit={handleClientSubmit}
            proposalId={proposalId}
          />
        )}
        {currentStep === 2 && (
          <EquipmentStep
            sections={sections}
            onBack={onBack}
            onSubmit={handleEquipmentSubmit}
          />
        )}
        {currentStep === 3 && (
          <FeesStep
            initialNRC={fees.nrc}
            initialMRC={fees.mrc}
            onBack={onBack}
            onSubmit={handleFeesSubmit}
          />
        )}
        {currentStep === 4 && (
          <ReviewStep
            clientInfo={clientForm}
            sections={sections}
            proposalTypeInfo={data}
            fees={{
              nrc: fees.nrc.map((fee) => ({
                ...fee,
                amount: parseFloat(fee.amount),
              })),
              mrc: parseFloat(fees.mrc) || 0,
            }}
            onBack={onBack}
            onSubmit={handleReviewSubmit}
            proposalId={proposalId}
          />
        )}
      </div>
    </div>
  );
}
