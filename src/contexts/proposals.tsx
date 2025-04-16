import { ArrowLeft } from "lucide-react";
import { useState, createContext, ReactNode, useContext } from "react";

const initialState = {
  currentStep: 1,
  setCurrentStep: (step: number) => {},
  onBack: () => {},
};

// Context
const ProposalContext = createContext(initialState);

// Proposals Hook
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
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 1
                    ? "bg-blue-500 text-white"
                    : "bg-blue-100 text-blue-500"
                }`}
              >
                1
              </div>
              <div className="ml-2 text-sm font-medium text-gray-600">
                Client Info
              </div>
            </div>
            <div className="w-16 h-0.5 bg-gray-200" />
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 2
                    ? "bg-blue-500 text-white"
                    : currentStep > 2
                      ? "bg-blue-100 text-blue-500"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                2
              </div>
              <div className="ml-2 text-sm font-medium text-gray-600">
                Equipment
              </div>
            </div>
            <div className="w-16 h-0.5 bg-gray-200" />
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 3
                    ? "bg-blue-500 text-white"
                    : currentStep > 3
                      ? "bg-blue-100 text-blue-500"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                3
              </div>
              <div className="ml-2 text-sm font-medium text-gray-600">Fees</div>
            </div>
            <div className="w-16 h-0.5 bg-gray-200" />
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 4
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                4
              </div>
              <div className="ml-2 text-sm font-medium text-gray-600">
                Review
              </div>
            </div>
          </div>
          <div className="w-5" /> {/* Spacer */}
        </div>
      </div>

      {children}
    </ProposalContext.Provider>
  );
}
