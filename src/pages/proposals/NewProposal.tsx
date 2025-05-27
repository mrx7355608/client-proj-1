import { useState } from "react";
import { Network, Settings, Shield, Building2 } from "lucide-react";
import ProposalsProvider from "../../contexts/proposals";
import ProposalItem from "../../components/proposals/ProposalItem";
import ShowCyberProposalTypes from "../../components/proposals/ShowCyberProposalTypes";

type ProposalType = "unm" | "msp" | "cybersecurity" | "buildouts";

export default function NewProposal() {
  const [selectedType, setSelectedType] = useState<ProposalType | null>(null);

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
  ];

  const handleTypeSelect = (typeId: ProposalType) => {
    setSelectedType(typeId);
  };

  const gotoMainSelectionScreen = () => setSelectedType(null);

  if (selectedType === "cybersecurity") {
    return <ShowCyberProposalTypes gotoMainScreen={gotoMainSelectionScreen} />;
  }

  // Render type-specific proposal flow
  if (selectedType) {
    return (
      <ProposalsProvider goToSelectionScreen={() => setSelectedType(null)}>
        {selectedType === "unm" && <ProposalItem data={proposalTypes[0]} />}
        {selectedType === "msp" && <ProposalItem data={proposalTypes[1]} />}
        {selectedType === "buildouts" && (
          <ProposalItem data={proposalTypes[3]} />
        )}
      </ProposalsProvider>
    );
  }

  // Render proposal type selection
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Select Proposal Type
            </h2>
            <p className="mt-2 text-gray-600">
              Choose the type of proposal you want to create
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {proposalTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id as ProposalType)}
                className="flex flex-col items-center p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div
                  className={`w-14 h-14 ${type.color} text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  {type.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {type.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  {type.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
