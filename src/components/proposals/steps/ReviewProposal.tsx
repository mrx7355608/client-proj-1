import React from 'react';
import { ServiceOption } from '../NewProposalWizard';

interface ReviewProposalProps {
  service: ServiceOption;
  formData: any;
  onBack: () => void;
  onComplete: () => void;
}

export default function ReviewProposal({
  service,
  formData,
  onBack,
  onComplete
}: ReviewProposalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would save the proposal to the database
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review Proposal</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Service Type</h4>
            <p className="mt-1 text-sm text-gray-900">{service.name}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Title</h4>
            <p className="mt-1 text-sm text-gray-900">{formData.title}</p>
          </div>

          {formData.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Description</h4>
              <p className="mt-1 text-sm text-gray-900">{formData.description}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-700">Validity Period</h4>
            <p className="mt-1 text-sm text-gray-900">{formData.validityDays} days</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Proposal
        </button>
      </div>
    </form>
  );
}