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
  Shield,
  Server,
  Clock,
  Save,
  IconNode,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProposal } from "../../../contexts/proposals";
import { saveProposal } from "../../../lib/data/proposals.data";
import { FeeInput, Quote, QuoteInput } from "../../../lib/types";
import { generatePDF } from "../../../lib/generate-pdf";

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
    }[];
  }[];
  fees: {
    nrc: {
      id: string;
      description: string;
      amount: number;
      notes: string;
    }[];
    mrc: number;
  };
  proposalTypeInfo: {
    id: string;
    name: string;
    description: string;
    icon: IconNode;
    color: string;
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
  const { proposal, setProposal } = useProposal();

  useEffect(() => {
    saveQuote("draft");
  }, []);

  const calculateNRCTotal = () => {
    return fees.nrc.reduce((sum, fee) => sum + fee.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    const [dollars, cents] = amount.toFixed(2).split(".");
    const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedDollars}.${cents}`;
  };

  const saveQuote = async (status: string) => {
    const quoteData: QuoteInput = {
      title: `${proposalTypeInfo.name} Agreement - ${clientInfo.organization}`,
      status: status,
      total_mrr: fees.mrc,
      total_nrc: calculateNRCTotal(),
      term_months: 36,
      notes: `Proposal for ${clientInfo.organization}`,
    };
    const quoteVariables = [
      { name: "client_name", value: clientInfo.name },
      { name: "client_title", value: clientInfo.title },
      { name: "client_email", value: clientInfo.email },
      { name: "client_phone", value: clientInfo.phone },
      {
        name: "organization",
        value: clientInfo.organization,
      },
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
        unit_price: 0, // You would typically get this from your inventory system
        is_recurring: false,
      })),
    );

    const nrcFeesFormatted = fees.nrc.map((f) => ({
      amount: f.amount,
      notes: f.notes,
      description: f.description,
      type: "nrc",
    }));
    const feesFormatted = [
      ...nrcFeesFormatted,
      { description: "", type: "mrc", amount: fees.mrc, notes: "" },
    ];

    const quote = await saveProposal(
      proposal?.id || null,
      quoteData,
      quoteVariables,
      quoteItems,
      feesFormatted as FeeInput[],
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
      setIsGeneratingPDF(true);
      const pdfLink = await generatePDF(
        `${quote.title}-${new Date(quote.created_at).toISOString()}`,
        proposalTypeInfo,
        clientInfo,
        quote.id,
        sections,
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

  const renderPreview = () => {
    return (
      <div className="bg-gray-100">
        <div className="bg-white border-b sticky top-0 z-10 no-print">
          <div className="max-w-[8.5in] mx-auto px-4 py-2 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Preview Agreement
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
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
              <div className="absolute inset-0 bg-[url('/proposal-unm-bg.png')] bg-cover bg-center"></div>

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
          <div className="proposal-page bg-white w-[8.5in] h-[11in] mx-auto p-[0.75in] shadow-lg relative mt-8 page-break">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Services</h2>

            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Network Security</h3>
                </div>
                <p className="text-gray-600">
                  24/7 monitoring, threat detection, and immediate response to
                  security incidents
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    Infrastructure Management
                  </h3>
                </div>
                <p className="text-gray-600">
                  Proactive maintenance and optimization of your network
                  infrastructure
                </p>
              </div>
            </div>
          </div>

          {/* Equipment page */}
          <div className="print-content proposal-page bg-white w-[8.5in] h-[11in] mx-auto p-[0.75in] shadow-lg relative mt-8 page-break">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Equipment
            </h2>
            <div className="bg-gray-50 rounded-xl p-8 mb-8">
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
                            className="flex items-center gap-4 p-4"
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
                              <p className="text-sm text-gray-500">
                                {item.category}
                              </p>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              Quantity: {item.quantity}
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
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">
                    Monthly Recurring Charges (MRC)
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Billed monthly for 36 months
                </p>
                <p className="text-4xl font-bold text-blue-600">
                  ${formatCurrency(fees.mrc)}
                  <span className="text-lg text-gray-500">/month</span>
                </p>
              </div>

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
                <p className="text-4xl font-bold text-blue-600">
                  ${formatCurrency(calculateNRCTotal())}
                </p>
                <div className="mt-6 space-y-4">
                  {fees.nrc.map((fee, index) => (
                    <div
                      key={index}
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
                        ${formatCurrency(fee.amount)}
                      </p>
                    </div>
                  ))}
                </div>
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
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  Monthly payments due on the 1st of each month
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  Net 30 payment terms
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  Late payments subject to 1.5% monthly fee
                </li>
              </ul>
            </div>
          </div>

          {/* Labour section */}
          {proposalTypeInfo.id === "buildouts" && (
            <div className="proposal-page bg-white w-[8.5in] h-[11in] mx-auto p-[0.75in] shadow-lg relative mt-8 overflow-hidden">
              <h2 className="text-3xl font-bold text-gray-900 mb-12">Labour</h2>

              <div className="space-y-6 text-gray-600"></div>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="proposal-page bg-white w-[8.5in] h-[11in] mx-auto p-[0.75in] shadow-lg relative mt-8 overflow-hidden">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Terms and Conditions
            </h2>

            <div className="space-y-6 text-gray-600">
              <p className="mb-8">
                These Terms of Service constitute the agreement ("Agreement")
                between ITX Solutions ("Provider", "we", "us", or "ITX
                Solutions") and the End User ("You", "Your" or "Client") of ITX
                Solutions' Business Network and IT Support Services ("Service",
                "Services"). This Agreement governs the Services, as well as the
                use of any ITX Solutions-supplied hardware and software.
              </p>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  1. Term and Termination
                </h3>
                <p>
                  This Agreement is effective for 48 months from the date of
                  installation, with automatic renewal for successive 48-month
                  terms unless terminated with 30 days written notice. Early
                  termination fees apply.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  2. Support Hours and Fees
                </h3>
                <p>
                  Standard support hours are Monday through Friday, 9AM - 6PM
                  Eastern Time. Emergency support outside these hours will be
                  billed at $150 per hour.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  3. Payment Terms
                </h3>
                <p>
                  Client will pay Service Provider within 25 days of receipt of
                  invoice. Late payments subject to 3.5% monthly charge.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  4. Limitation of Liability
                </h3>
                <p>
                  Neither party will be liable for special, indirect,
                  incidental, consequential, exemplary, or punitive damages,
                  except in cases of gross negligence or willful misconduct.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  5. Property Rights
                </h3>
                <p>
                  ITX Solutions retains ownership rights to all intellectual
                  property, hardware, and equipment installed or utilized under
                  this Agreement.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  6. Dispute Resolution
                </h3>
                <p>
                  This Agreement shall be governed by Florida law. Disputes
                  shall be resolved by binding arbitration in Orange County,
                  Florida.
                </p>
              </div>
            </div>
          </div>

          <div className="proposal-page bg-white w-[8.5in] h-[11in] mx-auto p-[0.75in] shadow-lg relative mt-8">
            <div className="space-y-6 text-gray-600">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  7. Service Level Agreement (SLA)
                </h3>
                <p>
                  ITX Solutions commits to a 4-hour maximum response time for
                  critical system failures.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  8. Force Majeure
                </h3>
                <p>
                  ITX Solutions shall not be liable for failures due to
                  circumstances beyond reasonable control, including acts of
                  God, governmental actions, or natural disasters.
                </p>
              </div>
            </div>
          </div>

          {/* Signature Page */}
          <div className="html2pdf__page-break proposal-page bg-white w-[8.5in] h-[11in] mx-auto p-[0.75in] shadow-lg relative mt-8">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sign Name
                </label>
                <div className="border-b-2 border-gray-300 w-full"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Print Name
                </label>
                <div className="border-b-2 border-gray-300 w-full"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <div className="border-b-2 border-gray-300 w-full"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="border-b-2 border-gray-300 w-full"></div>
              </div>

              <Link
                to={`${import.meta.env.VITE_BASE_URL}/confirm-agreement/${proposal?.id}`}
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
                      key={item.id}
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
                      <div className="text-sm font-medium text-gray-900">
                        Qty: {item.quantity}
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
              {fees.nrc.map((fee) => (
                <div
                  key={fee.id}
                  className="flex items-start justify-between bg-white p-3 rounded-lg"
                >
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      {fee.description}
                    </h5>
                    {fee.notes && (
                      <p className="text-xs text-gray-500 mt-1">{fee.notes}</p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${formatCurrency(fee.amount)}
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-3 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-900">
                  Total NRC: ${formatCurrency(calculateNRCTotal())}
                </div>
              </div>
            </div>
          </div>

          {/* MRC */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Monthly Fee (MRC)
            </h4>
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <h5 className="text-sm font-medium text-gray-900">
                Monthly Service Fee
              </h5>
              <div className="text-sm font-medium text-gray-900">
                ${formatCurrency(fees.mrc)}/month
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
