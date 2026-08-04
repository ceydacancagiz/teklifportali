import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import avasyaLogo from "@/assets/avasya-logo.png";
import { setCurrentUser } from "@/hooks/useCurrentUser";

const ALLOWED_DOMAIN = "@avasya.com.tr";

const EMAIL_TO_NAME: Record<string, string> = {
  "yesim.sacli@avasya.com.tr": "Yeşim Saçlı",
  "ozlem.hur@avasya.com.tr": "Özlem Hür",
  "ulker.ertugrul@avasya.com.tr": "Ülker Ertuğrul",
  "ceyda.cancagiz@avasya.com.tr": "Ceyda Cancağız",
  "ugur.imre@avasya.com.tr": "Uğur İmre",
  "sezer.ali@avasya.com.tr": "Sezer Ali",
};

function nameFromEmail(email: string): string {
  const lower = email.toLowerCase().trim();
  if (EMAIL_TO_NAME[lower]) return EMAIL_TO_NAME[lower];
  const local = lower.split("@")[0] || "";
  return local
    .split(".")
    .filter(Boolean)
    .map((p) => p.charAt(0).toLocaleUpperCase("tr") + p.slice(1))
    .join(" ");
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized.endsWith(ALLOWED_DOMAIN)) {
      toast({
        title: "Geçersiz e-posta",
        description: `Yalnızca ${ALLOWED_DOMAIN} uzantılı e-postalar kullanılabilir.`,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: normalized,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        // Auto-confirm is enabled, so a session should exist now.
        const { data: sess } = await supabase.auth.getSession();
        if (!sess.session) {
          // Fall back to immediate sign-in
          await supabase.auth.signInWithPassword({ email: normalized, password });
        }
        setCurrentUser(nameFromEmail(normalized));
        toast({ title: "Hoş geldiniz", description: "Hesabınız oluşturuldu." });
        navigate("/", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalized,
          password,
        });
        if (error) throw error;
        setCurrentUser(nameFromEmail(normalized));
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      toast({
        title: "Giriş başarısız",
        description: err?.message || "Bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <Card className="w-full max-w-md p-8 bg-neutral-900 border-neutral-800">
        <div className="flex flex-col items-center mb-6">
          <img src={avasyaLogo} alt="Avasya" className="h-14 mb-4" />
          <h1 className="text-xl font-bold text-slate-100">Teklif Yönetim Sistemi</h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === "login" ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-slate-200">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ad.soyad@avasya.com.tr"
              required
              autoComplete="email"
              className="mt-1 bg-neutral-800 border-neutral-700 text-slate-100"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-slate-200">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="mt-1 bg-neutral-800 border-neutral-700 text-slate-100"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 hover:bg-red-800 text-white"
          >
            {loading ? "Lütfen bekleyin..." : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-400">
          {mode === "login" ? (
            <>
              Hesabınız yok mu?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-red-400 hover:text-red-300 font-medium"
              >
                Kayıt olun
              </button>
            </>
          ) : (
            <>
              Zaten hesabınız var mı?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-red-400 hover:text-red-300 font-medium"
              >
                Giriş yapın
              </button>
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-center text-slate-500">
          Yalnızca {ALLOWED_DOMAIN} uzantılı şirket e-postaları erişebilir.
        </p>
      </Card>
    </div>
  );
}
