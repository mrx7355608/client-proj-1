"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  X,
  Send,
  FileIcon,
  Mail,
  MessageSquare,
  Copy,
  Users,
} from "lucide-react";
import { sendSimpleMessage } from "../lib/send-email";
import { supabase } from "../lib/supabase";
import { useLocation } from "react-router-dom";

export default function RequestSignatureForm({
  agreementId,
}: {
  agreementId: string;
}) {
  const [formData, setFormData] = useState({
    clientEmail: "",
    subject: "",
    message: "",
    agreementPDF: null,
  });

  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filename, setFilename] = useState("");
  const loc = useLocation();
  const searchParams = new URLSearchParams(loc.search);

  useEffect(() => {
    const fname = searchParams.get("name");
    setFilename(fname || "Untitled");
  }, []);

  const retrievePdf = async () => {
    const pdflink = searchParams.get("pdf");
    const filename = searchParams.get("name");
    if (!pdflink) return;

    const { data, error } = await supabase.storage
      .from("documents")
      .download(pdflink);

    if (error) console.log(error);
    if (!data) return;

    const file = new File([data], filename || "Untitled", {
      type: "application/pdf",
    });
    return file;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientEmail || !formData.subject || !formData.message) {
      setError("Please fill the form properly");
      return;
    }

    try {
      setError("");
      setIsSending(true);
      await sendSimpleMessage({
        cc: ccEmails,
        bcc: bccEmails,
        to: formData.clientEmail,
        message: formData.message,
        subject: formData.subject,
        agreementPdf: await retrievePdf(),
      });
      setMessage("Email sent successfully!");

      // Update the proposal status to "Sent"
      const { data, error } = await supabase
        .from("quotes")
        .update({ status: "sent" })
        .eq("id", agreementId)
        .select()
        .single();

      if (error) throw error;

      console.log(data);
    } catch (err) {
      setError((err as Error).message || "Unable to send email");
    } finally {
      setIsSending(false);
      setTimeout(() => setError(""), 5000);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center">
        <MessageSquare className="mr-2 text-gray-700" size={24} />
        <span>Request Signature</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 my-3">{error}</p>}
        {message && <p className="text-green-500 my-3">{message}</p>}

        {/* Client email & File upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
              placeholder="Client Email"
              required
            />
          </div>
          <div className="relative">
            <div className="w-full h-[52px] pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FileIcon size={18} />
              </div>
              <div className="truncate text-gray-700 flex-1">{filename}</div>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <MessageSquare size={18} />
          </div>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
            placeholder="Subject"
            required
          />
        </div>

        {/* CC & BCC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Copy size={16} className="mr-2 text-gray-500" />
              <span>CC</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-transparent transition-all duration-200 min-h-[56px]">
              {ccEmails.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full"
                >
                  <span className="text-sm text-gray-700">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeEmail(index, "cc")}
                    className="ml-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                onKeyDown={(e) => handleEmailKeyDown(e, "cc")}
                className="flex-grow min-w-[120px] outline-none text-sm p-1.5"
                placeholder="Add email and press Enter"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Users size={16} className="mr-2 text-gray-500" />
              <span>BCC</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-transparent transition-all duration-200 min-h-[56px]">
              {bccEmails.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full"
                >
                  <span className="text-sm text-gray-700">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeEmail(index, "bcc")}
                    className="ml-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={bccInput}
                onChange={(e) => setBccInput(e.target.value)}
                onKeyDown={(e) => handleEmailKeyDown(e, "bcc")}
                className="flex-grow min-w-[120px] outline-none text-sm p-1.5"
                placeholder="Add email and press Enter"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 -mt-4 ml-1">
          Press Enter or comma to add multiple emails
        </p>

        {/* Message */}
        <div>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
            placeholder="Write your message here..."
            required
          ></textarea>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 px-6 rounded-lg hover:from-gray-800 hover:to-black flex items-center justify-center font-medium transition-all duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            disabled={isSending}
          >
            <Send size={18} className="mr-2" />
            {isSending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEmailKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "cc" | "bcc",
  ) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = type === "cc" ? ccInput.trim() : bccInput.trim();

      if (value && isValidEmail(value)) {
        if (type === "cc") {
          setCcEmails((prev) => [...prev, value]);
          setCcInput("");
        } else {
          setBccEmails((prev) => [...prev, value]);
          setBccInput("");
        }
      }
    }
  }

  function removeEmail(index: number, type: "cc" | "bcc") {
    if (type === "cc") {
      setCcEmails((prev) => prev.filter((_, i) => i !== index));
    } else {
      setBccEmails((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
