import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BuildoutProposalProps {
  onBack: () => void;
}

export default function BuildoutProposal({ onBack }: BuildoutProposalProps) {
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
          <h2 className="text-2xl font-semibold text-gray-900">Network Buildout Proposal</h2>
          <p className="mt-2 text-gray-600">Network buildout proposal flow coming soon...</p>
        </div>
      </div>
    </div>
  );
}