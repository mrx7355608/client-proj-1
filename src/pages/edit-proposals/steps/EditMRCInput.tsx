import { DollarSign } from "lucide-react";

const EditMRCInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="0.00"
      />
    </div>
  </div>
);

export default EditMRCInput;
