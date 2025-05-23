import { useEffect, useState } from "react";
import {
  FileText,
  Building2,
  Mail,
  Phone,
  MapPin,
  Package,
  Printer,
  Send,
  Download,
  DollarSign,
  Clock,
  Save,
  IconNode,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProposal } from "../../../contexts/proposals";
import { saveProposal } from "../../../lib/data/proposals.data";
import { Fee, FeeInput, Quote, QuoteInput } from "../../../lib/types";
import { generatePDF } from "../../../lib/generate-pdf";
import MSPTermsOfService from "../../../components/terms-of-service/msp-tos";
import VulscanTermsOfService from "../../../components/terms-of-service/vulscan-tos";
import UNMTermsOfService from "../../../components/terms-of-service/unm-tos";
import UNMServices from "../../../components/proposals/services/unm-services";
import MSPServices from "../../../components/proposals/services/msp-services";

interface ReviewStepProps {
  clientInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    organization: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  sections: {
    id: string;
    name: string;
    equipment: {
      inventory_item_id: string;
      name: string;
      quantity: number;
      category: string;
      image_url: string | null;
      unit_price?: number;
      description?: string;
    }[];
  }[];
  fees: Fee[];
  proposalTypeInfo: {
    id: string;
    name: string;
    description: string;
    icon: IconNode;
    color: string;
    bgImage: string;
  };
  onBack: () => void;
}

