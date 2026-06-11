import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  FileText,
  Calendar,
  Check,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  User as UserIcon,
  Sun,
  Moon,
}  from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ProposalEditor from "@/components/ProposalEditor";
import { supabase } from "@/integrations/supabase/client";
import type { Proposal } from "@/types/proposal";
import { USERS } from "@/types/proposal";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser, setCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/hooks/useTheme";
import avasyaLogo from "@/assets/avasya-logo.png";

export default function HomePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProposal, setEditingProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [pendingSave, setPendingSave] = useState<any | null>(null);
  const [pendingName, setPendingName] = useState<string>("");
  const { toast } = useToast();
  const currentUser = useCurrentUser();
  const { theme, toggle: toggleTheme } = useTheme();

  const fetchProposals = async () => {
    const { data, error } = await supabase
      .from("proposals")
      .select("id, customer_name, date, total, currency, status, created_by")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching proposals:", error);
      toast({ title: "Hata", description: "Teklifler yüklenemedi.", variant: "destructive" });
    } else {
      setProposals(
        (data || []).map((row: any) => ({
          id: row.id,
          customerName: row.customer_name || "",
          date: row.date || "",
          total: row.total || 0,
          currency: row.currency || "USD",
          status: (row.status as "draft" | "approved") || "draft",
          createdBy: row.created_by || "",
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

  const persistProposal = async (proposal: any, createdByName?: string) => {
    const row: any = {
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
      const result = await supabase.from("proposals").update(row).eq("id", proposal.id);
      error = result.error;
    } else {
      row.created_by = createdByName || currentUser || "";
      row.status = "draft";
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
    setPendingSave(null);
    setPendingName("");
    fetchProposals();
  };

  const handleSave = async (proposal: any) => {
    const isNew = !proposal.id || (typeof proposal.id === "string" && proposal.id.startsWith("new-"));
    if (isNew) {
      // Ask who is saving
      setPendingName(currentUser || "");
      setPendingSave(proposal);
      return;
    }
    await persistProposal(proposal);
  };

  const toggleApproval = async (e: React.MouseEvent, p: Proposal) => {
    e.stopPropagation();
    const newStatus = p.status === "approved" ? "draft" : "approved";
    const { error } = await supabase.from("proposals").update({ status: newStatus }).eq("id", p.id);
    if (error) {
      toast({ title: "Hata", description: "Durum güncellenemedi.", variant: "destructive" });
      return;
    }
    setProposals((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: newStatus } : x)));
  };

  const visibleProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (userFilter !== "all" && p.createdBy !== userFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.customerName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [proposals, userFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const approved = proposals.filter((p) => p.status === "approved");
    const drafts = proposals.filter((p) => p.status === "draft");
    const totalApprovedValue = approved.reduce((s, p) => s + (p.total || 0), 0);
    return { total: proposals.length, approved: approved.length, drafts: drafts.length, totalApprovedValue };
  }, [proposals]);

  if (isEditing) {
    return (
      <>
        <ProposalEditor onBack={handleBack} onSave={handleSave} proposal={editingProposal} />
        <Dialog open={!!pendingSave} onOpenChange={(o) => !o && setPendingSave(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Teklifi kim kaydediyor?</DialogTitle>
              <DialogDescription>
                Teklifin yanında görünmesi için lütfen adınızı seçin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
              {USERS.map((name) => (
                <button
                  key={name}
                  onClick={() => setPendingName(name)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    pendingName === name
                      ? "border-red-700 bg-red-50"
                      : "border-slate-200 hover:border-red-700/40 hover:bg-slate-50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-900 text-white flex items-center justify-center font-bold text-xs">
                    {name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="font-medium text-slate-900 text-sm">{name}</span>
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPendingSave(null)}>
                İptal
              </Button>
              <Button
                disabled={!pendingName}
                onClick={() => {
                  persistProposal(pendingSave, pendingName);
                }}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }



  const initials = currentUser ? currentUser.split(" ").map((n) => n[0]).join("") : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/85 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <img
              src={avasyaLogo}
              alt="Avasya Teknoloji"
              className="h-14 md:h-16 w-auto transition-transform duration-300 group-hover:scale-105"
              draggable={false}
            />
            <div className="hidden md:block h-10 w-px bg-slate-200 dark:bg-slate-700" />
            <span className="hidden md:inline text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-wider">
              TEKLİF YÖNETİM SİSTEMİ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Tema değiştir"
              className="relative inline-flex items-center h-9 w-16 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 transition-colors hover:border-red-700/40"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-8 w-8 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center transition-transform duration-300 ${
                  theme === "dark" ? "translate-x-7" : "translate-x-0"
                }`}
              >
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-amber-300" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </span>
              <Sun className={`absolute left-2 w-4 h-4 ${theme === "light" ? "opacity-0" : "text-slate-400"}`} />
              <Moon className={`absolute right-2 w-4 h-4 ${theme === "dark" ? "opacity-0" : "text-slate-400"}`} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-700/40 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all duration-200">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Profil</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 animate-scale-in">
                <DropdownMenuLabel>Profil seç</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {USERS.map((name) => (
                  <DropdownMenuItem
                    key={name}
                    onClick={() => setCurrentUser(name)}
                    className="cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-600 to-red-900 text-white flex items-center justify-center font-bold text-[10px] mr-2">
                      {name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    {name}
                  </DropdownMenuItem>
                ))}
                {currentUser && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCurrentUser(null)} className="cursor-pointer">
                      Profili temizle
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-white animate-fade-in">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-600 to-slate-900" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Tüm tekliflerin genel görünümü. Yeni teklif oluşturun veya mevcutları yönetin.
              </p>
            </div>
            <Button
              onClick={handleNewProposal}
              className="bg-red-700 hover:bg-red-800 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
              Yeni Teklif Oluştur
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <StatCard icon={<FileText className="w-5 h-5" />} label="Toplam Teklif" value={stats.total.toString()} accent="slate" delay={0} />
            <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Onaylanan" value={stats.approved.toString()} accent="green" delay={60} />
            <StatCard icon={<Clock className="w-5 h-5" />} label="Taslak" value={stats.drafts.toString()} accent="amber" delay={120} />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Onaylanan Tutar"
              value={`$${stats.totalApprovedValue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`}
              accent="red"
              delay={180}
            />
          </div>
        </div>
      </div>

      {/* Proposals */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Teklifler</h2>
          <span className="text-sm text-slate-500">{visibleProposals.length} sonuç</span>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-5 border border-slate-200 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Müşteri adı ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="md:col-span-4">
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <SelectValue placeholder="Kullanıcı" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm kullanıcılar</SelectItem>
                  {USERS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm durumlar</SelectItem>
                  <SelectItem value="approved">Onaylananlar</SelectItem>
                  <SelectItem value="draft">Taslaklar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {loading ? (
          <p className="text-center text-slate-500 py-16">Yükleniyor...</p>
        ) : visibleProposals.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-2 border-slate-300 bg-white/60">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-red-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Sonuç bulunamadı</h3>
            <p className="text-slate-500 mb-5">Filtreleri değiştirin veya yeni bir teklif oluşturun.</p>
            <Button onClick={handleNewProposal} className="bg-red-700 hover:bg-red-800 text-white">
              <Plus className="w-4 h-4 mr-1" /> Teklif Oluştur
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3">
            {visibleProposals.map((proposal, idx) => (
              <Card
                key={proposal.id}
                className="group p-5 cursor-pointer border border-slate-200 hover:border-red-700/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-white animate-fade-in"
                style={{ animationDelay: `${Math.min(idx * 40, 400)}ms`, animationFillMode: "backwards" }}
                onClick={async () => {
                  const { data } = await supabase.from("proposals").select("*").eq("id", proposal.id).single();
                  if (data?.full_data) {
                    setEditingProposal({ ...(data.full_data as any), id: data.id });
                  } else {
                    setEditingProposal({
                      id: data?.id,
                      customerName: data?.customer_name,
                      date: data?.date,
                      currency: data?.currency,
                    });
                  }
                  setIsEditing(true);
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900 truncate group-hover:text-red-700 transition-colors">
                          {proposal.customerName || "İsimsiz Müşteri"}
                        </h4>
                        {proposal.status === "approved" && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200 font-medium">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Onaylandı
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {proposal.date || "Tarihsiz"}
                        </span>
                        {proposal.createdBy && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {proposal.createdBy}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-lg tabular-nums whitespace-nowrap">
                      {proposal.currency === "TRY" ? "₺" : proposal.currency === "USD" ? "$" : "€"}
                      {proposal.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </span>
                    <Button
                      variant={proposal.status === "approved" ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => toggleApproval(e, proposal)}
                      className={
                        proposal.status === "approved"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "border-slate-300 text-slate-700 hover:border-green-600 hover:text-green-700"
                      }
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {proposal.status === "approved" ? "Onaylı" : "Onayla"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "slate" | "green" | "amber" | "red";
  delay?: number;
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <Card
      className="p-5 border border-slate-200 bg-white animate-fade-in hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[accent]} transition-transform duration-300 hover:scale-110`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums truncate">{value}</div>
        </div>
      </div>
    </Card>
  );
}
