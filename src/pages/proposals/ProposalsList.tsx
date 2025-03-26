import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Filter, ArrowLeft, Eye, Pencil, Trash2, Network, Shield, Server, Settings, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Proposal {
  id: string;
  title: string;
  quote_number: string;
  status: string;
  created_at: string;
  template_id: string;
  template: {
    id: string;
    type: 'managed_services' | 'unm' | 'cybersecurity' | 'network_buildout' | 'other';
  } | null;
  client: {
    name: string;
    company_name: string | null;
  } | null;
  total_mrr: number;
  total_nrc: number;
  variables: {
    name: string;
    value: string;
  }[];
}

export default function ProposalsList() {
  // ... rest of the component code remains the same ...

  const getClientInfo = (proposal: Proposal) => {
    // First check for client information from the clients table
    if (proposal.client) {
      return proposal.client.company_name || proposal.client.name;
    }

    // If no client record, check quote variables
    const clientVar = proposal.variables?.find(v => 
      v.name === 'client' || 
      v.name === 'organization' || 
      v.name === 'company_name'
    );
    if (clientVar) {
      return clientVar.value;
    }

    return 'N/A';
  };

  // ... rest of the component code remains the same ...

  return (
    <div>
      {/* ... other JSX remains the same ... */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client Information
            </th>
            {/* ... other table headers ... */}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredProposals.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                {searchQuery ? 'No proposals found matching your search' : 'No proposals yet'}
              </td>
            </tr>
          ) : (
            filteredProposals.map((proposal) => (
              <tr key={proposal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{proposal.title}</div>
                  <div className="text-sm text-gray-500">{proposal.quote_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{getClientInfo(proposal)}</div>
                </td>
                {/* ... other table cells ... */}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* ... other JSX remains the same ... */}
    </div>
  );
}