import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ConfirmAgreementForm from "../components/ConfirmAgreementForm";

export default function ConfirmAgreement() {
  const { id } = useParams();
  const [quote, setQuote] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  // Show loading state
  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  // Show error message
  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div>
      <ConfirmAgreementForm quote={quote} />
    </div>
  );
}
