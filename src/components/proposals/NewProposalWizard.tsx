import { useState } from "react";
import { X } from "lucide-react";
import ServiceSelection from "./steps/ServiceSelection";
import ProposalDetails from "./steps/ProposalDetails";
import ReviewProposal from "./steps/ReviewProposal";

interface NewProposalWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export type ServiceType =
  | "managed_services"
  | "unm"
  | "cybersecurity"
  | "network_buildout"
  | "other";

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  icon: string;
}

export default function NewProposalWizard({
  isOpen,
  onClose,
  onComplete,
}: NewProposalWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(
    null,
  );
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    validityDays: 30,
    items: [],
  });

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleServiceSelect = (service: ServiceOption) => {
    setSelectedService(service);
    handleNext();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Create New Proposal
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  1
                </div>
                <div
                  className={`h-1 w-12 ${
                    step > 1 ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              </div>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </div>
                <div
                  className={`h-1 w-12 ${
                    step > 2 ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6">
          {step === 1 && <ServiceSelection onSelect={handleServiceSelect} />}
          {step === 2 && selectedService && (
            <ProposalDetails
              service={selectedService}
              formData={formData}
              setFormData={setFormData}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}
          {step === 3 && selectedService && (
            <ReviewProposal
              service={selectedService}
              formData={formData}
              onBack={handleBack}
              onComplete={onComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

