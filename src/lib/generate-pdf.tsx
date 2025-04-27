import MyProposalPdf from "../components/preview-pdf/AgreementPDF";
import { supabase } from "./supabase";
import { pdf } from "@react-pdf/renderer";

const uploadToSupabase = async (pdfBlob: Blob, filename: string) => {
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(`unsigned-agreements/${filename}`, pdfBlob, {
      cacheControl: "3600",
      upsert: true,
      contentType: "application/pdf",
    });

  if (error) throw new Error("Failed to upload PDF: " + error.message);
  return data;
};

export const generatePDF = async (filename: string, info: any, cinfo: any) => {
  const pdfBlob = await pdf(
    <MyProposalPdf proposalTypeInfo={info} clientInfo={cinfo} />,
  ).toBlob();
  const p = await uploadToSupabase(pdfBlob, filename);
  return p.path;
};
