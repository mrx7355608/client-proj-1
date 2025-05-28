import { Users, DollarSign } from "lucide-react";

const EditMSPMRCInputs = ({
  perUserAmount,
  setPerUserAmount,
  totalUsers,
  setTotalUsers,
}: {
  perUserAmount: string;
  setPerUserAmount: (v: string) => void;
  totalUsers: string;
  setTotalUsers: (v: string) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Amount Per User *
      </label>
      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={perUserAmount}
          onChange={(e) => setPerUserAmount(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Total Number of Users *
      </label>
      <div className="relative">
        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="number"
          required
          min="1"
          value={totalUsers}
          onChange={(e) => setTotalUsers(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      </div>
    </div>
  </div>
);

export default EditMSPMRCInputs;
