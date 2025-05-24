import { Trash2, DollarSign } from "lucide-react";

interface Fee {
  id: string;
  description: string;
  amount: string;
  notes: string;
  type: "nrc" | "mrc";
  totalUser?: string;
  feesPerUser?: string;
}

const NRCFeeItem = ({
  fee,
  updateFee,
  removeFee,
}: {
  fee: Fee;
  updateFee: (id: string, field: keyof Fee, value: string) => void;
  removeFee: (id: string) => void;
}) => (
  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <input
          type="text"
          required
          value={fee.description}
          onChange={(e) => updateFee(fee.id, "description", e.target.value)}
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
            onChange={(e) => updateFee(fee.id, "amount", e.target.value)}
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
);

export default NRCFeeItem;
