import { useState, useEffect } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProposalEditor from "@/components/ProposalEditor";
import { supabase } from "@/integrations/supabase/client";
import type { Proposal } from "@/types/proposal";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProposal, setEditingProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProposals = async () => {
    const { data, error } = await supabase
      .from("proposals")
      .select("id, customer_name, date, total, currency")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching proposals:", error);
      toast({ title: "Hata", description: "Teklifler yüklenemedi.", variant: "destructive" });
    } else {
      setProposals(
        (data || []).map((row) => ({
          id: row.id,
          customerName: row.customer_name || "",
          date: row.date || "",
          total: row.total || 0,
          currency: row.currency || "USD",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleNewProposal = () => {
    setEditingProposal(null);
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    setEditingProposal(null);
    fetchProposals();
  };

  const handleSave = async (proposal: any) => {
    const row = {
      customer_name: proposal.customerName || "",
      date: proposal.date || "",
      currency: proposal.currency || "USD",
      total: proposal.total || 0,
      intro_text: proposal.introText || "",
      notes: proposal.additionalNotes || "",
      items: proposal.lineItems || [],
      full_data: proposal,
    };

    let error;
    if (proposal.id && !proposal.id.startsWith?.("new-")) {
      // Update existing
      const result = await supabase.from("proposals").update(row).eq("id", proposal.id);
      error = result.error;
    } else {
      // Insert new
      const result = await supabase.from("proposals").insert(row);
      error = result.error;
    }

    if (error) {
      console.error("Save error:", error);
      toast({ title: "Hata", description: "Teklif kaydedilemedi.", variant: "destructive" });
      return;
    }

    toast({ title: "Başarılı", description: "Teklif kaydedildi." });
    setIsEditing(false);
    setEditingProposal(null);
    fetchProposals();
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

        {loading ? (
          <p className="text-center text-muted-foreground py-16">Yükleniyor...</p>
        ) : proposals.length === 0 ? (
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
                onClick={async () => {
                  const { data } = await supabase
                    .from("proposals")
                    .select("*")
                    .eq("id", proposal.id)
                    .single();
                  if (data?.full_data) {
                    setEditingProposal({ ...(data.full_data as any), id: data.id });
                  } else {
                    setEditingProposal({ id: data?.id, customerName: data?.customer_name, date: data?.date, currency: data?.currency });
                  }
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
