import { useState } from "react";
import ClientInfoStep from "../steps/ClientInfoStep";
import EquipmentStep from "../steps/EquipmentStep";
import FeesStep from "../steps/FeesStep";
import ReviewStep from "../steps/ReviewStep";
import { useProposal } from "../../../contexts/proposals";
import { Fee, ClientForm, Section } from "../../../lib/types";

type Props = {
  data: {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    bgImage: string;
  };
};

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
  const [fees, setFees] = useState<Fee[]>([]);
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
    setFees(submittedFees);
    setCurrentStep(4);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Step Content */}
        {currentStep === 1 && (
          <ClientInfoStep
            proposalName={data.name}
            initialData={clientForm}
            onSubmit={handleClientSubmit}
          />
        )}
        {currentStep === 2 && (
          <EquipmentStep
            sections={sections}
            onBack={onBack}
            onSubmit={handleEquipmentSubmit}
            proposalType={data.name.toLocaleLowerCase()}
          />
        )}
        {currentStep === 3 && (
          <FeesStep
            proposalType={data.name.toLocaleLowerCase()}
            fees={fees}
            onBack={onBack}
            onSubmit={handleFeesSubmit}
          />
        )}
        {currentStep === 4 && (
          <ReviewStep
            clientInfo={clientForm}
            sections={sections}
            proposalTypeInfo={data}
            fees={fees}
            onBack={onBack}
          />
        )}
      </div>
    </div>
  );
}
