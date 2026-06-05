import { useState, useEffect } from "react";
import { Plus, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProposalEditor from "@/components/ProposalEditor";
import { supabase } from "@/integrations/supabase/client";
import type { Proposal } from "@/types/proposal";
import { useToast } from "@/hooks/use-toast";
import avasyaLogo from "@/assets/avasya-logo.png";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Hero / Brand Header */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(0 0% 0%) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-600 to-slate-900" />
        <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-14 pb-12 flex flex-col items-center text-center relative">
          <img
            src={avasyaLogo}
            alt="Avasya Teknoloji"
            className="h-24 md:h-28 w-auto mb-6 select-none"
            draggable={false}
          />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-red-700 uppercase leading-tight">
            Avasya Teknoloji<br className="md:hidden" /> Teklif Yönetim Sistemi
          </h1>
          <div className="mt-4 h-[3px] w-24 bg-red-700 rounded-full" />
          <p className="mt-5 text-sm md:text-base text-slate-500 max-w-xl">
            Profesyonel tekliflerinizi tek yerden oluşturun, düzenleyin ve PDF olarak dışa aktarın.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Teklifler</h2>
            <p className="text-sm text-slate-500 mt-1">
              {proposals.length > 0
                ? `Toplam ${proposals.length} teklif`
                : "Henüz hiç teklif oluşturulmadı"}
            </p>
          </div>
          <Button
            onClick={handleNewProposal}
            className="bg-red-700 hover:bg-red-800 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Teklif Oluştur
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-slate-500 py-16">Yükleniyor...</p>
        ) : proposals.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-2 border-slate-300 bg-white/60">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-red-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Henüz teklif bulunmuyor
            </h3>
            <p className="text-slate-500 mb-5">
              İlk teklifinizi oluşturarak başlayın.
            </p>
            <Button
              onClick={handleNewProposal}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Teklif Oluştur
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3">
            {proposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="group p-5 cursor-pointer border border-slate-200 hover:border-red-700/40 hover:shadow-md transition-all bg-white"
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
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate group-hover:text-red-700 transition-colors">
                        {proposal.customerName || "İsimsiz Müşteri"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {proposal.date || "Tarihsiz"}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-lg tabular-nums whitespace-nowrap">
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
