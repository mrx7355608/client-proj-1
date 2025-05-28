import EditProposalItem from "./EditProposalItem";
import ProposalsProvider from "../../contexts/proposals";

export default function EditPage() {
  return (
    <ProposalsProvider goToSelectionScreen={() => {}}>
      <EditProposalItem />
    </ProposalsProvider>
  );
}
