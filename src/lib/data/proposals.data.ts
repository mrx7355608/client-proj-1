import { supabase } from "../supabase";
import { QuoteInput, QuoteVariableInput } from "../types";

const updateQuote = async (
  proposalId: string,
  quoteData: Partial<QuoteInput>,
  variables: QuoteVariableInput[],
) => {
  // Update existing quote
  const { data, error } = await supabase
    .from("quotes")
    .update(quoteData)
    .eq("id", proposalId)
    .select()
    .single();

  if (error) throw error;

  // Delete existing quote variables
  await supabase.from("quote_variables").delete().eq("quote_id", proposalId);

  // Insert new variables
  const { error: variablesError } = await supabase
    .from("quote_variables")
    .insert(
      variables.map((v) => ({
        quote_id: data.id,
        name: v.name,
        value: v.value,
      })),
    );

  if (variablesError) throw variablesError;

  return data;
};

const createQuote = async (
  quoteData: QuoteInput,
  variables: QuoteVariableInput[],
) => {
  // Generate quote number
  const { data: quoteNumber } = await supabase.rpc("generate_quote_number");

  // Create quote
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      ...quoteData,
      quote_number: quoteNumber,
    })
    .select()
    .single();

  if (error) throw error;

  // Insert quote variables
  const { error: variablesError } = await supabase
    .from("quote_variables")
    .insert(
      variables.map((v) => ({
        quote_id: data.id,
        name: v.name,
        value: v.value,
      })),
    );

  if (variablesError) throw variablesError;

  return data;
};

export const saveProposal = async (
  proposalId: string | null,
  quote: QuoteInput,
  quoteVars: QuoteVariableInput[],
) => {
  if (proposalId) {
    console.log("updating...");
    const updatedQuote = await updateQuote(proposalId, quote, quoteVars);
    return updatedQuote;
  }

  console.log("creating...");
  const newQuote = await createQuote(quote, quoteVars);
  return newQuote;
};
