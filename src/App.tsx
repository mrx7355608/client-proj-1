import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Quote,
  Settings as SettingsIcon,
  LogOut,
  DollarSign,
  Handshake,
  UserCircle,
  UserCog,
  Package,
  FolderOpen,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import GlobalExpenses from "./pages/GlobalExpenses";
import Partners from "./pages/Partners";
import PartnerDetails from "./pages/PartnerDetails";
import UserSettings from "./pages/UserSettings";
import UsersManagement from "./pages/UsersManagement";
import UserSettingsManagement from "./pages/UserSettingsManagement";
import Inventory from "./pages/Inventory";
import SiteDetails from "./pages/SiteDetails";
import ProposalsDashboard from "./pages/proposals/ProposalsDashboard";
import ProposalsList from "./pages/proposals/ProposalsList";
import ProposalSettings from "./pages/proposals/ProposalSettings";
import NewProposal from "./pages/proposals/NewProposal";
import Auth from "./components/Auth";
import ConfirmAgreement from "./pages/ConfirmAgreement";
import RequestSignature from "./pages/RequestSignature";

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
}

function App() {
  const [session, setSession] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, is_admin")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return "Set up profile";
  };

  // Check if we're on the confirm agreement page
  const isConfirmAgreementPage =
    window.location.pathname.startsWith("/confirm-agreement");
  if (isConfirmAgreementPage) {
    return (
      <Router>
        <Routes>
          <Route path="/confirm-agreement/:id" element={<ConfirmAgreement />} />
        </Routes>
      </Router>
    );
  }

  if (!session) {
    return <Auth />;
  }

  // Check if we're on the new proposal page
  const isNewProposalPage = window.location.pathname === "/proposals/new";
  if (isNewProposalPage) {
    return (
      <Router>
        <Routes>
          <Route path="/proposals/new" element={<NewProposal />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        {userProfile && (
          <nav className="w-48 bg-white shadow-lg flex flex-col h-screen fixed z-30">
            <div className="p-4">
              <h1 className="text-xl font-bold text-gray-800">
                Client Manager
              </h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavLink
                to="/"
                icon={<LayoutDashboard size={18} />}
                text="Dashboard"
              />
              <NavLink
                to="/clients"
                icon={<Users size={18} />}
                text="Clients"
              />
              <NavLink
                to="/partners"
                icon={<Handshake size={18} />}
                text="Partners"
              />
              <NavLink
                to="/proposals"
                icon={<Quote size={18} />}
                text="Proposals"
              />
              <NavLink
                to="/inventory"
                icon={<Package size={18} />}
                text="Inventory"
              />
              <NavLink
                to="/documents"
                icon={<FolderOpen size={18} />}
                text="Documents"
              />
              <NavLink
                to="/expenses"
                icon={<DollarSign size={18} />}
                text="Global Expenses"
              />
              {userProfile?.is_admin && (
                <NavLink
                  to="/users"
                  icon={<UserCog size={18} />}
                  text="Users"
                />
              )}
              <NavLink
                to="/settings"
                icon={<SettingsIcon size={18} />}
                text="Settings"
              />
            </div>

            {/* User Profile and Sign Out - Fixed at bottom */}
            <div className="border-t border-gray-100 mt-auto">
              <Link
                to="/user-settings"
                className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                <span className="mr-3">
                  <UserCircle size={18} />
                </span>
                <div className="flex-1 truncate">
                  <span className="block font-medium">{getDisplayName()}</span>
                  <span className="block text-xs text-gray-500">
                    View Profile
                  </span>
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
              >
                <span className="mr-3">
                  <LogOut size={18} />
                </span>
                Sign Out
              </button>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="flex-1 ml-48 p-6 relative z-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/partners/:id" element={<PartnerDetails />} />
            <Route path="/proposals" element={<ProposalsDashboard />} />
            <Route path="/proposals/list" element={<ProposalsList />} />
            <Route path="/proposals/settings" element={<ProposalSettings />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/sites/:id" element={<SiteDetails />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/expenses" element={<GlobalExpenses />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/confirm-agreement" element={<ConfirmAgreement />} />
            <Route
              path="/request-signature/:agreementId"
              element={<RequestSignature />}
            />
            <Route path="/user-settings" element={<UserSettings />} />
            {userProfile?.is_admin && (
              <>
                <Route path="/users" element={<UsersManagement />} />
                <Route
                  path="/users/:id/settings"
                  element={<UserSettingsManagement />}
                />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavLink({
  to,
  icon,
  text,
}: {
  to: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
    >
      <span className="mr-3">{icon}</span>
      {text}
    </Link>
  );
}

export default App;
