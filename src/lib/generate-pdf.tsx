import MyProposalPdf from "../components/preview-pdf/AgreementPDF";
import { supabase } from "./supabase";
import { pdf } from "@react-pdf/renderer";
import { Fee, Section } from "./types";

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

export const generatePDF = async (
  filename: string,
  info: any,
  cinfo: any,
  proposalId: string,
  sections: Section[],
  fees: { nrc: Fee[]; mrc: string },
) => {
  const pdfBlob = await pdf(
    <MyProposalPdf
      proposalTypeInfo={info}
      clientInfo={cinfo}
      proposalId={proposalId}
      pdfFilename={filename}
      fees={fees}
      sections={sections}
    />,
  ).toBlob();

  // Update pdfname in quotes table
  const { error } = await supabase
    .from("quotes")
    .update({ agreement_name: filename })
    .eq("id", proposalId);
  if (error) return alert("There was an error while generating pdf");

  const p = await uploadToSupabase(pdfBlob, filename);
  return p.path;
};
