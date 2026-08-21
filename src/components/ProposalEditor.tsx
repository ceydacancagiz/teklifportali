import { useState, useRef } from "react";
import { ArrowLeft, Download, Plus, Trash2, User, Package, Settings, ClipboardList, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import ProposalPreview from "@/components/ProposalPreview";
import PriceInput from "@/components/PriceInput";
import type { ProposalData, LineItem, KitListItem } from "@/types/proposal";
import { FULL_PAGE_HEIGHT, CONTENT_PAGE_WIDTH, getFittedKitListScale } from "@/lib/proposal-layout";

interface Props {
  onBack: () => void;
  onSave: (proposal: any) => void;
  proposal: any | null;
}

export default function ProposalEditor({ onBack, onSave, proposal }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [data, setData] = useState<ProposalData>({
    customerName: proposal?.customerName || "",
    customerCompany: proposal?.customerCompany || "",
    proposalNumber: proposal?.proposalNumber || "",
    date: proposal?.date || new Date().toLocaleDateString("tr-TR"),
    currency: proposal?.currency || "USD",
    lineItems: proposal?.lineItems || [
      { id: "1", description: "", quantity: 1, unitPrice: 0, kitList: [] },
    ],
    introText:
      proposal?.introText ||
      "Göstermiş olduğunuz ilgi ve güven için teşekkür ederiz. Talep etmiş olduğunuz ürün/hizmetlerimize yönelik teklifimiz aşağıda değerlendirmelerinize sunulmuştur. Teklifimiz hakkında her türlü soru ve görüşlerinizi bekler, iyi çalışmalar dileriz. Saygılarımızla,",
    paymentTerms:
      proposal?.paymentTerms ||
      "Teklifimizde yer alan fiyatlar US Doları cinsinden verilmiş olup, KDV dahil değildir.\nDöviz dönüşümlerine ödeme tarihindeki T.C.M.B Döviz satış kuru kullanılacaktır.\nTeklifimizde yer alan hizmetlerin faturası hizmetin tamamlanmasını müteakip tek seferde fatura edilecek olup, ödeme vadesi 30 gündür.",
    validityPeriod:
      proposal?.validityPeriod || "Teklifimiz gizli olup, 15 gün süre ile geçerlidir",
    footerText: proposal?.footerText || "",
    additionalNotes: proposal?.additionalNotes || "",
    contactName: proposal?.contactName || "",
    contactTitle: proposal?.contactTitle || "",
    contactPhone: proposal?.contactPhone || "",
    contactEmail: proposal?.contactEmail || "",
    companyName:
      proposal?.companyName || "AVASYA TEKNOLOJİ SANAYİ VE DIŞ TİC. LTD ŞTİ",
    phone1: proposal?.phone1 || "+90 216 415 45 45",
    phone2: proposal?.phone2 || "+90 216 364 59 59",
    email: proposal?.email || "bilgi@avasya.com.tr",
    website: proposal?.website || "www.avasya.com.tr",
    address:
      proposal?.address ||
      "Yukarı Dudullu Mh. Necip Fazıl Blv. Keyap Sit. D blk No:60 Ümraniye, İST",
    showSkuColumn: proposal?.showSkuColumn ?? true,
    showTaxColumn: proposal?.showTaxColumn ?? true,
    kitListScale: proposal?.kitListScale ?? 1,
  });

  const overflowingKitLists = data.lineItems.filter(
    (item) => item.kitList.length > 0 && getFittedKitListScale(item, data.kitListScale) < data.kitListScale - 0.01
  );

  const updateField = (field: keyof ProposalData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      kitList: [],
    };
    updateField("lineItems", [...data.lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    updateField(
      "lineItems",
      data.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeLineItem = (id: string) => {
    if (data.lineItems.length > 1) {
      updateField(
        "lineItems",
        data.lineItems.filter((item) => item.id !== id)
      );
    }
  };

  const handleKitListPaste = (itemId: string, e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const rows = pastedText.split("\n").filter((row) => row.trim());

    // Sadece ilk 3 sütun esas alınır: Modül | Açıklama | Adet
    const parsedItems: KitListItem[] = rows.map((row) => {
      const columns = row.split("\t");
      const module = columns[0]?.trim() || "";
      const description = columns[1]?.trim() || "";
      const quantity = parseInt(columns[2]?.trim()) || 1;
      return { module, description, sku: "", taxType: "", quantity };
    }).filter((item) => item.module || item.description);

    if (parsedItems.length > 0) {
      updateLineItem(itemId, "kitList", parsedItems);
    }
  };

  const clearKitList = (itemId: string) => {
    updateLineItem(itemId, "kitList", []);
  };

  const addKitListRow = (itemId: string) => {
    const item = data.lineItems.find((i) => i.id === itemId);
    if (!item) return;
    const newRow: KitListItem = {
      module: "",
      description: "",
      sku: "",
      taxType: "",
      quantity: 1,
    };
    updateLineItem(itemId, "kitList", [...item.kitList, newRow]);
  };

  const updateKitListRow = (
    itemId: string,
    rowIndex: number,
    field: keyof KitListItem,
    value: any
  ) => {
    const item = data.lineItems.find((i) => i.id === itemId);
    if (!item) return;
    const updated = item.kitList.map((row, idx) =>
      idx === rowIndex ? { ...row, [field]: value } : row
    );
    updateLineItem(itemId, "kitList", updated);
  };

  const removeKitListRow = (itemId: string, rowIndex: number) => {
    const item = data.lineItems.find((i) => i.id === itemId);
    if (!item) return;
    const updated = item.kitList.filter((_, idx) => idx !== rowIndex);
    updateLineItem(itemId, "kitList", updated);
  };

  const calculateTotal = () => {
    return data.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const getCurrencySymbol = () => {
    switch (data.currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      default:
        return "₺";
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const container = previewRef.current;
      const pageElements = container.querySelectorAll("[data-page]") as NodeListOf<HTMLElement>;

      const pdfWidth = 210;
      const pdfHeight = 297;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      let isFirstPdfPage = true;

      for (const pageEl of Array.from(pageElements)) {
        const originalWidth = pageEl.style.width;
        pageEl.style.width = `${CONTENT_PAGE_WIDTH}px`;

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: CONTENT_PAGE_WIDTH,
          height: FULL_PAGE_HEIGHT,
        });

        pageEl.style.width = originalWidth;

        const imgData = canvas.toDataURL("image/jpeg", 0.82);

        if (!isFirstPdfPage) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
        isFirstPdfPage = false;
      }

      pdf.save(
        `teklif-${data.customerName || "yeni"}-${data.date.replace(/\./g, "-")}.pdf`
      );
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const isExistingProposal = Boolean(
    proposal?.id && !String(proposal.id).startsWith("new-")
  );

  const nextVersionNumber = (current?: string) => {
    if (!current) return undefined;
    const match = current.match(/^(.*)-v(\d+)$/);
    if (match) return `${match[1]}-v${Number(match[2]) + 1}`;
    return `${current}-v2`;
  };

  const handleSave = (asCopy = false) => {
    onSave({
      id: asCopy ? undefined : proposal?.id,
      customerName: data.customerName,
      date: data.date,
      total: calculateTotal(),
      currency: data.currency,
      ...data,
      proposalNumber: asCopy
        ? nextVersionNumber(data.proposalNumber)
        : data.proposalNumber,
    });
  };


  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-auto max-h-screen">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="text-primary">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Tekliflere Dön
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-1" />
            {isGeneratingPDF ? "Hazırlanıyor..." : "PDF İndir"}
          </Button>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-6">
          Teklif Düzenleyici
        </h1>

        {/* Customer & Date */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Müşteri ve Tarih
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Firma Adı (opsiyonel)</Label>
                <Input
                  placeholder="Örn: X Teknoloji A.Ş."
                  value={data.customerCompany}
                  onChange={(e) => updateField("customerCompany", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Müşteri Adı (opsiyonel)</Label>
                <Input
                  placeholder="Örn: Ahmet Yılmaz"
                  value={data.customerName}
                  onChange={(e) => updateField("customerName", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            {data.proposalNumber && (
              <p className="text-xs text-muted-foreground">Teklif No: <span className="font-semibold">{data.proposalNumber}</span></p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Belge Tarihi</Label>
                <Input
                  value={data.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Para Birimi</Label>
                <Select
                  value={data.currency}
                  onValueChange={(v) => updateField("currency", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                    <SelectItem value="TRY">₺ Türk Lirası (TRY)</SelectItem>
                    <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4" />
              Kalemler (Ürün/Hizmet)
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="w-4 h-4 mr-1" />
              Yeni Ekle
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.lineItems.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm">Kalem {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(item.id)}
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label>Açıklama</Label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Miktar</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Birim Fiyat ({getCurrencySymbol()})</Label>
                      <PriceInput
                        value={item.unitPrice}
                        onChange={(v) => updateLineItem(item.id, "unitPrice", v)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Kit Lists */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-4 h-4" />
              Kit Listleri (Excel'den Yapıştır)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Format: Modül | Açıklama | SKU | Vergi Türü | Adet (Tab ile ayrılmış)
            </p>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-muted-foreground">Gösterilecek sütunlar:</span>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={data.showSkuColumn}
                  onCheckedChange={(checked) =>
                    updateField("showSkuColumn", checked)
                  }
                />
                <span className="text-sm">SKU</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={data.showTaxColumn}
                  onCheckedChange={(checked) =>
                    updateField("showTaxColumn", checked)
                  }
                />
                <span className="text-sm">Vergi Türü</span>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-4 mb-2">
                <Label className="text-sm font-medium">Kit list sayfa boyutu</Label>
                <span className="text-xs text-muted-foreground">%{Math.round(data.kitListScale * 100)}</span>
              </div>
              <Slider
                value={[data.kitListScale]}
                min={0.65}
                max={1.15}
                step={0.01}
                onValueChange={([value]) => updateField("kitListScale", value)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Preview ve PDF artık aynı sayfa bölünmesini gösterir. Kit listler tek parça kalır; gerekirse bu boyutu küçültün.
              </p>
              {overflowingKitLists.length > 0 && (
                <p className="mt-2 text-xs font-medium text-destructive">
                  Tek sayfaya sığması için otomatik küçülen kit listler: {overflowingKitLists.map((item, index) => item.description || `Kalem ${index + 1}`).join(", ")}
                </p>
              )}
            </div>

            {data.lineItems.map((item, index) => (
              <div key={item.id} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {item.description || `Kalem ${index + 1}`}
                  </span>
                  {item.kitList.length > 0 && (
                    <Button
                      onClick={() => clearKitList(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/5 h-7 text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Temizle
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="Excel'den kopyaladığınız verileri buraya yapıştırın ..."
                  onPaste={(e) => handleKitListPaste(item.id, e)}
                  className="mb-2 min-h-[60px]"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addKitListRow(item.id)}
                  className="mb-2 h-7 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Satır Ekle
                </Button>

                {/* Kit list preview table */}
                {item.kitList.length > 0 && (
                  <div className="border rounded overflow-auto max-h-64">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left p-2 font-medium">Modül</th>
                          <th className="text-left p-2 font-medium">Açıklama</th>
                          <th className="text-center p-2 font-medium w-16">Adet</th>
                          <th className="text-center p-2 font-medium w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.kitList.map((kitItem, kitIndex) => (
                          <tr key={kitIndex} className="border-t">
                            <td className="p-1">
                              <Input
                                value={kitItem.module}
                                onChange={(e) =>
                                  updateKitListRow(
                                    item.id,
                                    kitIndex,
                                    "module",
                                    e.target.value
                                  )
                                }
                                className="h-6 text-xs px-1 py-0"
                              />
                            </td>
                            <td className="p-1">
                              <Input
                                value={kitItem.description}
                                onChange={(e) =>
                                  updateKitListRow(
                                    item.id,
                                    kitIndex,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="h-6 text-xs px-1 py-0"
                              />
                            </td>
                            <td className="p-1">
                              <Input
                                type="number"
                                value={kitItem.quantity}
                                onChange={(e) =>
                                  updateKitListRow(
                                    item.id,
                                    kitIndex,
                                    "quantity",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-6 text-xs px-1 py-0 text-center"
                              />
                            </td>
                            <td className="p-1 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeKitListRow(item.id, kitIndex)}
                                className="h-5 w-5 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-muted px-2 py-1 text-xs text-muted-foreground flex items-center justify-between">
                      <span>Toplam {item.kitList.length} kalem</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addKitListRow(item.id)}
                        className="h-5 text-xs px-2 py-0"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Satır Ekle
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Text Fields */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-4 h-4" />
              Metin Alanları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>İntroduksiyon Metni</Label>
              <Textarea
                value={data.introText}
                onChange={(e) => updateField("introText", e.target.value)}
                className="mt-1 min-h-[80px]"
              />
            </div>
            <div>
              <Label>FİYATLAR VE ÖDEME</Label>
              <Textarea
                value={data.paymentTerms}
                onChange={(e) => updateField("paymentTerms", e.target.value)}
                className="mt-1 min-h-[80px]"
              />
            </div>
            <div>
              <Label>GEÇERLİLİK SÜRESİ</Label>
              <Input
                value={data.validityPeriod}
                onChange={(e) => updateField("validityPeriod", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Alt Bilgi Metni</Label>
              <Textarea
                value={data.footerText}
                onChange={(e) => updateField("footerText", e.target.value)}
                className="mt-1 min-h-[80px]"
              />
            </div>
            <div>
              <Label>İlave Notlar (Opsiyonel)</Label>
              <Textarea
                placeholder="Ek notlar..."
                value={data.additionalNotes}
                onChange={(e) =>
                  updateField("additionalNotes", e.target.value)
                }
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Şirket Yetkili Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ad Soyad</Label>
                <Input
                  placeholder="Yetkili adı"
                  value={data.contactName}
                  onChange={(e) => updateField("contactName", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Ünvanı</Label>
                <Input
                  placeholder="Örn: Genel Müdür"
                  value={data.contactTitle}
                  onChange={(e) => updateField("contactTitle", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefon</Label>
                <Input
                  placeholder="Telefon numarası"
                  value={data.contactPhone}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>E-Posta</Label>
                <Input
                  placeholder="E-posta adresi"
                  value={data.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="w-4 h-4" />
              Firma ve İletişim (Varsayılanlar)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Başlık Yazısı</Label>
              <Input
                value={data.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefon 1</Label>
                <Input
                  value={data.phone1}
                  onChange={(e) => updateField("phone1", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Telefon 2 / Faks</Label>
                <Input
                  value={data.phone2}
                  onChange={(e) => updateField("phone2", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>E-Posta</Label>
                <Input
                  value={data.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Web Sitesi</Label>
                <Input
                  value={data.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Adres</Label>
              <Textarea
                value={data.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <div
          className="sticky bottom-0 z-30 -mx-4 lg:-mx-6 mt-2 border-t border-border bg-background px-4 lg:px-6 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => handleSave(false)}
              size="lg"
              className="w-full bg-primary text-primary-foreground border border-primary shadow-md hover:bg-primary/90"
            >
              <Settings className="w-4 h-4 mr-2" />
              {isExistingProposal ? "Kaydet" : "Sisteme Kaydet"}
            </Button>
            {isExistingProposal && (
              <Button
                onClick={() => handleSave(true)}
                size="lg"
                variant="outline"
                className="w-full shadow-md"
              >
                <Copy className="w-4 h-4 mr-2" />
                Bir Kopyasını Kaydet
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Paginated Preview */}
      <div className="hidden lg:block w-1/2 p-6 overflow-auto max-h-screen bg-muted">
        <div className="max-w-[600px] mx-auto">
          <style>{`
            [data-page] {
              box-shadow: 0 2px 12px hsl(var(--foreground) / 0.12);
              margin-bottom: 24px;
              border: 1px solid hsl(var(--border));
            }
          `}</style>
          <ProposalPreview
            ref={previewRef}
            data={data}
            getCurrencySymbol={getCurrencySymbol}
            calculateTotal={calculateTotal}
          />
        </div>
      </div>
    </div>
  );
}
