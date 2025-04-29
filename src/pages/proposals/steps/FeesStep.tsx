import React, { useState } from "react";
import { Plus, Trash2, DollarSign } from "lucide-react";

interface Fee {
  id: string;
  description: string;
  amount: string;
  notes: string;
  type: "nrc" | "mrc";
}

interface FeesStepProps {
  initialNRC: Fee[];
  initialMRC: string;
  onBack: () => void;
  onSubmit: (fees: Fee[]) => void;
}

export default function FeesStep({
  initialNRC,
  initialMRC,
  onBack,
  onSubmit,
}: FeesStepProps) {
  console.log(initialNRC);
  const [fees, setFees] = useState<Fee[]>(initialNRC);
  const [mrcAmount, setMrcAmount] = useState(initialMRC);

  const addFee = () => {
    setFees([
      ...fees,
      {
        id: crypto.randomUUID(),
        description: "",
        amount: "",
        notes: "",
        type: "nrc",
      },
    ]);
  };

  const updateFee = (id: string, field: keyof Fee, value: string) => {
    setFees(
      fees.map((fee) => (fee.id === id ? { ...fee, [field]: value } : fee)),
    );
  };

  const removeFee = (id: string) => {
    setFees(fees.filter((fee) => fee.id !== id));
  };

  const calculateNRCTotal = () => {
    return fees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create an MRC fee if amount is set
    const allFees = [...fees];
    if (mrcAmount) {
      allFees.push({
        id: crypto.randomUUID(),
        description: "Monthly Service Fee",
        amount: mrcAmount,
        notes: "",
        type: "mrc",
      });
    }

    onSubmit(allFees);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Fees & Charges</h2>
        <p className="mt-2 text-gray-600">
          Add one-time and recurring charges for your proposal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* NRC Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">
                One-Time Charges (NRC)
              </h3>
              <p className="text-sm text-gray-500">
                Non-recurring charges for initial setup and equipment
              </p>
            </div>
            <button
              type="button"
              onClick={addFee}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Charge
            </button>
          </div>

          <div className="space-y-4">
            {fees.map((fee) => (
              <div key={fee.id} className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      required
                      value={fee.description}
                      onChange={(e) =>
                        updateFee(fee.id, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Installation Fee"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={fee.amount}
                        onChange={(e) =>
                          updateFee(fee.id, "amount", e.target.value)
                        }
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={fee.notes}
                    onChange={(e) => updateFee(fee.id, "notes", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Add any additional details about this charge..."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeFee(fee.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {fees.length === 0 && (
              <p className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                No one-time charges added yet
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600">Total NRC:</span>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                ${calculateNRCTotal().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* MRC Section */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Monthly Fee (MRC)
            </h3>
            <p className="text-sm text-gray-500">
              Monthly recurring charge for services
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Fee Amount *
              </label>
              <div className="relative max-w-xs">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={mrcAmount}
                  onChange={(e) => setMrcAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}

