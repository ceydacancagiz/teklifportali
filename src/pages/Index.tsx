import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProposalEditor from "@/components/ProposalEditor";
import type { Proposal } from "@/types/proposal";

export default function HomePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProposal, setEditingProposal] = useState<any>(null);

  const handleNewProposal = () => {
    setEditingProposal(null);
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    setEditingProposal(null);
  };

  const handleSave = (proposal: any) => {
    if (editingProposal) {
      setProposals(proposals.map((p) => (p.id === proposal.id ? proposal : p)));
    } else {
      setProposals([...proposals, { ...proposal, id: Date.now().toString() }]);
    }
    setIsEditing(false);
    setEditingProposal(null);
  };

  if (isEditing) {
    return (
      <ProposalEditor
        onBack={handleBack}
        onSave={handleSave}
        proposal={editingProposal}
      />
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teklifler</h1>
            <p className="text-muted-foreground mt-1">
              Avasya Teknoloji teklif yönetim sistemi.
            </p>
          </div>
          <Button onClick={handleNewProposal}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Teklif Oluştur
          </Button>
        </div>

        {proposals.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-2">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Henüz teklif bulunmuyor
            </h3>
            <p className="text-muted-foreground mb-4">
              İlk teklifinizi oluşturarak başlayın.
            </p>
            <Button variant="outline" onClick={handleNewProposal} className="text-primary border-primary/30">
              <Plus className="w-4 h-4 mr-1" />
              Oluştur
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {proposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setEditingProposal(proposal);
                  setIsEditing(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {proposal.customerName || "İsimsiz Müşteri"}
                    </h4>
                    <p className="text-sm text-muted-foreground">{proposal.date}</p>
                  </div>
                  <span className="font-bold text-foreground">
                    {proposal.currency === "TRY"
                      ? "₺"
                      : proposal.currency === "USD"
                      ? "$"
                      : "€"}
                    {proposal.total.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
