import { Document, Page, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 0 },
  image: { width: "100%" },
});

const AgreementPDF = ({ sectionImages }: { sectionImages: string[] }) => (
  <Document>
    {sectionImages.map((imgSrc, idx) => (
      <Page key={idx} size="A4" style={styles.page}>
        <Image src={imgSrc} style={styles.image} />
      </Page>
    ))}
  </Document>
);

export default AgreementPDF;
