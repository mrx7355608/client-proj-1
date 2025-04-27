import { toPng } from "html-to-image";
import { pdf } from "@react-pdf/renderer";
import AgreementPDF from "../components/AgreementPDF";
import { supabase } from "./supabase";

const generateImages = async () => {
  const images = [];
  const sectionIds = [
    "section-1",
    "section-2",
    "section-3",
    "section-4",
    "section-5",
    "section-6",
    "section-7",
    "section-8",
  ];

  for (const id of sectionIds) {
    const element = document.getElementById(id);
    if (!element) continue;

    if (element.offsetHeight === 0) {
      console.warn(`Skipping empty element: ${id}`);
      continue;
    }

    const dataUrl = await toPng(element, { quality: 1, pixelRatio: 1.7 });
    images.push(dataUrl);
  }

  return images;
};

export const generatePDF = async (filename: string) => {
  const images = await generateImages();
  const pdfBlob = await pdf(<AgreementPDF sectionImages={images} />).toBlob();
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(`unsigned-agreements/${filename}`, pdfBlob, {
      cacheControl: "3600",
      upsert: true,
      contentType: "application/pdf",
    });

  if (error) throw new Error("Failed to upload PDF: " + error.message);

  return data.path;
};
