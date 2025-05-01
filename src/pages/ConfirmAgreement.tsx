import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ConfirmAgreementForm from "../components/ConfirmAgreementForm";
import { AlertTriangle } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function ConfirmAgreement() {
  const { id } = useParams();
  const [quote, setQuote] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const loc = useLocation();
  const searchParams = new URLSearchParams(loc.search);

  useEffect(() => {
    const pdfname = searchParams.get("pdf");
    if (!pdfname) return;

    fetchPdfFile(pdfname);
  }, []);

  useEffect(() => {
    getQuote()
      .then((quote) => setQuote(quote))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const getQuote = async () => {
    // Get quote
    const { data, error } = await supabase
      .from("quotes")
      .select()
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Agreement not found");

    // Get quote variables
    const { data: data2, error: error2 } = await supabase
      .from("quote_variables")
      .select()
      .eq("quote_id", id);

    if (error2) throw error;
    if (!data2) throw new Error("Agreement not found");

    return { ...data, variables: data2 };
  };

  const fetchPdfFile = async (pdfname: string) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(`unsigned-agreements/${pdfname}`);
    if (error) return;

    const file = new File([data], pdfname, { type: "application/pdf" });
    setPdfFile(file);
  };

  const manipulateFile = async (signImageUrl: string) => {
    if (!pdfFile) return;

    const pdfBuffer = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBuffer);
    const totalPages = pdf.getPages();
    const page = totalPages[totalPages.length - 1];

    // Get signature image
    const signatureImageBuffer = await fetch(signImageUrl).then((res) =>
      res.arrayBuffer(),
    );
    const signatureImage = await pdf.embedPng(signatureImageBuffer);

    // Get client name
    const clientName = quote.variables.filter(
      (f) => f.name === "client_name",
    )[0].value;

    // Draw on pdf
    page.drawText(clientName, { x: 55, y: 740, size: 13 });
    page.drawText(quote.title, { x: 55, y: 665, size: 13 });
    page.drawText(`${new Date().toLocaleDateString()}`, {
      x: 55,
      y: 592,
      size: 13,
    });
    page.drawImage(signatureImage, {
      x: 80,
      y: 500,
      width: 400,
      height: 60,
    });

    const pdfBytes = await pdf.save();
    const pdfName = `Signed-${searchParams.get("pdf")}`;
    const file = new File([pdfBytes], pdfName, { type: "application/pdf" });
    return { file, pdfname: pdfName };
  };

  // Show loading state
  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  // Show error message
  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  // Show error if quote has already been signed
  if (quote.status === "signed") {
    return (
      <div className="flex min-h-screen items-center gap-2 justify-center">
        <AlertTriangle size={35} color="red" />
        <p className="font-bold text-2xl text-red-600 text-center">
          Quote has already been signed!
        </p>
      </div>
    );
  }

  return (
    <div>
      <ConfirmAgreementForm manipulatePDF={manipulateFile} quote={quote} />
    </div>
  );
}
