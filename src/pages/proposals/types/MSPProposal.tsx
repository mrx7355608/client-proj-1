import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface MSPProposalProps {
  onBack: () => void;
}

export default function MSPProposal({ onBack }: MSPProposalProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900">MSP Proposal</h2>
          <p className="mt-2 text-gray-600">MSP proposal flow coming soon...</p>
        </div>
      </div>
    </div>
  );
}