import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { Quote } from "../lib/types";
import { getProposal } from "../lib/data/proposals.data";
import ProposalsProvider from "../contexts/proposals";

export default function EditProposal() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchQuote = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProposal(id);
        setQuote(data);
      } catch (error) {
        setError("Unable to fetch proposal");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!quote) return <div>Proposal not found</div>;

  return (
    <ProposalsProvider goToSelectionScreen={() => {}}>
      <pre>{JSON.stringify(quote, null, 4)}</pre>
    </ProposalsProvider>
  );
}
