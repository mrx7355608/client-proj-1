import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Eye, EyeOff, Shield, LockKeyhole } from 'lucide-react';
import { getUserPermissions, updateUserPermissions, PagePermission } from '../lib/permissions';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  company: string | null;
  phone: string | null;
  is_admin: boolean;
  status: 'active' | 'suspended';
}

export default function UserSettingsManagement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    if (!id) return;

    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          first_name,
          last_name,
          company,
          phone,
          is_admin,
          status
        `)
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Get user email from auth.users
      const { data: userData } = await supabase.rpc('get_users');
      const userEmail = userData?.find(u => u.id === id)?.email || '';

      setUser({
        ...profile,
        email: userEmail
      });

      // Fetch user permissions
      const userPermissions = await getUserPermissions(id);
      setPermissions(userPermissions);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (pageIndex: number, access: boolean) => {
    const newPermissions = [...permissions];
    newPermissions[pageIndex].page_access = access;
    setPermissions(newPermissions);
  };

  const handleElementPermissionChange = (pageIndex: number, featureId: string, enabled: boolean) => {
    const newPermissions = [...permissions];
    const feature = newPermissions[pageIndex].features.find(f => f.id === featureId);
    if (feature) {
      feature.enabled = enabled;
    }
    setPermissions(newPermissions);
  };

  const handleSave = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      // Convert permissions to the format expected by the database
      const permissionsData = permissions.reduce((acc, page) => {
        acc[page.page_name] = {
          access: page.page_access,
          features: page.features.reduce((feats, feat) => {
            feats[feat.name] = feat.enabled;
            return feats;
          }, {} as Record<string, boolean>)
        };
        return acc;
      }, {} as Record<string, any>);

      await updateUserPermissions(id, permissionsData);
      alert('Permissions saved successfully');
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Error saving permissions');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/users')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">User Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-base text-gray-900">
                  {user.is_admin ? 'Administrator' : 'Employee'}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Company</p>
              <p className="text-base text-gray-900">{user.company || 'Not set'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Phone</p>
              <p className="text-base text-gray-900">{user.phone || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800">Security Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={user.is_admin}
                  onChange={() => {}} // This should be handled by admin controls
                  disabled
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Administrator Access</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Administrators have full access to all features and settings
              </p>
            </div>

            <div>
              <button
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <LockKeyhole className="w-4 h-4 mr-1" />
                Reset Password
              </button>
            </div>
          </div>
        </div>

        {/* Page Permissions */}
        <div className="bg-white rounded-lg shadow-md p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Page & Feature Access</h2>
          
          <div className="space-y-6">
            {permissions.map((page, pageIndex) => (
              <div key={page.page_name} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={page.page_access}
                        onChange={(e) => handlePermissionChange(pageIndex, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="ml-3 text-sm font-medium text-gray-900">{page.page_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {page.page_access ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Has Access</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>No Access</span>
                      </>
                    )}
                  </div>
                </div>

                {page.features && page.page_access && (
                  <div className="ml-14 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {page.features.map((feature) => (
                      <label key={feature.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={feature.enabled}
                          onChange={(e) => handleElementPermissionChange(pageIndex, feature.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{feature.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}