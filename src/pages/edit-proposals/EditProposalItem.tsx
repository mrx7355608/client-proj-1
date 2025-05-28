import { useEffect, useState } from "react";
import EditClientInfoStep from "./steps/EditClientInfoStep";
import EditEquipmentStep from "./steps/EditEquipmentStep";
import EditFeesStep from "./steps/EditFeesStep";
import EditReviewStep from "./steps/EditReviewStep";
import { useProposal } from "../../contexts/proposals";
import { supabase } from "../../lib/supabase";
import { useParams } from "react-router-dom";
import {
  QuoteVariable,
  ClientForm,
  Quote,
  Section,
  QuoteItem,
  Fee,
} from "../../lib/types";
import {
  Network,
  Settings,
  Shield,
  Building2,
  ShieldAlert,
  Bug,
  BadgeCheck,
  Layers,
} from "lucide-react";

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

export default function EditProposalItem() {
  const { id } = useParams<{ id: string }>();
  const [clientForm, setClientForm] = useState<ClientForm>(INITIAL_CLIENT_FORM);
  const [sections, setSections] = useState<Section[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentStep, setCurrentStep, onBack } = useProposal();

  useEffect(() => {
    const fetchProposalData = async () => {
      try {
        const [quote, quoteItems, quoteVariables, quoteFees] =
          await Promise.all([
            fetchQuote(),
            fetchQuoteItems(),
            fetchQuoteVariables(),
            fetchQuoteFees(),
          ]);

        console.log("Quote: ", quote);
        console.log("Quote Items: ", quoteItems);
        console.log("Quote Variables: ", quoteVariables);
        console.log("Quote Fees: ", quoteFees);

        setQuote(quote[0]);

        // Convert quote data into desired format for the edit components
        const clientFormData = convertClientInfoForm(quoteVariables);
        const sections = convertQuoteItemsToSections(quoteItems);

        setClientForm(clientFormData);
        setSections(sections);
        setFees(quoteFees);
      } catch (error) {
        console.error("Error fetching proposal data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposalData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle submit operations
  const handleClientSubmit = (data: ClientForm) => {
    console.log("Client Form: ", data);
    setClientForm(data);
    setCurrentStep(2);
  };

  const handleEquipmentSubmit = (updatedSections: Section[]) => {
    console.log("Updated Sections: ", updatedSections);
    setSections(updatedSections);
    setCurrentStep(3);
  };

  const handleFeesSubmit = (submittedFees: Fee[]) => {
    setFees(submittedFees);
    setCurrentStep(4);
  };

  if (!quote) {
    return <div>No quote found</div>;
  }

  const proposalType = quote.title.split(" ")[0];

  const proposalTypes = [
    {
      id: "unm",
      name: "UNM",
      description: "Unified Network Management",
      icon: <Network className="w-6 h-6" />,
      color: "bg-purple-500",
      bgImage: "/proposal-unm-bg.png",
    },
    {
      id: "msp",
      name: "MSP",
      description: "Managed Service Provider",
      icon: <Settings className="w-6 h-6" />,
      color: "bg-blue-500",
      bgImage: "/proposal-unm-bg.png",
    },
    {
      id: "cybersecurity",
      name: "Cybersecurity",
      description: "Security Solutions",
      icon: <Shield className="w-6 h-6" />,
      color: "bg-green-500",
      bgImage: "/proposal-cyber-bg.png",
    },
    {
      id: "buildouts",
      name: "Buildouts",
      description: "Network & Infrastructure",
      icon: <Building2 className="w-6 h-6" />,
      color: "bg-orange-500",
      bgImage: "/proposal-unm-bg.png",
    },
    {
      id: "vulscan",
      name: "Vulnerability Security",
      description: "Vulnerability Scanning",
      icon: <ShieldAlert className="w-6 h-6" />,
      color: "bg-red-500",
      bgImage: "/proposal-cyber-bg.png",
    },
    {
      id: "pentest",
      name: "PenTest",
      description: "Pen Testing Solutions",
      icon: <Bug className="w-6 h-6" />,
      color: "bg-red-500",
      bgImage: "/proposal-cyber-bg.png",
    },
    {
      id: "compliancy",
      name: "Compliancy",
      description: "Compliancy Service",
      icon: <BadgeCheck className="w-6 h-6" />,
      color: "bg-red-500",
      bgImage: "/proposal-cyber-bg.png",
    },
    {
      id: "fullsuite",
      name: "Fullsuite Cubersecurity",
      description: "Complete Cybersecurity Services",
      icon: <Layers className="w-6 h-6" />,
      color: "bg-red-500",
      bgImage: "/proposal-cyber-bg.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Step Content */}
        {currentStep === 1 && (
          <EditClientInfoStep
            quoteDetails={quote}
            initialData={clientForm}
            onSubmit={handleClientSubmit}
          />
        )}
        {currentStep === 2 && (
          <EditEquipmentStep
            sections={sections}
            onBack={onBack}
            onSubmit={handleEquipmentSubmit}
            proposalType={proposalType.toLocaleLowerCase()}
          />
        )}
        {currentStep === 3 && (
          <EditFeesStep
            proposalType={proposalType.toLocaleLowerCase()}
            fees={fees}
            onBack={onBack}
            onSubmit={handleFeesSubmit}
            perUserFee={quote.amount_per_user}
            totalUsersCount={quote.total_users}
          />
        )}
        {currentStep === 4 && (
          <EditReviewStep
            clientInfo={clientForm}
            sections={sections}
            fees={fees}
            quoteDetails={quote}
            quoteTitle={`${proposalType} Proposal - ${clientForm.organization}`}
            taxRate={7}
            onBack={onBack}
            proposalTypeInfo={
              proposalTypes.filter(
                (t) => t.id === proposalType.toLowerCase()
              )[0] as any
            }
          />
        )}
      </div>
    </div>
  );

  async function fetchQuote() {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", id);

    if (error) throw error;

    return data;
  }

  async function fetchQuoteItems() {
    const { data, error } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", id);

    if (error) throw error;

    return data;
  }

  async function fetchQuoteVariables() {
    const { data, error } = await supabase
      .from("quote_variables")
      .select("*")
      .eq("quote_id", id);

    if (error) throw error;

    return data;
  }

  async function fetchQuoteFees() {
    const { data, error } = await supabase
      .from("quote_fees")
      .select("*")
      .eq("quote_id", id);

    if (error) throw error;

    return data;
  }

  function convertClientInfoForm(quoteVariables: QuoteVariable[]) {
    const varObject = quoteVariables.reduce((acc, item) => {
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
    return formData;
  }

  function convertQuoteItemsToSections(quoteItems: QuoteItem[]) {
    const formattedSections: Section[] = [];
    quoteItems.forEach((item) => {
      const sectionName = item.section_name;
      let section = formattedSections.find((g) => g.name === sectionName);

      if (!section) {
        section = {
          id: String(formattedSections.length + 1),
          name: sectionName,
          equipment: [],
        };
        formattedSections.push(section);
      }
      section.equipment.push(item as any);
    });

    return formattedSections;
  }
}
