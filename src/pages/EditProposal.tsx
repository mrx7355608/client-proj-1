import { useParams } from "react-router-dom";
import { Network, Settings, Shield, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Quote } from "../lib/types";
import { getProposal } from "../lib/data/proposals.data";
import ProposalsProvider from "../contexts/proposals";
import EditProposalItem from "../components/EditProposalItem";

export default function EditProposal() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const proposalTypes = [
    {
      id: "unm",
      name: "UNM",
      description: "Unified Network Management",
      icon: <Network className="w-6 h-6" />,
      color: "bg-purple-500",
    },
    {
      id: "msp",
      name: "MSP",
      description: "Managed Service Provider",
      icon: <Settings className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      id: "cybersecurity",
      name: "Cybersecurity",
      description: "Security Solutions",
      icon: <Shield className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      id: "buildouts",
      name: "Buildouts",
      description: "Network & Infrastructure",
      icon: <Building2 className="w-6 h-6" />,
      color: "bg-orange-500",
    },
  ];

  useEffect(() => {
    if (!id) return;

    const fetchQuote = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProposal(id);
        setQuote(data);
      } catch (error) {
        setError("Unable to fetch proposal");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!quote) return <div>Proposal not found</div>;

  const proposalName = quote.title.split(" ")[0].toLowerCase();
  const proposalTypeInfo = proposalTypes.filter(
    (p) => p.id === proposalName,
  )[0];

  return (
    <ProposalsProvider goToSelectionScreen={() => {}}>
      <EditProposalItem proposalTypeInfo={proposalTypeInfo} quote={quote} />
    </ProposalsProvider>
  );
}
