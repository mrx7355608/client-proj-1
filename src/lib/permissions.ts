import { supabase } from './supabase';

export interface PagePermission {
  page_name: string;
  page_access: boolean;
  features: {
    id: string;
    name: string;
    enabled: boolean;
  }[];
}

export async function getUserPermissions(userId: string): Promise<PagePermission[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: userId
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}

export async function updateUserPermissions(userId: string, permissions: Record<string, any>) {
  try {
    const { error } = await supabase.rpc('update_user_permissions', {
      p_user_id: userId,
      p_permissions: permissions
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user permissions:', error);
    throw error;
  }
}

export function hasPageAccess(permissions: PagePermission[], pageName: string): boolean {
  const pagePermission = permissions.find(p => p.page_name === pageName);
  return pagePermission?.page_access ?? false;
}

export function hasFeatureAccess(permissions: PagePermission[], pageName: string, featureName: string): boolean {
  const pagePermission = permissions.find(p => p.page_name === pageName);
  if (!pagePermission?.page_access) return false;
  
  const feature = pagePermission.features.find(f => f.name === featureName);
  return feature?.enabled ?? false;
}