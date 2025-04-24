import { useParams } from "react-router-dom";
import RequestSignatureForm from "../components/RequestSignatureForm";

export default function RequestSignature() {
  const { agreementId } = useParams();

  return (
    <div>
      <RequestSignatureForm agreementId={agreementId} />
    </div>
  );
}