export default function ReviewStep({
  proposalTypeInfo,
  clientInfo,
  sections,
  fees,
  onBack,
}: ReviewStepProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [taxRate, setTaxRate] = useState(7);
  const [isTaxConfirmed, setIsTaxConfirmed] = useState(false);
  const { proposal, setProposal } = useProposal();

  useEffect(() => {
    saveQuote("draft");
  }, []);

  const calculateNRCTotal = (): number => {
    return fees
      .filter((fee: Fee) => fee.type === "nrc")
      .reduce((sum: number, fee: Fee) => sum + parseFloat(fee.amount), 0);
  };

  const calculateMRCTotal = (): number => {
    return fees
      .filter((fee: Fee) => fee.type === "mrc")
      .reduce((sum: number, fee: Fee) => sum + parseFloat(fee.amount), 0);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const saveQuote = async (status: string) => {
    const quoteData: QuoteInput = {
      title: `${proposalTypeInfo.name} Agreement - ${clientInfo.organization}`,
      status: status,
      total_mrr: calculateMRCTotal(),
      total_nrc: calculateNRCTotal(),
      term_months: 36,
      notes: `Proposal for ${clientInfo.organization}`,
      total_users:
        Number(fees.filter((fee: Fee) => fee.type === "mrc")[0].totalUser) || 0,
      amount_per_user:
        Number(fees.filter((fee: Fee) => fee.type === "mrc")[0].feesPerUser) ||
        0,
    };

    const quoteVariables = [
      { name: "client_name", value: clientInfo.name },
      { name: "client_title", value: clientInfo.title },
      { name: "client_email", value: clientInfo.email },
      { name: "client_phone", value: clientInfo.phone },
      { name: "organization", value: clientInfo.organization },
      {
        name: "address",
        value: `${clientInfo.streetAddress}, ${clientInfo.city}, ${clientInfo.state} ${clientInfo.zipCode}`,
      },
    ];

    const quoteItems = sections.flatMap((section) =>
      section.equipment.map((item) => ({
        section_name: section.name,
        inventory_item_id: item.inventory_item_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price || 0,
        is_recurring: false,
      }))
    );

    // Convert fees to FeeInput[] format
    const quoteFees: FeeInput[] = fees.map((fee: Fee) => ({
      description: fee.description,
      amount: fee.amount,
      notes: fee.notes,
      type: fee.type,
    }));

    const quote = await saveProposal(
      proposal?.id || null,
      quoteData,
      quoteVariables,
      quoteItems,
      quoteFees
    );
    setProposal(quote);
    return quote;
  };

  const handleSaveAsDraft = async () => {
    try {
      setIsSaving(true);
      await saveQuote("draft");
      alert("Proposal saved as draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestSignature = async () => {
    try {
      // Save quote
      setIsRequesting(true);
      const quote: Quote = await saveQuote("draft");
      setIsRequesting(false);
      console.log("Quote saved successfully");

      // Generate pdf
      console.log("Generating pdf");
      const time = new Date()
        .toLocaleString([], { hour12: false })
        .replace(", ", "")
        .replace(/:/g, "")
        .replace(/\//g, "");

      setIsGeneratingPDF(true);
      const pdfLink = await generatePDF(
        `${quote.title}-${time}.pdf`,
        proposalTypeInfo,
        clientInfo,
        quote.id,
        sections,
        {
          nrc: fees.filter((fee: Fee) => fee.type === "nrc"),
          mrc: calculateMRCTotal().toString(),
        }
      );
      setIsGeneratingPDF(false);
      console.log("PDF generated!");

      location.href = `/request-signature/${proposal?.id}?pdf=${pdfLink}&name=${quote.title}`;
    } catch (error) {
      console.log(error);
      setIsRequesting(false);
      setIsGeneratingPDF(false);
      alert("Unable to process agreement");
    }
  };

  const downloadPDF = () => {
    const pdfname = `${proposal?.title}`;
    const originalTitle = document.title;
    document.title = pdfname;
    window.print();
    document.title = originalTitle;
  };

  const renderPreview = () => {
    const vulscanText =
      "By signing this Service Order Form, NSB Board of Realtors is acknowledging to have read and understood the Terms and Conditions which are incorporated in this Service Order Form. Please sign and date below and return it to ITX Solutions, Inc.";
    const unmText = "";
    const mspText =
      "By signing this Service Order Form, Milestone Title Services is acknowledging to have read and understood the Terms and Conditions which are incorporated in this Service Order Form. Please sign and date below and return it to ITX Solutions, Inc.";

    const calculateTotalEquipments = () => {
      const totalEquipments = sections.map((s) => s.equipment).flat();
      return totalEquipments.reduce((acc, curr) => acc + curr.quantity, 0);
    };

    const calculateHalfLaborFee = () => {
      const totalLaborFee = fees
        .filter((fee: Fee) => fee.type === "nrc")
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
      return totalLaborFee / 2;
    };

    const calculateTotalEquipmentsFee = () => {
      const totalEquipments = sections.map((s) => s.equipment).flat();
      return totalEquipments.reduce(
        (acc, curr) => acc + (curr.unit_price || 0) * curr.quantity,
        0
      );
    };

    return (
      <div className="bg-gray-100">
        <div className="bg-white border-b sticky top-0 z-10 no-print">
          <div className="max-w-[8.5in] mx-auto px-4 py-2 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Preview Agreement
            </h3>
            <div className="flex gap-3">
              <button
                onClick={downloadPDF}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close Preview
              </button>
              <button
                onClick={handleRequestSignature}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isRequesting
                  ? "Saving proposoal..."
                  : isGeneratingPDF
                  ? "Generating PDF..."
                  : "Request Signature"}
              </button>
            </div>
          </div>
        </div>

        <div
          id="pdf-content"
          className="print-content min-h-screen w-[8.5in] mx-auto"
        >
          {/* Cover Page */}
          <div className="bg-white w-[8.5in] h-[11in] mx-auto relative">
            {/* Top Half - Cover */}
            <div className="h-[5.5in] relative">
              {/* Background Image */}
              <div
                style={{
                  backgroundImage: `url('${proposalTypeInfo.bgImage}')`,
                }}
                className={`absolute inset-0 bg-[url('${proposalTypeInfo.bgImage}')] bg-cover bg-center`}
              ></div>

              {/* Agreement Date */}
              <div className="absolute top-8 right-[0.75in] text-right">
                <p className="text-sm text-white/80">Agreement Date</p>
                <p className="text-lg text-white">
                  {new Date().toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Content */}
              <div className="relative p-[0.75in] pt-24">
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    ITX Solutions
                  </h1>
                  <div className="w-24 h-1 bg-white"></div>
                </div>

                {/* Name of the proposal */}
                <div className="mt-16">
                  <h2 className="text-5xl font-bold text-white mb-4">
                    {proposalTypeInfo.description.split(" ")[0]}
                    <br />
                    {proposalTypeInfo.description.split(" ")[1]}
                    <br />
                    {proposalTypeInfo.description.split(" ")[2]}
                  </h2>
                  <p className="text-2xl text-white/90 mt-8">
                    Service Agreement
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Half - Client Info */}
            <div className="h-[5.5in] p-[0.75in] relative">
              <div className="bg-gray-50 rounded-xl p-8 h-full">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                  Client Information
                </h2>

                <div className="grid grid-cols-2 gap-y-8">
                  <div>
                    <p className="text-gray-500 mb-2">Business Name</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {clientInfo.organization}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 mb-2">Contact Name</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {clientInfo.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 mb-2">Title</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {clientInfo.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 mb-2">Email</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {clientInfo.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 mb-2">Phone</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {clientInfo.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 mb-2">Business Address</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {clientInfo.streetAddress}
                      <br />
                      {clientInfo.city}, {clientInfo.state} {clientInfo.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services page */}
          {proposalTypeInfo.id === "unm" && <UNMServices />}
          {proposalTypeInfo.id === "msp" && <MSPServices />}

          {/* Equipment page */}
          <div className="print-content proposal-page bg-white w-[8.5in] h-[11in] mx-auto p-[0.75in] shadow-lg relative mt-8 page-break">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Equipment
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id}>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      {section.name}
                    </h4>
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                      <div className="divide-y divide-gray-200">
                        {section.equipment.map((item) => (
                          <div
                            key={item.inventory_item_id}
                            className="flex items-center gap-3 p-4"
                          >
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="text-base font-medium text-gray-900">
                                {item.name}
                              </h5>
                              {proposalTypeInfo.id === "buildouts" &&
                                item.description && (
                                  <p className="text-sm text-gray-600 mt-0.5 mb-2">
                                    {item.description}
                                  </p>
                                )}
                              <p className="text-sm text-gray-500">
                                {item.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-6">
                              {proposalTypeInfo.id === "buildouts" &&
                                item.unit_price !== undefined && (
                                  <div className="px-4 py-2 rounded-lg">
                                    <span className="text-base font-semibold text-green-700">
                                      ${item.unit_price.toLocaleString()} / unit
                                    </span>
                                  </div>
                                )}
                              <div className="text-sm font-medium text-gray-900">
                                Quantity: {item.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Fees */}
          <div className="proposal-page bg-white w-[8.5in] min-h-[11in] mx-auto p-[0.75in] shadow-lg relative mt-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Service Fees
            </h2>

            <div className="space-y-6 max-w-2xl">
              {proposalTypeInfo.id !== "buildouts" && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">
                      Monthly Recurring Charges (MRC)
                    </h3>
                  </div>
                  {proposalTypeInfo.id === "msp" ? (
                    <div className="space-y-4">
                      {fees
                        .filter((fee: Fee) => fee.type === "mrc")
                        .map((fee: Fee) => (
                          <div
                            key={fee.id}
                            className="flex items-center justify-between"
                          >
                            <p className="text-gray-600">{fee.description}</p>
                            <p className="text-3xl font-bold text-blue-600">
                              {formatCurrency(
                                parseFloat(fee.feesPerUser || "0")
                              )}
                              /user x {fee.totalUser} Users
                            </p>
                          </div>
                        ))}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-gray-600">Total Monthly Fee</p>
                        <p className="text-4xl font-bold text-blue-600">
                          {formatCurrency(calculateMRCTotal())}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-4">
                        Billed monthly for 36 months
                      </p>
                      <p className="text-4xl font-bold text-blue-600">
                        {formatCurrency(calculateMRCTotal())}
                      </p>
                    </>
                  )}
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">
                    Non-Recurring Charges (NRC)
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  One-time setup and installation
                </p>
                {proposalTypeInfo.id !== "buildouts" ? (
                  <>
                    <p className="text-4xl font-bold text-blue-600">
                      {formatCurrency(calculateNRCTotal())}
                    </p>
                    <div className="mt-6 space-y-4">
                      {fees
                        .filter((fee: Fee) => fee.type === "nrc")
                        .map((fee: Fee) => (
                          <div
                            key={fee.id}
                            className="flex justify-between items-start text-sm"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {fee.description}
                              </p>
                              {fee.notes && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {fee.notes}
                                </p>
                              )}
                            </div>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(parseFloat(fee.amount))}
                            </p>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 px-4 rounded-lg bg-gray-100">
                      <p className="text-gray-600 font-bold">Total Equipment</p>
                      <p className="text-gray-900 font-bold">
                        {calculateTotalEquipments()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100">
                      <p className="text-gray-600 font-bold">Tax</p>
                      {!isTaxConfirmed ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="text-gray-900 font-bold">%</span>
                          <button
                            onClick={() => setIsTaxConfirmed(true)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                          >
                            Confirm
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            {taxRate}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 rounded-lg bg-gray-100">
                      <p className="mb-4 text-gray-600 font-bold">
                        Total Labor
                      </p>
                      <div className="space-y-3">
                        {fees
                          .filter((fee: Fee) => fee.type === "nrc")
                          .map((fee: Fee) => (
                            <div
                              key={fee.id}
                              className="flex justify-between items-start text-sm"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {fee.description}
                                </p>
                                {fee.notes && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {fee.notes}
                                  </p>
                                )}
                              </div>
                              <p className="font-medium text-gray-900">
                                {formatCurrency(parseFloat(fee.amount))}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Total due */}
                    <p className="text-gray-900 font-bold mt-5">
                      Total due at signing:
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">Equipment:</p>
                      <p className="text-blue-600 text-2xl font-bold">
                        ${calculateTotalEquipmentsFee()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">Labor:</p>
                      <p className="text-blue-600 text-2xl font-bold">
                        ${calculateHalfLaborFee()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Payment Terms
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  First payment due upon agreement signing
                </li>
                {proposalTypeInfo.id !== "buildouts" && (
                  <li className="flex items-center gap-3 text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    Monthly payments due on the 1st of each month
                  </li>
                )}
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  {proposalTypeInfo.id === "buildouts"
                    ? "Net 14 days"
                    : "Net 30 payment terms"}
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  {proposalTypeInfo.id === "buildouts"
                    ? "100% Equipment and 50% of Labor upfront"
                    : "Late payments subject to 1.5% monthly fee"}
                </li>

                {proposalTypeInfo.id === "buildouts" && (
                  <li className="flex items-center gap-3 text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    50% Labor remainder paid upon job completion
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Terms & Conditions */}
          {proposalTypeInfo.id === "unm" && <UNMTermsOfService />}
          {proposalTypeInfo.id === "msp" && <MSPTermsOfService />}
          {proposalTypeInfo.id === "vulscan" && <VulscanTermsOfService />}

          {/* Signature Page */}
          <div className="html2pdf__page-break proposal-page bg-white w-[8.5in] h-[11in] mx-auto p-[0.75in] shadow-lg relative mt-8">
            <span className="text-sm text-gray-600">
              {proposalTypeInfo.id === "vulscan" && vulscanText}
              {proposalTypeInfo.id === "unm" && unmText}
              {proposalTypeInfo.id === "msp" && mspText}
            </span>
            <div className="space-y-8 mt-12">
              <div>
                <div className="border-b-2 border-gray-300 w-full"></div>
                <label className="block text-sm font-medium text-gray-700 my-1">
                  Print Name
                </label>
              </div>

              <div>
                <div className="border-b-2 border-gray-300 w-full"></div>
                <label className="block text-sm font-medium text-gray-700 my-1">
                  Title
                </label>
              </div>

              <div>
                <div className="border-b-2 border-gray-300 w-full"></div>
                <label className="block text-sm font-medium text-gray-700 my-1">
                  Date
                </label>
              </div>

              <div className="pt-12">
                <div className="border-b-2 border-gray-300 w-full"></div>
                <label className="block text-sm font-medium text-gray-700 my-1">
                  Sign Name
                </label>
              </div>

              <Link
                to={`${import.meta.env.VITE_BASE_URL}/confirm-agreement/${
                  proposal?.id
                }`}
              >
                <button className="bg-sky-500 text-white text-xl font-bold px-7 py-4 mt-8">
                  Accept Quote
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showPreview) {
    return renderPreview();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Review Proposal
        </h2>
        <p className="mt-2 text-gray-600">
          Review all details and preview your proposal
        </p>
      </div>

      <div className="space-y-8">
        {/* Client Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Client Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Organization
                  </h4>
                  <p className="text-sm text-gray-900">
                    {clientInfo.organization}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Contact</h4>
                  <p className="text-sm text-gray-900">{clientInfo.name}</p>
                  <p className="text-sm text-gray-600">{clientInfo.title}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Email</h4>
                  <p className="text-sm text-gray-900">{clientInfo.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Phone</h4>
                  <p className="text-sm text-gray-900">{clientInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Address</h4>
                  <p className="text-sm text-gray-900">
                    {clientInfo.streetAddress}
                  </p>
                  <p className="text-sm text-gray-900">
                    {clientInfo.city}, {clientInfo.state} {clientInfo.zipCode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Sections */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Equipment</h3>
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {section.name}
                </h4>
                <div className="space-y-3">
                  {section.equipment.map((item) => (
                    <div
                      key={item.inventory_item_id}
                      className="flex items-center gap-4 bg-white p-3 rounded-lg"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900">
                          {item.name}
                        </h5>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {proposalTypeInfo.id === "buildouts" &&
                          item.unit_price !== undefined && (
                            <div className="px-3 py-1.5 rounded-lg">
                              <span className="text-sm font-bold text-green-700">
                                ${item.unit_price.toLocaleString()} / unit
                              </span>
                            </div>
                          )}
                        <div className="text-sm font-medium text-gray-900">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fees */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Fees & Charges
          </h3>

          {/* NRC */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              One-Time Charges (NRC)
            </h4>
            <div className="space-y-3">
              {fees
                .filter((fee: Fee) => fee.type === "nrc")
                .map((fee: Fee) => (
                  <div
                    key={fee.id}
                    className="flex items-start justify-between bg-white p-3 rounded-lg"
                  >
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">
                        {fee.description}
                      </h5>
                      {fee.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          {fee.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(parseFloat(fee.amount))}
                    </div>
                  </div>
                ))}
              <div className="flex justify-end pt-3 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-900">
                  Total NRC: {formatCurrency(calculateNRCTotal())}
                </div>
              </div>
            </div>
          </div>

          {/* MRC - Only show if not buildouts */}
          {proposalTypeInfo.id !== "buildouts" && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">
                  Monthly Recurring Charges (MRC)
                </h3>
              </div>
              {proposalTypeInfo.id === "msp" ? (
                <div className="space-y-4">
                  {fees
                    .filter((fee: Fee) => fee.type === "mrc")
                    .map((fee: Fee) => (
                      <div
                        key={fee.id}
                        className="flex items-center justify-between"
                      >
                        <p className="text-gray-600">{fee.description}</p>
                        <p className="text-3xl text-blue-600 font-bold">
                          {formatCurrency(parseFloat(fee.feesPerUser || "0"))}
                          /user x {fee.totalUser} Users
                        </p>
                      </div>
                    ))}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-gray-600">Total Monthly Fee</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {formatCurrency(calculateMRCTotal())}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Billed monthly for 36 months
                  </p>
                  <p className="text-4xl font-bold text-blue-600">
                    {formatCurrency(calculateMRCTotal())}
                  </p>
                </>
              )}
            </div>
          )}
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
            type="button"
            onClick={handleSaveAsDraft}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <Printer className="w-5 h-5 mr-2" />
            Preview Agreement
          </button>
        </div>
      </div>
    </div>
  );
}
