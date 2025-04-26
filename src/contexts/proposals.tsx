import { ArrowLeft } from "lucide-react";
import { useState, createContext, ReactNode, useContext } from "react";

const initialState = {
  currentStep: 1,
  setCurrentStep: (step: number) => {},
  onBack: () => {},
};

const ProposalContext = createContext(initialState);
export const useProposal = () => useContext(ProposalContext);

type Props = {
  children: ReactNode;
  goToSelectionScreen: () => void;
};

// Context Provider
export default function ProposalsProvider({
  children,
  goToSelectionScreen,
}: Props) {
  const [currentStep, setCurrentStep] = useState(1);

  const onBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      goToSelectionScreen();
    }
  };

  return (
    <ProposalContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        onBack,
      }}
    >
      <div className="no-print mx-auto py-8 px-4 bg-gray-50 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="no-print flex max-w-3xl mx-auto items-center justify-between">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-4">
            <StepUI
              currentStep={currentStep}
              myStep={1}
              label={"Client Info"}
            />
            <div className="w-16 h-0.5 bg-gray-200" /> {/* Divider */}
            <StepUI currentStep={currentStep} myStep={2} label={"Equipment"} />
            <div className="w-16 h-0.5 bg-gray-200" />
            <StepUI currentStep={currentStep} myStep={3} label={"Fee"} />
            <div className="w-16 h-0.5 bg-gray-200" />
            <StepUI currentStep={currentStep} myStep={4} label={"Review"} />
          </div>
          <div className="w-5" /> {/* Spacer */}
        </div>
      </div>

      {children}
    </ProposalContext.Provider>
  );
}

function StepUI({ currentStep, myStep, label }) {
  return (
    <div className="flex items-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === myStep
            ? "bg-blue-500 text-white"
            : currentStep > myStep
              ? "bg-blue-100 text-blue-500"
              : "bg-gray-200 text-gray-400"
        }`}
      >
        {myStep}
      </div>
      <div className="ml-2 text-sm font-medium text-gray-600">{label}</div>
    </div>
  );
}
