import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  PenTool,
  CheckCircle,
  CheckSquare,
  Square,
  Edit3,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { sendSimpleMessage } from "../lib/send-email";
import IpAddress from "./IpAddress";

interface QuoteVariable {
  name: string;
  value: string;
}

// Sample state data
const US_STATES = [
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export default function ConfirmAgreementForm({
  quote,
  manipulatePDF,
}: {
  quote: any;
  manipulatePDF: (
    signText: string | null,
    signUrl: string | null,
  ) => Promise<{ file: File; pdfname: string }>;
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  // Billing address form state
  const [billingForm, setBillingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    title: "",
    address1: "",
    address2: "",
    state: "",
    city: "",
    postalCode: "",
  });

  // Shipping address form state
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    title: "",
    address1: "",
    address2: "",
    state: "",
    city: "",
    postalCode: "",
  });

  // Same as billing address toggle
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Signature state
  const [signatureText, setSignatureText] = useState("");
  const [signatureGenerated, setSignatureGenerated] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState<"text" | "draw">("text");

  // Canvas refs and state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSignature, setCanvasSignature] = useState<string | null>(null);

  useEffect(() => {
    if (!quote) return;

    const vars: QuoteVariable[] = quote.variables;
    const clientName = vars.filter((v) => v.name === "client_name")[0].value;
    const clientEmail = vars.filter((v) => v.name === "client_email")[0].value;
    const clientPhone = vars.filter((v) => v.name === "client_phone")[0].value;
    const clientTitle = vars.filter((v) => v.name === "client_title")[0].value;
    const organization = vars.filter((v) => v.name === "organization")[0].value;
    const address = vars.filter((v) => v.name === "address")[0].value;

    setBillingForm({
      fullName: clientName,
      email: clientEmail,
      phone: clientPhone,
      organization: organization,
      title: clientTitle,
      address1: address,
      address2: "",
      city: "",
      state: "",
      postalCode: "",
    });
  }, [quote]);

  // Handle billing form input changes
  const handleBillingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setBillingForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If same as billing is checked, update shipping form too
    if (sameAsBilling) {
      setShippingForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle shipping form input changes
  const handleShippingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle same as billing checkbox
  const handleSameAsBillingChange = () => {
    setSameAsBilling(!sameAsBilling);
    if (!sameAsBilling) {
      // Copy billing address to shipping address
      setShippingForm({ ...billingForm });
    }
  };

  // Handle signature text change
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignatureText(e.target.value);
  };

  // Generate signature effect when text changes
  useEffect(() => {
    if (signatureText) {
      setSignatureGenerated(signatureText);
    } else {
      setSignatureGenerated("");
    }
  }, [signatureText]);

  // Canvas drawing functions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set canvas properties
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX, clientY;

    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX, clientY;

    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevent scrolling when drawing
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save the signature as data URL
    setCanvasSignature(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setCanvasSignature(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let file, pdfname;

    setIsConfirming(true);

    // Sign pdf (drawing)
    if (canvasRef.current) {
      const signatureUrl = canvasRef.current.toDataURL("image/png");
      const { file: f, pdfname: p } = await manipulatePDF(null, signatureUrl);
      file = f;
      pdfname = p;
    } else if (signatureText) {
      const { file: f, pdfname: p } = await manipulatePDF(signatureText, null);
      file = f;
      pdfname = p;
    }

    if (!file || !pdfname) {
      return alert("There was an error while signing the agreement");
    }

    // const formData = {
    //   billing: billingForm,
    //   shipping: sameAsBilling ? billingForm : shippingForm,
    //   signature: signatureType === "text" ? signatureText : canvasSignature,
    // };

    try {
      // Update proposal status to "signed"
      const { error } = await supabase
        .from("quotes")
        .update({ status: "signed" })
        .eq("id", quote.id)
        .select()
        .single();

      if (error) throw error;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(`signed/${pdfname}`, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: "application/pdf",
        });
      if (uploadError) return alert("There was an error while saving the pdf");

      // Send email to the owner about confirmation of the agreement
      const emailReceiver = import.meta.env.VITE_EMAIL_RECEIVER;

      if (!emailReceiver) {
        throw new Error(
          "Reciever's email is not defined, please define VITE_EMAIL_RECEIVER in .env",
        );
      }

      const clientName = quote.variables.filter(
        (f) => f.name === "client_name",
      )[0].value;
      const clientOrg = quote.variables.filter(
        (f) => f.name === "organization",
      )[0].value;

      await sendSimpleMessage({
        to: emailReceiver,
        subject: "Agreement Confirmed",
        message: `
          An agreement has been confirmed, details are following:
          Title: ${quote.title}
          Status: "Signed",
          Quote #: ${quote.quote_number}
          Client: ${clientName}
          Organization: ${clientOrg}
        `,
        agreementPdf: file,
      });
      alert("Proposal has been confirmed!");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <CheckCircle className="mr-3 text-gray-700" size={28} />
            <span>Sign Agreement</span>
          </h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {error && <p className="text-red-500">{error}</p>}

            {/* Billing Address Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Billing Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    id="billing-fullName"
                    name="fullName"
                    value={billingForm.fullName}
                    onChange={handleBillingChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    id="billing-email"
                    name="email"
                    value={billingForm.email}
                    onChange={handleBillingChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    placeholder="Email"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    id="billing-phone"
                    name="phone"
                    value={billingForm.phone}
                    onChange={handleBillingChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    placeholder="Phone"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Building2 size={18} />
                  </div>
                  <input
                    type="text"
                    id="billing-organization"
                    name="organization"
                    value={billingForm.organization}
                    onChange={handleBillingChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    placeholder="Organization"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Briefcase size={18} />
                  </div>
                  <input
                    type="text"
                    id="billing-title"
                    name="title"
                    value={billingForm.title}
                    onChange={handleBillingChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    placeholder="Title"
                    required
                  />
                </div>

                <div className="relative md:col-span-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    id="billing-address1"
                    name="address1"
                    value={billingForm.address1}
                    onChange={handleBillingChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    placeholder="Address 1"
                    required
                  />
                </div>

                <div className="relative md:col-span-2">
                  <input
                    type="text"
                    id="billing-address2"
                    name="address2"
                    value={billingForm.address2}
                    onChange={handleBillingChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    placeholder="Address 2 (optional)"
                  />
                </div>

                <div className="relative">
                  <select
                    id="billing-state"
                    name="state"
                    value={billingForm.state}
                    onChange={handleBillingChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 appearance-none"
                    required
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="billing-city"
                    name="city"
                    value={billingForm.city}
                    onChange={handleBillingChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    placeholder="City"
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="billing-postalCode"
                    name="postalCode"
                    value={billingForm.postalCode}
                    onChange={handleBillingChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    placeholder="Postal Code"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Shipping Address
                </h2>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleSameAsBillingChange}
                    className="flex items-center text-sm text-gray-600 focus:outline-none"
                  >
                    {sameAsBilling ? (
                      <CheckSquare className="h-5 w-5 text-gray-600 mr-2" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-600 mr-2" />
                    )}
                    Same as billing address
                  </button>
                </div>
              </div>

              {!sameAsBilling && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      id="shipping-fullName"
                      name="fullName"
                      value={shippingForm.fullName}
                      onChange={handleShippingChange}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      placeholder="Full Name"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      id="shipping-email"
                      name="email"
                      value={shippingForm.email}
                      onChange={handleShippingChange}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      placeholder="Email"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      id="shipping-phone"
                      name="phone"
                      value={shippingForm.phone}
                      onChange={handleShippingChange}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      placeholder="Phone"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Building2 size={18} />
                    </div>
                    <input
                      type="text"
                      id="shipping-organization"
                      name="organization"
                      value={shippingForm.organization}
                      onChange={handleShippingChange}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      placeholder="Organization"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Briefcase size={18} />
                    </div>
                    <input
                      type="text"
                      id="shipping-title"
                      name="title"
                      value={shippingForm.title}
                      onChange={handleShippingChange}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      placeholder="Title"
                      required
                    />
                  </div>

                  <div className="relative md:col-span-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <MapPin size={18} />
                    </div>
                    <input
                      type="text"
                      id="shipping-address1"
                      name="address1"
                      value={shippingForm.address1}
                      onChange={handleShippingChange}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      placeholder="Address 1"
                      required
                    />
                  </div>

                  <div className="relative md:col-span-2">
                    <input
                      type="text"
                      id="shipping-address2"
                      name="address2"
                      value={shippingForm.address2}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      placeholder="Address 2 (optional)"
                    />
                  </div>

                  <div className="relative">
                    <select
                      id="shipping-state"
                      name="state"
                      value={shippingForm.state}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 appearance-none"
                      required
                    >
                      <option value="">Select State</option>
                      {US_STATES.map((state) => (
                        <option key={`shipping-${state}`} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      id="shipping-city"
                      name="city"
                      value={shippingForm.city}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      placeholder="City"
                      required
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      id="shipping-postalCode"
                      name="postalCode"
                      value={shippingForm.postalCode}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      placeholder="Postal Code"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700">
                    <DollarSign size={18} className="mr-2 text-gray-500" />
                    <span className="font-medium">Total Upfront</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800">
                    ${quote.total_nrc}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700">
                    <DollarSign size={18} className="mr-2 text-gray-500" />
                    <span className="font-medium">Total Recurring</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800">
                    ${quote.total_mrr}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Digital Signature
              </h2>

              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setSignatureType("text")}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    signatureType === "text"
                      ? "bg-gray-800 text-white"
                      : "bg-white border border-gray-200 text-gray-700"
                  }`}
                >
                  <PenTool size={18} className="mr-2" />
                  Type Signature
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureType("draw")}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    signatureType === "draw"
                      ? "bg-gray-800 text-white"
                      : "bg-white border border-gray-200 text-gray-700"
                  }`}
                >
                  <Edit3 size={18} className="mr-2" />
                  Draw Signature
                </button>
              </div>

              {signatureType === "text" ? (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      id="signature"
                      value={signatureText}
                      onChange={handleSignatureChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      placeholder="Type your name to sign"
                      required={signatureType === "text"}
                    />
                  </div>

                  {signatureGenerated && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Your Signature:
                      </p>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
                        <p className="font-signature text-3xl text-gray-800">
                          {signatureGenerated}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width="800"
                        height="150"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full bg-white touch-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                    >
                      Clear
                    </button>
                  </div>

                  {canvasSignature && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Your Signature:
                      </p>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
                        <img
                          src={canvasSignature || "/placeholder.svg"}
                          alt="Your signature"
                          className="max-h-[60px]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fetch and Show IP address */}
            <IpAddress />

            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 px-6 rounded-lg hover:from-gray-800 hover:to-black flex items-center justify-center font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={isConfirming}
              >
                <CheckCircle size={18} className="mr-2" />
                {isConfirming ? "Signing..." : "Sign Agreement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
