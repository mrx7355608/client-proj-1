import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Plus,
  Search,
  Filter,
  Shield,
  Mail,
  Phone,
  Building2,
  AlertCircle,
  Pencil,
  Lock,
  Ban,
  CheckCircle,
  X,
  User,
  Settings,
  UserCog,
} from "lucide-react";
import UserEditModal from "../components/UserEditModal";
import PasswordResetModal from "../components/PasswordResetModal";

interface User {
  id: string;
  email: string;
  created_at: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    company: string | null;
    phone: string | null;
    is_admin: boolean;
    status: "active" | "suspended";
    password_reset_required: boolean;
  } | null;
}

interface NewUserForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  role: "admin" | "employee";
  password: string;
}

export default function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<NewUserForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    role: "employee",
    password: "",
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] =
    useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended"
  >("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "employee">(
    "all",
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);

      const { data: authUsers, error: authError } =
        await supabase.rpc("get_users");

      if (authError) throw authError;

      const { data: profiles, error: profileError } = await supabase
        .from("user_profiles")
        .select("*");

      if (profileError) throw profileError;

      const combinedUsers = authUsers.map((user) => ({
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        profile: profiles?.find((p) => p.id === user.id) || null,
      }));

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Get current admin session
      const { data: currentSession } = await supabase.auth.getSession();

      /**
       * The signUp() function creates a new user but it auto logs in the
       * user, and logs out the admin account
       * So to prevent this, I fetched the admin session before making
       * signUp() request and manually set the admin session after
       * the signup() request completes.
       */
      const { data: signupData, error: signupError } =
        await supabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });
      if (signupError) {
        throw signupError;
      }

      if (signupData.user === null) {
        throw new Error("Unable to create user");
      }

      // Manually set admin session
      await supabase.auth.setSession(currentSession.session!);

      // Call a custom postgresql function in supabase to create
      // a new user entry.
      const { data: newUser, error: inviteError } = await supabase.rpc(
        "new_invite_user",
        {
          new_user_id: signupData.user.id,
          user_email: formData.email,
          admin_status: formData.role === "admin",
          user_status: "active",
          reset_required: false,
          user_first_name: formData.first_name,
          user_last_name: formData.last_name,
          user_company: formData.company,
          user_phone: formData.phone,
          user_password: formData.password,
        },
      );

      if (inviteError) throw inviteError;

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company: "",
        role: "employee",
        password: "",
      });
      setIsFormOpen(false);
      fetchUsers();
      alert("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Failed to add user. Please try again.");
    }
  };

  const handlePasswordReset = (user: User) => {
    setSelectedUserForPassword(user);
    setIsPasswordModalOpen(true);
  };

  const toggleUserStatus = async (
    userId: string,
    currentStatus: "active" | "suspended",
  ) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status. Please try again.");
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    )
      return;

    try {
      const { error } = await supabase.rpc("delete_user", { user_id: userId });

      if (error) throw error;

      setUsers(users.filter((user) => user.id !== userId));
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.profile?.first_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ) ||
      (user.profile?.last_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.profile?.company?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      );

    const matchesStatus =
      statusFilter === "all" || user.profile?.status === statusFilter;
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && user.profile?.is_admin) ||
      (roleFilter === "employee" && !user.profile?.is_admin);

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage users and their permissions
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "suspended")
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as "all" | "admin" | "employee")
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="employee">Employees</option>
          </select>

          {(searchQuery || statusFilter !== "all" || roleFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setRoleFilter("all");
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Add User Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Add New User
            </h2>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: formatPhoneNumber(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 555-5555"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "employee",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="employee">Employee</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Must be at least 6 characters long. The user can change this
                password after logging in.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {user.profile?.first_name?.[0] ||
                            user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.profile?.first_name && user.profile?.last_name
                            ? `${user.profile.first_name} ${user.profile.last_name}`
                            : "Not set"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.profile?.company && (
                        <div className="flex items-center gap-1 mb-1">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {user.profile.company}
                        </div>
                      )}
                      {user.profile?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {formatPhoneNumber(user.profile.phone)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-2">
                      <div
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium ${
                          user.profile?.is_admin
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {user.profile?.is_admin ? (
                          <Shield className="w-4 h-4 mr-1.5" />
                        ) : (
                          <User className="w-4 h-4 mr-1.5" />
                        )}
                        {user.profile?.is_admin ? "Admin" : "Employee"}
                      </div>

                      <div
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium ${
                          user.profile?.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.profile?.status === "suspended" ? (
                          <>
                            <Ban className="w-4 h-4 mr-1.5" />
                            Suspended
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Active
                          </>
                        )}
                      </div>

                      {user.profile?.password_reset_required && (
                        <div className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <Lock className="w-4 h-4 mr-1.5" />
                          Password Reset Required
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => navigate(`/users/${user.id}/settings`)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Manage Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Profile"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePasswordReset(user)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Reset Password"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        toggleUserStatus(
                          user.id,
                          user.profile?.status || "active",
                        )
                      }
                      className={
                        user.profile?.status === "suspended"
                          ? "text-green-600 hover:text-green-900"
                          : "text-red-600 hover:text-red-900"
                      }
                      title={
                        user.profile?.status === "suspended"
                          ? "Activate User"
                          : "Suspend User"
                      }
                    >
                      {user.profile?.status === "suspended" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete User"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSaved={fetchUsers}
        user={selectedUser}
      />

      {selectedUserForPassword && (
        <PasswordResetModal
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setSelectedUserForPassword(null);
          }}
          onSuccess={fetchUsers}
          userId={selectedUserForPassword.id}
          userEmail={selectedUserForPassword.email}
        />
      )}
    </div>
  );
}
