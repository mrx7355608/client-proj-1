import { ArrowLeft } from "lucide-react";
import { useState, createContext, FC, ReactNode, useContext } from "react";

const initialState = {
  currentStep: 1,
  setCurrentStep: (step: number) => {},
  onBack: () => {},
  handleEquipmentBack: () => {},
  handleFeesBack: () => {},
  handleReviewBack: () => {},
};

// Context
const ProposalContext = createContext(initialState);

// Proposals Hook
export const useProposal = () => useContext(ProposalContext);

// Context Provider
const ProposalsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const onBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleEquipmentBack = () => setCurrentStep(1);
  const handleFeesBack = () => setCurrentStep(2);
  const handleReviewBack = () => setCurrentStep(3);

  return (
    <ProposalContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        onBack,
        handleReviewBack,
        handleFeesBack,
        handleEquipmentBack,
      }}
    >
      <div className="max-w-4xl mx-auto pt-8 px-4 bg-gray-50 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="flex items-center justify-between">
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
};

export default ProposalsProvider;
