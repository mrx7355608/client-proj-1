import { useEffect, useState } from "react";
import { ClientForm, Fee, Quote, Section } from "../lib/types";
import ClientInfoStep from "./proposals/steps/ClientInfoStep";
import EquipmentStep from "./proposals/steps/EquipmentStep";
import FeesStep from "./proposals/steps/FeesStep";
import ReviewStep from "./proposals/steps/ReviewStep";
import { useProposal } from "../contexts/proposals";

type Props = {
  quote: Quote;
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

export default function EditProposalItem({ proposalTypeInfo, quote }: Props) {
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
  const [proposalName, setProposalName] = useState("");

  // Set a loading state so that useEffect can format data
  // and pass the formatted data in the child components
  const [loading, setLoading] = useState(true);

  const { currentStep, setProposal, setCurrentStep, onBack } = useProposal();

  useEffect(() => {
    // Set proposal in ProposalsProvider context so that
    // on saving it will be updated instead of creating new one
    setProposal(quote);

    // Update client form based on the quote
    const varObject = quote.variables.reduce((acc, item) => {
      acc[item.name] = item.value;
      return acc;
    }, {} as Record<string, string>);
    const [address, city, stateZip] = varObject.address.split(", ");
    const formData = {
      name: varObject.client_name,
      email: varObject.client_email,
      phone: varObject.client_phone,
      title: varObject.client_title,
      organization: varObject.organization,
      streetAddress: address,
      city: city,
      state: stateZip.split(" ")[0],
      zipCode: stateZip.split(" ")[1],
    };
    setClientForm(formData);

    // Set proposal name
    setProposalName(quote.title.split(" ")[0]);

    // Update equipments to match the required format in UI
    const formattedSections = [];
    quote.items.forEach((item) => {
      const sectionName = item.section_name;
      let section = formattedSections.find((g) => g.name === sectionName);

      if (!section) {
        section = {
          id: formattedSections.length + 1,
          name: sectionName,
          equipment: [],
        };
        formattedSections.push(section);
      }
      section.equipment.push(item);
    });
    setSections(formattedSections);

    // Update fees data
    const nrcFees = quote.fees.filter((f) => f.type === "nrc");
    const mrcFees = quote.total_mrr;
    setFees({ nrc: nrcFees, mrc: Number(mrcFees) });
    setLoading(false);
  }, []);

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

  if (loading) {
    return;
  }

  return (
    <div className="w-full p-4">
      {currentStep === 1 && (
        <ClientInfoStep
          proposalName={proposalName}
          initialData={clientForm}
          onSubmit={handleClientSubmit}
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
          proposalTypeInfo={proposalTypeInfo}
          fees={{
            nrc: fees.nrc.map((fee) => ({
              ...fee,
              amount: parseFloat(fee.amount),
            })),
            mrc: parseFloat(fees.mrc) || 0,
          }}
          onBack={onBack}
        />
      )}
    </div>
  );
}
