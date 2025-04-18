import { Network, Settings, Shield, Building2 } from "lucide-react";
import { useState } from "react";

type ProposalType = "unm" | "msp" | "cybersecurity" | "buildouts";

export default function ShowCyberProposalTypes() {
  const [selectedType, setSelectedType] = useState<ProposalType | null>(null);

  const proposalTypes = [
    {
      id: "vulscan",
      name: "Vulnerability Security",
      description: "Unified Network Management",
      icon: <Network className="w-6 h-6" />,
      color: "bg-purple-500",
    },
    {
      id: "pentest",
      name: "PenTest",
      description: "Managed Service Provider",
      icon: <Settings className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      id: "compliancy",
      name: "Compliancy",
      description: "Security Solutions",
      icon: <Shield className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      id: "buildouts",
      name: "Fullsuite Cubersecurity",
      description: "Network & Infrastructure",
      icon: <Building2 className="w-6 h-6" />,
      color: "bg-orange-500",
    },
  ];

  const handleTypeSelect = (typeId: ProposalType) => {
    setSelectedType(typeId);
  };
  return (
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
          <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
          <p className="mt-2 text-sm text-gray-500 text-center">
            {type.description}
          </p>
        </button>
      ))}
    </div>
  );
}
