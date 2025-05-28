import React, { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import EditMSPMRCInputs from "./EditMRCMSPInput";
import EditNRCFeeItem from "./EditNRCFeeItem";
import EditMRCInput from "./EditMRCInput";
import { Fee } from "../../../lib/types";

interface FeesStepProps {
  proposalType: string;
  fees: Fee[];
  onBack: () => void;
  onSubmit: (fees: Fee[]) => void;
}

export default function EditFeesStep({
  proposalType,
  fees,
  onBack,
  onSubmit,
}: FeesStepProps) {
  const [proposalFees, setProposalFees] = useState<Fee[]>(fees);
  const [perUserAmount, setPerUserAmount] = useState("");
  const [totalUsers, setTotalUsers] = useState("");

  // Calculate total MRC for MSP proposals
  const calculateTotalMRC = useCallback(() => {
    if (proposalType === "msp") {
      const perUser = parseFloat(perUserAmount) || 0;
      const users = parseInt(totalUsers) || 0;
      return (perUser * users).toString();
    }
    const mrcFee = proposalFees.find((fee) => fee.type === "mrc");
    return mrcFee ? mrcFee.amount : "";
  }, [proposalType, perUserAmount, totalUsers, proposalFees]);

  const addFee = useCallback((type: string) => {
    setProposalFees((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: "",
        amount: "",
        notes: "",
        type: type as "nrc" | "mrc",
      },
    ]);
  }, []);

  const updateFee = useCallback(
    (id: string, field: keyof Fee, value: string) => {
      setProposalFees((prev) =>
        prev.map((fee) => (fee.id === id ? { ...fee, [field]: value } : fee))
      );
    },
    []
  );

  const removeFee = useCallback((id: string) => {
    setProposalFees((prev) => prev.filter((fee) => fee.id !== id));
  }, []);

  const calculateNRCTotal = useCallback(() => {
    return proposalFees
      .filter((fee) => fee.type === "nrc")
      .reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
  }, [proposalFees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allFees = proposalFees.filter((fee) => fee.type === "nrc");
    const totalMRC = calculateTotalMRC();
    const resultFees = [...allFees];
    if (proposalType === "msp" && totalMRC) {
      resultFees.push({
        id: crypto.randomUUID(),
        description: "Monthly Service Fee",
        amount: totalMRC,
        notes: `Based on ${totalUsers} users at $${perUserAmount} per user`,
        totalUser: totalUsers,
        feesPerUser: perUserAmount,
        type: "mrc",
      });
    } else if (proposalType !== "msp") {
      const mrcFee = proposalFees.find((fee) => fee.type === "mrc");
      if (mrcFee) resultFees.push(mrcFee);
    }
    onSubmit(resultFees);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Fees & Charges</h2>
        <p className="mt-2 text-gray-600">
          Add{" "}
          {proposalType === "buildouts" ? "one-time" : "one-time and recurring"}{" "}
          charges for your proposal
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
              onClick={() => addFee("nrc")}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Charge
            </button>
          </div>
          <div className="space-y-4">
            {proposalFees
              .filter((fee) => fee.type === "nrc")
              .map((fee) => (
                <EditNRCFeeItem
                  key={fee.id}
                  fee={fee}
                  updateFee={updateFee}
                  removeFee={removeFee}
                />
              ))}
            {proposalFees.filter((fee) => fee.type === "nrc").length === 0 && (
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
        {/* MRC Section - Only show if not buildouts */}
        {proposalType !== "buildouts" && (
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
              {proposalType === "msp" ? (
                <EditMSPMRCInputs
                  perUserAmount={perUserAmount}
                  setPerUserAmount={setPerUserAmount}
                  totalUsers={totalUsers}
                  setTotalUsers={setTotalUsers}
                />
              ) : (
                <EditMRCInput
                  value={
                    proposalFees.find((fee) => fee.type === "mrc")?.amount || ""
                  }
                  onChange={(v) => {
                    const mrcFee = proposalFees.find(
                      (fee) => fee.type === "mrc"
                    );
                    if (mrcFee) {
                      updateFee(mrcFee.id, "amount", v);
                    } else {
                      setProposalFees([
                        ...proposalFees,
                        {
                          id: crypto.randomUUID(),
                          description: "Monthly Service Fee",
                          amount: v,
                          notes: "",
                          type: "mrc",
                        },
                      ]);
                    }
                  }}
                />
              )}
              {/* Show calculated total for MSP */}
              {proposalType === "msp" && (
                <div className="mt-4 flex justify-end">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <span className="text-sm text-gray-600">
                      Total Monthly Fee:
                    </span>
                    <span className="ml-2 text-lg font-semibold text-gray-900">
                      ${(parseFloat(calculateTotalMRC()) || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
