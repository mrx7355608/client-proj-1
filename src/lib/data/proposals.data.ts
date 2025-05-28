import { supabase } from "../supabase";
import {
  FeeInput,
  QuoteInput,
  QuoteItemInput,
  QuoteVariableInput,
} from "../types";

export const updateQuote = async (
  proposalId: string,
  quoteData: QuoteInput,
  quoteVariables: QuoteVariableInput[],
  quoteItems: QuoteItemInput[],
  quoteFees: FeeInput[],
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
      .upsert(quoteItems, { onConflict: "id" });

    if (itemsError) throw itemsError;
  }

  if (quoteFees.length > 0) {
    // Update quote fees
    // Delete exisiting
    await supabase.from("quote_fees").delete().eq("quote_id", proposalId);

    // Insert new quote fees
    const { error: quoteError } = await supabase.from("quote_fees").insert(
      quoteFees.map((q) => ({
        ...q,
        amount: q.amount.toString(),
        quote_id: data.id,
      })),
    );
    if (quoteError) throw quoteError;
  }

  return data;
};

const createQuote = async (
  quoteData: QuoteInput,
  quoteVariables: QuoteVariableInput[],
  quoteItems: QuoteItemInput[],
  quoteFees: FeeInput[],
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

  // Insert quote fees
  if (quoteFees && quoteFees.length > 0) {
    const { error: quoteError } = await supabase
      .from("quote_fees")
      .insert(quoteFees.map((q) => ({ ...q, quote_id: data.id })));
    if (quoteError) throw quoteError;
  }

  return data;
};

export const saveProposal = async (
  proposalId: string | null,
  quote: QuoteInput,
  quoteVars: QuoteVariableInput[],
  quoteItems: QuoteItemInput[] = [],
  quoteFees: FeeInput[],
) => {
  if (proposalId) {
    console.log("updating...");
    const updatedQuote = await updateQuote(
      proposalId,
      quote,
      quoteVars,
      quoteItems,
      quoteFees,
    );
    return updatedQuote;
  }

  console.log("creating...");
  const newQuote = await createQuote(quote, quoteVars, quoteItems, quoteFees);
  return newQuote;
};

export const getProposal = async (id: string) => {
  // Get quotes
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select()
    .eq("id", id)
    .single();
  if (quoteError) throw quoteError;

  // Get Quote variables
  const { data: quoteVars, error: quoteVarsError } = await supabase
    .from("quote_variables")
    .select()
    .eq("quote_id", id);
  if (quoteVarsError) throw quoteVarsError;

  // Get quote items
  const { data: quoteItems, error: quoteItemsError } = await supabase
    .from("quote_items")
    .select()
    .eq("quote_id", id);
  if (quoteItemsError) throw quoteItemsError;

  // Get quote fees
  const { data: quoteFees, error: quoteFeesError } = await supabase
    .from("quote_fees")
    .select()
    .eq("quote_id", quote.id);
  if (quoteFeesError) throw quoteFeesError;

  return {
    ...quote,
    variables: quoteVars || [],
    items: quoteItems || [],
    fees: quoteFees,
  };
};
