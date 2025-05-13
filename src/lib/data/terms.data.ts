import { supabase } from "../supabase";

export interface TermSection {
  id: string;
  title: string;
  content: string;
}

export interface TermsOfServiceInput {
  title: string;
  description: string;
  proposal_type: string;
}

export interface TermsOfService extends TermsOfServiceInput {
  id: string;
}

export async function getTermsOfService(): Promise<TermsOfService[]> {
  const { data, error } = await supabase
    .from("terms_of_services")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch terms of service");
  }

  return data || [];
}

export async function getTermsOfServiceById(id: string): Promise<TermsOfService | null> {
  const { data, error } = await supabase
    .from("terms_of_services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Failed to fetch terms of service");
  }

  return data;
}

export async function createTermsOfService(terms: TermsOfServiceInput[]) {
  const { data, error } = await supabase
    .from("terms_of_services")
    .insert(terms)
    .select()

  if (error) {
    throw new Error("Failed to create terms of service");
  }

  return data;
}

export async function updateTermsOfService(
  id: string,
  terms: Partial<Omit<TermsOfService, "id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("terms_of_services")
    .update({
      name: terms.name,
      description: terms.description,
      sections: terms.sections,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update terms of service");
  }

  return data;
}

export async function deleteTermsOfService(id: string) {
  const { error } = await supabase.from("terms_of_services").delete().eq("id", id);

  if (error) {
    throw new Error("Failed to delete terms of service");
  }
} 