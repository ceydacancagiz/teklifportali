import { useState, useRef } from "react";
import { ArrowLeft, Download, Plus, Trash2, User, Package, Settings, ClipboardList } from "lucide-react";
import headerBanner from "@/assets/header-banner.png";
import footerBanner from "@/assets/footer-banner.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import ProposalPreview from "@/components/ProposalPreview";
import type { ProposalData, LineItem, KitListItem } from "@/types/proposal";
import { CONTENT_PAGE_HEIGHT, CONTENT_PAGE_WIDTH, getFittedKitListScale } from "@/lib/proposal-layout";

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
      "Teklifimizde yer alan fiyatlar US DolarI cinsinden verilmiş olup, KDV dahil değildir.\nDöviz dönüşümlerine fatura tarihindeki T.C.M.B Döviz satış kuru kullanılacaktır.\nTeklifimizde yer alan hizmetlerin faturası hizmetin tamamlanmasını müteakip tek seferde fatura edilecek olup, ödeme vadesi 30 gündür.",
    validityPeriod:
      proposal?.validityPeriod || "Teklifimiz gizli olup, 15 gün süre ile geçerlidir",
    footerText:
      proposal?.footerText ||
      "Bu planda herhangi bir değişiklik yapılması durumunda ilave her bir faz yada envanter yoğunluğunun fazla olması durumunda ilave her bir faz için yeniden belirlenen sigorta,işçilik,nakliye/hammaliye bedelleri ayrıca fatura edilecektir.",
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

    const parsedItems: KitListItem[] = rows.map((row) => {
      const columns = row.split("\t");

      // Smart parsing: detect if data has many columns (Excel with merged cells)
      // Excel format from Dell/similar configs: B(Modül) | C-J(Açıklama merged) | K(SKU) | L(Vergi Türü) | M(empty) | N(Adet)
      // When copied, merged cells produce empty tab columns
      if (columns.length > 6) {
        // Many columns - likely Excel with merged cells
        // Find the description (first non-empty after module)
        const module = columns[0]?.trim() || "";
        const description = columns[1]?.trim() || "";
        
        // SKU and tax type are near the end, before quantity
        // Look for non-empty columns from the right
        const nonEmptyFromRight: string[] = [];
        for (let i = columns.length - 1; i >= 2; i--) {
          const val = columns[i]?.trim();
          if (val) nonEmptyFromRight.unshift(val);
        }
        
        // Pattern: [...other, SKU, TaxType, Quantity] or [...other, Quantity]
        // The last non-empty value that's a number is quantity
        let quantity = 1;
        let sku = "";
        let taxType = "";

        if (nonEmptyFromRight.length >= 3) {
          const lastVal = nonEmptyFromRight[nonEmptyFromRight.length - 1];
          if (!isNaN(parseInt(lastVal))) {
            quantity = parseInt(lastVal);
            taxType = nonEmptyFromRight[nonEmptyFromRight.length - 2] || "";
            sku = nonEmptyFromRight[nonEmptyFromRight.length - 3] || "";
          }
        } else if (nonEmptyFromRight.length >= 1) {
          const lastVal = nonEmptyFromRight[nonEmptyFromRight.length - 1];
          if (!isNaN(parseInt(lastVal))) {
            quantity = parseInt(lastVal);
          }
        }

        return { module, description, sku, taxType, quantity };
      }

      // Simple 5-column format: Module | Description | SKU | Tax Type | Quantity
      return {
        module: columns[0]?.trim() || "",
        description: columns[1]?.trim() || "",
        sku: columns[2]?.trim() || "",
        taxType: columns[3]?.trim() || "",
        quantity: parseInt(columns[4]?.trim()) || 1,
      };
    }).filter((item) => item.module || item.description || item.sku);

    if (parsedItems.length > 0) {
      updateLineItem(itemId, "kitList", parsedItems);
    }
  };

  const clearKitList = (itemId: string) => {
    updateLineItem(itemId, "kitList", []);
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

      // Find all page elements
      const pageElements = container.querySelectorAll("[data-page]") as NodeListOf<HTMLElement>;

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const headerHeight = 18;
      const footerHeight = 22;
      const contentMarginTop = 6;
      const contentAreaHeight = pdfHeight - headerHeight - footerHeight - contentMarginTop - 6;

      // Load header and footer images
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      const headerImg = await loadImage(headerBanner);
      const footerImg = await loadImage(footerBanner);

      const headerCanvas = document.createElement("canvas");
      headerCanvas.width = headerImg.naturalWidth;
      headerCanvas.height = headerImg.naturalHeight;
      const hCtx = headerCanvas.getContext("2d");
      if (hCtx) hCtx.drawImage(headerImg, 0, 0);
      const headerData = headerCanvas.toDataURL("image/png");

      const footerCanvas = document.createElement("canvas");
      footerCanvas.width = footerImg.naturalWidth;
      footerCanvas.height = footerImg.naturalHeight;
      const fCtx = footerCanvas.getContext("2d");
      if (fCtx) fCtx.drawImage(footerImg, 0, 0);
      const footerData = footerCanvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let isFirstPdfPage = true;

      for (const pageEl of Array.from(pageElements)) {
        const originalWidth = pageEl.style.width;
        pageEl.style.width = `${CONTENT_PAGE_WIDTH}px`;

        const canvas = await html2canvas(pageEl, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: "hsl(0 0% 100%)",
          width: CONTENT_PAGE_WIDTH,
          height: CONTENT_PAGE_HEIGHT,
        });

        pageEl.style.width = originalWidth;

        const imgData = canvas.toDataURL("image/png");

        if (!isFirstPdfPage) pdf.addPage();
        pdf.addImage(headerData, "PNG", 0, 0, pdfWidth, headerHeight);
        pdf.addImage(imgData, "PNG", 0, headerHeight + contentMarginTop, pdfWidth, contentAreaHeight);
        pdf.addImage(footerData, "PNG", 0, pdfHeight - footerHeight, pdfWidth, footerHeight);
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

  const handleSave = () => {
    onSave({
      id: proposal?.id || Date.now().toString(),
      customerName: data.customerName,
      date: data.date,
      total: calculateTotal(),
      currency: data.currency,
      ...data,
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
            <div>
              <Label>Müşteri / Firma Adı</Label>
              <Input
                placeholder="Örn: X Teknoloji A.Ş."
                value={data.customerName}
                onChange={(e) => updateField("customerName", e.target.value)}
                className="mt-1"
              />
            </div>
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
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
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

                {/* Kit list preview table */}
                {item.kitList.length > 0 && (
                  <div className="border rounded overflow-auto max-h-64">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left p-2 font-medium">Modül</th>
                          <th className="text-left p-2 font-medium">Açıklama</th>
                          {data.showSkuColumn && (
                            <th className="text-left p-2 font-medium">SKU</th>
                          )}
                          {data.showTaxColumn && (
                            <th className="text-left p-2 font-medium">Vergi Türü</th>
                          )}
                          <th className="text-center p-2 font-medium">Adet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.kitList.map((kitItem, kitIndex) => (
                          <tr key={kitIndex} className="border-t">
                            <td className="p-2 font-medium">{kitItem.module}</td>
                            <td className="p-2 text-muted-foreground">{kitItem.description}</td>
                            {data.showSkuColumn && (
                              <td className="p-2 text-muted-foreground">{kitItem.sku || "-"}</td>
                            )}
                            {data.showTaxColumn && (
                              <td className="p-2 text-muted-foreground">{kitItem.taxType || "-"}</td>
                            )}
                            <td className="p-2 text-center">{kitItem.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-muted px-2 py-1 text-xs text-muted-foreground">
                      Toplam {item.kitList.length} kalem
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

        <Button
          onClick={handleSave}
          className="w-full mb-8"
          size="lg"
        >
          <Settings className="w-4 h-4 mr-2" />
          Sisteme Kaydet
        </Button>
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
