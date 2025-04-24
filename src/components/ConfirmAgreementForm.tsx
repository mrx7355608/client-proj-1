import type React from "react";
import { useEffect, useState } from "react";
import {
  Building2,
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ConfirmAgreementForm({ quote }: { quote: any }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    title: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    if (!quote) return;

    const vars = quote.variables;
    const clientName = vars.filter((v) => v.name === "client_name")[0].value;
    const clientEmail = vars.filter((v) => v.name === "client_email")[0].value;
    const clientPhone = vars.filter((v) => v.name === "client_phone")[0].value;
    const clientTitle = vars.filter((v) => v.name === "client_title")[0].value;
    const organization = vars.filter((v) => v.name === "organization")[0].value;
    const address = vars.filter((v) => v.name === "address")[0].value;

    setFormData({
      businessName: organization,
      contactName: clientName,
      title: clientTitle,
      email: clientEmail,
      phone: clientPhone,
      streetAddress: address,
      city: "",
      state: "",
      zipCode: "",
    });
  }, [quote]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirming(true);

    try {
      // Update proposal status to "signed"
      const { data, error } = await supabase
        .from("quotes")
        .update({ status: "signed" })
        .eq("id", quote.id)
        .select()
        .single();

      if (error) throw error;
      if (data.status === "signed")
        throw new Error("You have already signed this proposal");

      // Send email to the owner about confirmation of the agreement
      alert("Proposal has been confirmed!");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 flex items-center flex-col min-h-screen justify-center">
      <h2 className="text-2xl font-bold mb-12 text-gray-800 flex items-center">
        <CheckCircle className="mr-2 text-gray-700" size={24} />
        <span>Confirm Agreement</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Building2 size={18} />
            </div>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
              placeholder="Business Name"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User size={18} />
            </div>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
              placeholder="Contact Name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Briefcase size={18} />
            </div>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
              placeholder="Title"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
              placeholder="Email"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
              placeholder="Phone"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <MapPin size={18} />
            </div>
            <input
              type="text"
              id="streetAddress"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
              placeholder="Street Address"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
              placeholder="City"
              required
            />
          </div>

          <div className="relative">
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
              placeholder="State/Province"
              required
            />
          </div>

          <div className="relative col-span-2 md:col-span-1">
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
              placeholder="Zip/Postal Code"
              required
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 px-6 rounded-lg hover:from-gray-800 hover:to-black flex items-center justify-center font-medium transition-all duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            disabled={isConfirming}
          >
            <CheckCircle size={18} className="mr-2" />
            {isConfirming ? "Confirming..." : "Confirm Agreement"}
          </button>
        </div>
      </form>
    </div>
  );
}
