import { useState, useEffect } from "react";
import ClientInfoStep from "../steps/ClientInfoStep";
import EquipmentStep from "../steps/EquipmentStep";
import FeesStep from "../steps/FeesStep";
import ReviewStep from "../steps/ReviewStep";
import { supabase } from "../../../lib/supabase";
import { useProposal } from "../../../contexts/proposals";

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
export default function MSPProposal({
  data,
}: {
  data: {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
  };
}) {
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

  useEffect(() => {
    loadExistingProposal();
  }, []);

  const loadExistingProposal = async () => {
    try {
      // Check for saved proposal data
      const savedData = localStorage.getItem("editProposal");
      if (!savedData) {
        setIsLoading(false);
        return;
      }

      const editData = JSON.parse(savedData);
      setProposalId(editData.id);

      // Load client info
      setClientForm({
        name: editData.clientInfo.name || "",
        title: editData.clientInfo.title || "",
        email: editData.clientInfo.email || "",
        phone: editData.clientInfo.phone || "",
        organization: editData.clientInfo.organization || "",
        streetAddress: editData.clientInfo.address?.split(",")[0]?.trim() || "",
        city: editData.clientInfo.address?.split(",")[1]?.trim() || "",
        state: editData.clientInfo.address?.split(",")[2]?.trim() || "",
        zipCode: editData.clientInfo.address?.split(",")[3]?.trim() || "",
      });

      // Load quote items and sections
      const { data: quoteItems } = await supabase
        .from("quote_items")
        .select(
          `
          id,
          description,
          quantity,
          unit_price,
          is_recurring,
          inventory_item:inventory_items (
            id,
            name,
            category,
            image_url
          )
        `,
        )
        .eq("quote_id", editData.id);

      if (quoteItems) {
        const equipmentSection = {
          id: "1",
          name: "Network Equipment",
          equipment: quoteItems.map((item: any) => ({
            id: item.inventory_item.id,
            name: item.inventory_item.name,
            quantity: item.quantity,
            category: item.inventory_item.category,
            image_url: item.inventory_item.image_url,
          })),
        };
        setSections([equipmentSection]);
      }

      // Set fees
      setFees({
        nrc: [], // You'll need to load these from your database
        mrc: editData.total_mrr?.toString() || "",
      });

      // Clear the stored data
      localStorage.removeItem("editProposal");
    } catch (error) {
      console.error("Error loading proposal:", error);
      alert("Error loading proposal data");
    } finally {
      setIsLoading(false);
    }
  };

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
    // Here you would typically save the proposal to your database
    console.log("Proposal completed with signature:", signature);
    // Close the proposal window
    window.close();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Step Content */}
        {currentStep === 1 && (
          <ClientInfoStep
            proposalType="MSP"
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
            proposalTypeInfo={data}
          />
        )}
      </div>
    </div>
  );
}
