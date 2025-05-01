import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Settings,
  List,
  Plus,
  DollarSign,
  Users,
  Clock,
  FileCheck,
} from "lucide-react";
import { format } from "date-fns";
import { QuoteVariable } from "../../lib/types";

interface ProposalStats {
  totalProposals: number;
  activeProposals: number;
  avgResponseTime: number;
  conversionRate: number;
  totalValue: number;
}

interface RecentProposal {
  id: string;
  title: string;
  status: string;
  client: {
    name: string;
    company_name: string | null;
  } | null;
  created_at: string;
  total_value: number;
}

export default function ProposalsDashboard() {
  const [stats, setStats] = useState<ProposalStats>({
    totalProposals: 0,
    activeProposals: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    totalValue: 0,
  });
  const [recentProposals, setRecentProposals] = useState<RecentProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch quotes data
      const { data: quotes, error: quotesError } = await supabase
        .from("quotes")
        .select(
          `
          id,
          title,
          status,
          created_at,
          total_mrr,
          total_nrc,
          client:clients (
            name,
            company_name
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (quotesError) throw quotesError;

      // Calculate stats
      const totalProposals = quotes?.length || 0;
      const activeProposals =
        quotes?.filter((q) => q.status === "sent" || q.status === "draft")
          .length || 0;
      const signedProposals =
        quotes?.filter((q) => q.status === "signed").length || 0;
      const conversionRate =
        totalProposals > 0 ? (signedProposals / totalProposals) * 100 : 0;

      // Calculate total value (MRR * 12 + NRC)
      const totalValue =
        quotes?.reduce((sum, quote) => {
          const annualMRR = (quote.total_mrr || 0) * 12;
          const nrc = quote.total_nrc || 0;
          return sum + annualMRR + nrc;
        }, 0) || 0;

      // Calculate average response time (mock for now)
      const avgResponseTime = 2.5; // This would normally be calculated from actual data

      setStats({
        totalProposals,
        activeProposals,
        avgResponseTime,
        conversionRate,
        totalValue,
      });

      // Set recent proposals
      setRecentProposals(
        (quotes || []).slice(0, 5).map((quote) => ({
          id: quote.id,
          title: quote.title,
          status: quote.status,
          client: quote.client,
          created_at: quote.created_at,
          total_value: (quote.total_mrr || 0) * 12 + (quote.total_nrc || 0),
        })),
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPdf = async (proposalId: string) => {
    const { data, error } = await supabase
      .from("quotes")
      .select()
      .eq("id", proposalId)
      .single();
    if (error) throw error;
    if (!data) throw new Error("Proposal not found");

    const filename = data.agreement_name;
    const { data: fileBlob, error: fileError } = await supabase.storage
      .from("documents")
      .download(`signed/${filename}`);
    if (!fileError) throw fileError;
    if (!fileBlob) throw new Error("Agreement file not found");

    const url = URL.createObjectURL(fileBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const showStatus = async () => {};

  const handleNewProposal = () => {
    window.open("/proposals/new", "_blank", "width=1200,height=800");
  };

  const handleConvertToClient = async (proposalId: string) => {
    try {
      setIsConverting(true);

      // Get quote
      const { data: quote, error: quoteErro } = await supabase
        .from("quotes")
        .select()
        .eq("id", proposalId)
        .single();

      if (quoteErro) throw quoteErro;
      if (!quote) throw new Error("No data found");

      // Get quote variables
      const { data: variables, error: variablesError } = await supabase
        .from("quote_variables")
        .select()
        .eq("quote_id", proposalId);

      if (variablesError) throw variablesError;
      if (!variables) throw new Error("No data found");

      const varObject = variables.reduce((acc, item: QuoteVariable) => {
        acc[item.name] = item.value;
        return acc;
      }, {});

      // Create new client
      const addressParts = varObject.address.split(", ");
      const address = addressParts[0];
      const city = addressParts[1];
      const [state, postalCode] = addressParts[2].split(" ");

      const clientData = {
        name: varObject.client_name,
        company_name: varObject.organization,
        mrr: quote.total_mrr,
        status: "active",
        street_address: address,
        city: city,
        state: state,
        postal_code: postalCode,
        start_date: new Date().toLocaleDateString(),
        client_type: quote.title.split(" ")[0].toLowerCase(),
      };
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert(clientData)
        .select()
        .single();

      if (clientError) throw clientError;
      if (!client) throw new Error("There was an error while creating client");

      // Update proposal status
      const { error: quoteUpdateError } = await supabase
        .from("quotes")
        .update({ status: "fulfilled", client_id: client.id })
        .eq("id", proposalId);

      if (quoteUpdateError) throw quoteUpdateError;

      alert("Client created successfully");
    } catch (err) {
      console.error(err);
      alert("Unable to convert to client");
    } finally {
      setIsConverting(false);
    }
  };

  const getClientDisplayName = (proposal: RecentProposal) => {
    if (!proposal.client) return "N/A";
    return proposal.client.company_name || proposal.client.name || "N/A";
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Proposals Dashboard</h1>
        <div className="flex gap-3">
          <Link
            to="/proposals/settings"
            className="bg-white text-gray-600 px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <Settings className="w-4 h-4 mr-1.5" />
            Settings
          </Link>
          <Link
            to="/proposals/list"
            className="bg-white text-gray-600 px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <List className="w-4 h-4 mr-1.5" />
            View All
          </Link>
          <button
            onClick={handleNewProposal}
            className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Proposal
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-full text-white mr-3">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Total Proposals
              </h3>
              <p className="text-lg font-bold text-gray-800">
                {stats.totalProposals}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-green-500 p-2 rounded-full text-white mr-3">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Value</h3>
              <p className="text-lg font-bold text-gray-800">
                ${stats.totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-purple-500 p-2 rounded-full text-white mr-3">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Avg. Response Time
              </h3>
              <p className="text-lg font-bold text-gray-800">
                {stats.avgResponseTime} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-2 rounded-full text-white mr-3">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Conversion Rate
              </h3>
              <p className="text-lg font-bold text-gray-800">
                {stats.conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Proposals */}
      <div className="bg-white rounded-lg shadow-md p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Proposals
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentProposals.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No proposals yet
                  </td>
                </tr>
              ) : (
                recentProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {proposal.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getClientDisplayName(proposal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(proposal.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          proposal.status === "signed"
                            ? "bg-green-100 text-green-800"
                            : proposal.status === "sent"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {proposal.status.charAt(0).toUpperCase() +
                          proposal.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${proposal.total_value.toLocaleString()}
                    </td>
                    <td className="flex items-center gap-2 px-6 py-4 whitespace-nowrap">
                      {proposal.status === "sent" && (
                        <button
                          onClick={showStatus}
                          className="border border-sky-500 text-sky-600 px-3 py-1 rounded-full hover:text-white hover:bg-sky-500"
                        >
                          Status
                        </button>
                      )}
                      {(proposal.status === "draft" ||
                        proposal.status === "sent") && (
                        <button
                          onClick={() => {
                            window.open(
                              `/proposals/edit/${proposal.id}`,
                              "_blank",
                              "width=1200,height=800",
                            );
                          }}
                          className="border border-sky-500 text-sky-600 px-3 py-1 rounded-full hover:text-white hover:bg-sky-500"
                        >
                          Edit
                        </button>
                      )}
                      {proposal.status === "signed" && (
                        <button
                          onClick={() => handleConvertToClient(proposal.id)}
                          className="border border-sky-500 text-sky-600 px-3 py-1 rounded-full hover:text-white hover:bg-sky-500"
                          disabled={isConverting}
                        >
                          {isConverting ? "Converting..." : "Convert to Client"}
                        </button>
                      )}
                      {proposal.status === "signed" && (
                        <button
                          onClick={() => downloadPdf(proposal.id)}
                          className="border border-sky-500 text-sky-600 px-3 py-1 rounded-full hover:text-white hover:bg-sky-500"
                          disabled={isConverting}
                        >
                          {isConverting ? "Downloading..." : "Download PDF"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
