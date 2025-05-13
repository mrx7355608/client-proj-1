import { useState } from "react";
import {
  Plus,
  Save,
  Network,
  Settings,
  Shield,
  Building2,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Search,
} from "lucide-react";
import { createTermsOfService } from "../../lib/data/terms.data";

interface Term {
  id: string;
  title: string;
  description: string;
}

interface ProposalType {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
}

interface CyberSecurityType {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
}

export default function TermsOfService() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCyberType, setSelectedCyberType] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([
    { id: "1", title: "", description: "" },
    { id: "2", title: "", description: "" },
    { id: "3", title: "", description: "" },
    { id: "4", title: "", description: "" },
    { id: "5", title: "", description: "" },
  ]);

  const proposalTypes: ProposalType[] = [
    {
      id: "unm",
      name: "UNM",
      description: "Unified Network Management",
      icon: <Network className="w-6 h-6" />,
      color: "bg-purple-500",
    },
    {
      id: "msp",
      name: "MSP",
      description: "Managed Service Provider",
      icon: <Settings className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      id: "cybersecurity",
      name: "Cybersecurity",
      description: "Security Solutions",
      icon: <Shield className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      id: "buildouts",
      name: "Buildouts",
      description: "Network & Infrastructure",
      icon: <Building2 className="w-6 h-6" />,
      color: "bg-orange-500",
    },
  ];

  const cyberSecurityTypes: CyberSecurityType[] = [
    {
      id: "vulnerability",
      name: "Vulnerability",
      description: "Vulnerability Assessment & Management",
      icon: <ShieldAlert className="w-6 h-6" />,
    },
    {
      id: "fullsuite",
      name: "Full Suite",
      description: "Complete Cybersecurity Solution",
      icon: <ShieldCheck className="w-6 h-6" />,
    },
    {
      id: "compliancy",
      name: "Compliancy",
      description: "Regulatory Compliance & Auditing",
      icon: <FileCheck className="w-6 h-6" />,
    },
    {
      id: "pentest",
      name: "Pentest",
      description: "Penetration Testing Services",
      icon: <Search className="w-6 h-6" />,
    },
  ];

  const resetTermsAndGoBack = () => {
    if (selectedType === "cybersecurity" && selectedCyberType) {
      setSelectedCyberType(null);
    } else {
      setSelectedType(null);
      setSelectedCyberType(null);
    }
    setTerms([
      { id: "1", title: "", description: "" },
      { id: "2", title: "", description: "" },
      { id: "3", title: "", description: "" },
      { id: "4", title: "", description: "" },
      { id: "5", title: "", description: "" },
    ]);
  };

  const handleAddTerm = () => {
    setTerms([
      ...terms,
      { id: (terms.length + 1).toString(), title: "", description: "" },
    ]);
  };

  const handleTermChange = (
    id: string,
    field: "title" | "description",
    value: string
  ) => {
    setTerms(
      terms.map((term) => (term.id === id ? { ...term, [field]: value } : term))
    );
  };

  const handleSave = async () => {
    const termsData = terms
      .map((t) => ({
        title: t.title,
        description: t.description,
        proposal_type: selectedCyberType || selectedType as string, // this order is important DO NOT CHANGE!!!
      }))
      .filter((t) => t.title && t.description);
    console.log(termsData);
    const data = await createTermsOfService(termsData);
    console.log(data);
  };

  // Show cybersecurity types selection
  if (selectedType === "cybersecurity" && !selectedCyberType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={resetTermsAndGoBack}
                className="text-gray-500 hover:text-gray-700"
              >
                ←
              </button>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Select Cybersecurity Type
                </h2>
                <p className="mt-2 text-gray-600">
                  Choose the specific type of cybersecurity service
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cyberSecurityTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedCyberType(type.id)}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  {type.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">{type.name}</h3>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show initial proposal type selection
  if (!selectedType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Select Proposal Type
            </h2>
            <p className="mt-2 text-gray-600">
              Choose the type of proposal to manage terms for
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposalTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className={`p-3 rounded-lg ${type.color} text-white`}>
                  {type.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">{type.name}</h3>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedProposalType = proposalTypes.find(
    (t) => t.id === selectedType
  )!;

  const selectedCyberSecurityType = selectedCyberType
    ? cyberSecurityTypes.find((t) => t.id === selectedCyberType)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={resetTermsAndGoBack}
            className="text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          <div
            className={`p-2 rounded-lg ${selectedProposalType.color} text-white`}
          >
            {selectedProposalType.icon}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {selectedProposalType.name}
              {selectedCyberSecurityType && ` - ${selectedCyberSecurityType.name}`}{" "}
              Terms
            </h2>
            <p className="text-gray-600">
              {selectedCyberSecurityType
                ? selectedCyberSecurityType.description
                : selectedProposalType.description}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {terms.map((term, index) => (
            <div
              key={term.id}
              className="p-4 border border-gray-200 rounded-lg space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">
                  Term {index + 1}
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={term.title}
                    onChange={(e) =>
                      handleTermChange(term.id, "title", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter term title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={term.description}
                    onChange={(e) =>
                      handleTermChange(term.id, "description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Enter term description"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddTerm}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Another Term
          </button>

          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
