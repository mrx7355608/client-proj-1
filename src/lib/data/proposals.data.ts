import { supabase } from "../supabase";
import { QuoteInput, QuoteItemInput, QuoteVariableInput } from "../types";

const updateQuote = async (
  proposalId: string,
  quoteData: Partial<QuoteInput>,
  quoteVariables: QuoteVariableInput[],
  quoteItems: QuoteItemInput[],
) => {
  // Update existing quote
  const { data, error } = await supabase
    .from("quotes")
    .update(quoteData)
    .eq("id", proposalId)
    .select()
    .single();

  if (error) throw error;

  // Update Quote variables
  // Delete existing quote variables
  await supabase.from("quote_variables").delete().eq("quote_id", proposalId);

  // Insert new variables
  const { error: variablesError } = await supabase
    .from("quote_variables")
    .insert(
      quoteVariables.map((v) => ({
        quote_id: data.id,
        name: v.name,
        value: v.value,
      })),
    );

  if (variablesError) throw variablesError;

  // Update quote items
  if (quoteItems.length > 0) {
    const { error: itemsError } = await supabase
      .from("quote_items")
      .update(quoteItems)
      .eq("quote_id", data.id);

    if (itemsError) throw itemsError;
  }

  return data;
};

const createQuote = async (
  quoteData: QuoteInput,
  quoteVariables: QuoteVariableInput[],
  quoteItems: QuoteItemInput[],
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
      quoteVariables.map((v) => ({
        quote_id: data.id,
        name: v.name,
        value: v.value,
      })),
    );

  if (variablesError) throw variablesError;

  // Insert quote items
  if (quoteItems.length > 0) {
    const { error: itemsError } = await supabase
      .from("quote_items")
      .insert(quoteItems.map((qi) => ({ ...qi, quote_id: data.id })));

    if (itemsError) throw itemsError;
  }

  return data;
};

export const saveProposal = async (
  proposalId: string | null,
  quote: QuoteInput,
  quoteVars: QuoteVariableInput[],
  quoteItems: QuoteItemInput[] = [],
) => {
  if (proposalId) {
    console.log("updating...");
    const updatedQuote = await updateQuote(
      proposalId,
      quote,
      quoteVars,
      quoteItems,
    );
    return updatedQuote;
  }

  console.log("creating...");
  const newQuote = await createQuote(quote, quoteVars, quoteItems);
  return newQuote;
};

export const getProposal = async (id: string) => {
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select()
    .eq("id", id)
    .single();

  if (quoteError) throw quoteError;

  const { data: quoteVars, error: quoteVarsError } = await supabase
    .from("quote_variables")
    .select()
    .eq("quote_id", id);

  if (quoteVarsError) throw quoteVarsError;

  const { data: quoteItems, error: quoteItemsError } = await supabase
    .from("quote_items")
    .select()
    .eq("quote_id", id);

  if (quoteItemsError) throw quoteItemsError;

  return { ...quote, variables: quoteVars || [], items: quoteItems || [] };
};
