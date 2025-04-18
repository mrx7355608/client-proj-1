import React, { useState } from "react";
import { Save } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface ClientForm {
  name: string;
  title: string;
  email: string;
  phone: string;
  organization: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface ClientInfoStepProps {
  proposalType: string;
  initialData: ClientForm;
  onSubmit: (data: ClientForm) => void;
  proposalId: string | null;
}

export default function ClientInfoStep({
  proposalType,
  initialData,
  onSubmit,
  proposalId,
}: ClientInfoStepProps) {
  const [formData, setFormData] = useState<ClientForm>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      let formatted = cleaned;
      if (cleaned.length > 3) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      }
      if (cleaned.length > 6) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      return formatted;
    }
    return value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAutofill = () => {
    setFormData({
      name: "John Smith",
      title: "IT Director",
      email: "john.smith@example.com",
      phone: "(407) 555-1234",
      organization: "ITX Demo",
      streetAddress: "123 Business Ave",
      city: "Orlando",
      state: "FL",
      zipCode: "32801",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Generate quote number
      const { data: quoteNumber } = await supabase.rpc("generate_quote_number");

      // Create or update the quote record
      const quoteData = {
        title: `UNM Agreement - ${formData.organization}`,
        quote_number: quoteNumber,
        status: "draft",
        notes: `Draft proposal for ${formData.organization}`,
      };

      let quote;
      if (proposalId) {
        // Update existing quote
        const { data, error } = await supabase
          .from("quotes")
          .update(quoteData)
          .eq("id", proposalId)
          .select()
          .single();

        if (error) throw error;
        quote = data;
      } else {
        // Create new quote
        const { data, error } = await supabase
          .from("quotes")
          .insert([quoteData])
          .select()
          .single();

        if (error) throw error;
        quote = data;
      }

      // Create or update quote variables
      const variables = [
        { name: "customer_name", value: formData.name },
        { name: "customer_title", value: formData.title },
        { name: "customer_email", value: formData.email },
        { name: "customer_phone", value: formData.phone },
        { name: "client", value: formData.organization },
        {
          name: "address",
          value: `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        },
      ];

      if (proposalId) {
        // Delete existing variables first
        await supabase
          .from("quote_variables")
          .delete()
          .eq("quote_id", proposalId);
      }

      // Insert new variables
      const { error: variablesError } = await supabase
        .from("quote_variables")
        .insert(
          variables.map((v) => ({
            quote_id: quote.id,
            name: v.name,
            value: v.value,
          })),
        );

      if (variablesError) throw variablesError;

      alert("Proposal saved as draft");
    } catch (error) {
      console.error("Error saving proposal:", error);
      alert("Error saving proposal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">
          {proposalType} - {formData.organization || "New Client"}
        </h2>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Client Information
          </h3>
          <p className="mt-2 text-gray-600">
            Enter the client details for your {proposalType} proposal
          </p>
        </div>
        <button
          onClick={handleAutofill}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
        >
          Autofill Demo Data
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="Enter job title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: formatPhoneNumber(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="(555) 555-5555"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client *
            </label>
            <input
              type="text"
              required
              value={formData.organization}
              onChange={(e) =>
                setFormData({ ...formData, organization: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="Enter client name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              required
              value={formData.streetAddress}
              onChange={(e) =>
                setFormData({ ...formData, streetAddress: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="Enter street address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="Enter state"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              required
              pattern="[0-9]{5}(-[0-9]{4})?"
              value={formData.zipCode}
              onChange={(e) =>
                setFormData({ ...formData, zipCode: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="Enter ZIP code"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
