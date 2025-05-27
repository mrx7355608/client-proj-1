import { ShieldAlert, Bug, BadgeCheck, Layers, ArrowLeft } from "lucide-react";
import { useState } from "react";
import ProposalItem from "./ProposalItem";
import ProposalsProvider from "../../contexts/proposals";

type ProposalType = "vulscan" | "pentest" | "compliancy" | "fullsuite";

export default function ShowCyberProposalTypes({
  gotoMainScreen,
}: {
  gotoMainScreen: () => void;
}) {
  const [selectedType, setSelectedType] = useState<ProposalType | null>(null);

  const cyberProposalsTypes = [
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

  const handleTypeSelect = (typeId: ProposalType) => {
    setSelectedType(typeId);
  };

  if (selectedType) {
    return (
      <ProposalsProvider goToSelectionScreen={gotoMainScreen}>
        {selectedType === "vulscan" && (
          <ProposalItem data={cyberProposalsTypes[0]} />
        )}
        {selectedType === "pentest" && (
          <ProposalItem data={cyberProposalsTypes[1]} />
        )}
        {selectedType === "compliancy" && (
          <ProposalItem data={cyberProposalsTypes[2]} />
        )}
        {selectedType === "fullsuite" && (
          <ProposalItem data={cyberProposalsTypes[3]} />
        )}
      </ProposalsProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between pb-8">
            <button onClick={gotoMainScreen}>
              <ArrowLeft />
            </button>
            <div></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cyberProposalsTypes.map((type) => (
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
