import React from 'react';
import { Network, Shield, Server, Settings, FileText } from 'lucide-react';
import { ServiceOption, ServiceType } from '../NewProposalWizard';

interface ServiceSelectionProps {
  onSelect: (service: ServiceOption) => void;
}

const SERVICES: ServiceOption[] = [
  {
    id: '1',
    name: 'Managed Services',
    description: 'Comprehensive IT management and support services',
    type: 'managed_services',
    icon: 'settings'
  },
  {
    id: '2',
    name: 'Network Infrastructure',
    description: 'Network design, implementation, and optimization',
    type: 'network_buildout',
    icon: 'network'
  },
  {
    id: '3',
    name: 'Cybersecurity',
    description: 'Security assessments, implementation, and monitoring',
    type: 'cybersecurity',
    icon: 'shield'
  },
  {
    id: '4',
    name: 'UNM Services',
    description: 'Unified network management services',
    type: 'unm',
    icon: 'server'
  },
  {
    id: '5',
    name: 'Custom Solution',
    description: 'Tailored solutions for specific needs',
    type: 'other',
    icon: 'file'
  }
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'settings':
      return <Settings className="w-6 h-6" />;
    case 'network':
      return <Network className="w-6 h-6" />;
    case 'shield':
      return <Shield className="w-6 h-6" />;
    case 'server':
      return <Server className="w-6 h-6" />;
    default:
      return <FileText className="w-6 h-6" />;
  }
};

export default function ServiceSelection({ onSelect }: ServiceSelectionProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-gray-900">Select Service Type</h3>
        <p className="mt-1 text-sm text-gray-500">
          Choose the type of service you want to propose
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className="flex flex-col items-center p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              {getIcon(service.icon)}
            </div>
            <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
            <p className="mt-2 text-sm text-gray-500">{service.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}