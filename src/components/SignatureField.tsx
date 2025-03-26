import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import SignaturePad from './SignaturePad';

interface SignatureFieldProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function SignatureField({
  label = 'Signature',
  value,
  onChange,
  required = false
}: SignatureFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (signatureData: string) => {
    onChange(signatureData);
    setIsOpen(false);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div 
        className={`border-2 border-dashed rounded-lg p-4 ${
          value ? 'border-gray-200' : 'border-gray-300'
        }`}
      >
        {value ? (
          <div className="relative group">
            <img 
              src={value} 
              alt="Signature" 
              className="max-h-24 mx-auto"
            />
            <button
              onClick={() => setIsOpen(true)}
              className="absolute inset-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="bg-white rounded-full p-2 shadow-lg">
                <Edit2 className="w-4 h-4 text-gray-600" />
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full py-8 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors rounded-md"
          >
            <Edit2 className="w-6 h-6 mb-2" />
            <span className="text-sm">Click to sign</span>
          </button>
        )}
      </div>

      {isOpen && (
        <SignaturePad
          onSave={handleSave}
          onCancel={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}