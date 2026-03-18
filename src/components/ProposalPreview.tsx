import { forwardRef } from "react";
import type { ProposalData } from "@/types/proposal";

interface Props {
  data: ProposalData;
  getCurrencySymbol: () => string;
  calculateTotal: () => number;
}

const ProposalPreview = forwardRef<HTMLDivElement, Props>(
  ({ data, getCurrencySymbol, calculateTotal }, ref) => {
    const formatCurrency = (amount: number) => {
      return `${getCurrencySymbol()}${amount.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const hasKitLists = data.lineItems.some((item) => item.kitList.length > 0);

    return (
      <div ref={ref} className="bg-card">
        {/* Page content */}
        <div style={{ padding: "0" }}>
          {/* Header */}
          <div
            style={{
              backgroundColor: "hsl(352, 62%, 50%)",
              padding: "16px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
                letterSpacing: "2px",
              }}
            >
              AVASYA
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "white", fontSize: "12px" }}>
                avasya.com.tr
              </span>
              <span
                style={{
                  color: "white",
                  border: "1px solid white",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                ⓘ
              </span>
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            {/* Date */}
            <div style={{ textAlign: "right", color: "#6b7280", fontSize: "13px", marginBottom: "16px" }}>
              {data.date}
            </div>

            {/* Customer */}
            <div style={{ marginBottom: "16px" }}>
              <span style={{ color: "#374151", fontSize: "14px" }}>Sayın </span>
              <span style={{ color: "hsl(352, 62%, 50%)", fontWeight: "bold", fontSize: "14px" }}>
                {data.customerName || "Müşteri Adı"}
              </span>
            </div>

            {/* Intro */}
            <p style={{ color: "#6b7280", fontSize: "12px", lineHeight: "1.6", marginBottom: "24px" }}>
              {data.introText}
            </p>

            {/* Line Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "8px 4px", fontSize: "11px", fontWeight: "bold", color: "#374151" }}>AÇIKLAMA</th>
                  <th style={{ textAlign: "center", padding: "8px 4px", fontSize: "11px", fontWeight: "bold", color: "#374151" }}>MİKTAR</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", fontSize: "11px", fontWeight: "bold", color: "#374151" }}>BİRİM FİYAT</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", fontSize: "11px", fontWeight: "bold", color: "#374151" }}>TOPLAM</th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "8px 4px", fontSize: "12px", color: "#374151" }}>{item.description || "-"}</td>
                    <td style={{ padding: "8px 4px", fontSize: "12px", color: "#374151", textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ padding: "8px 4px", fontSize: "12px", color: "#374151", textAlign: "right" }}>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ padding: "8px 4px", fontSize: "12px", color: "#374151", textAlign: "right" }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
              <div
                style={{
                  border: "2px solid hsl(352, 62%, 50%)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "hsl(352, 62%, 50%)", fontWeight: "bold", fontSize: "13px" }}>GENEL TOPLAM:</span>
                <span style={{ color: "hsl(352, 62%, 50%)", fontWeight: "bold", fontSize: "15px" }}>
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>

            {/* Kit Lists */}
            {hasKitLists &&
              data.lineItems.map(
                (item, itemIndex) =>
                  item.kitList.length > 0 && (
                    <div key={item.id} style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          borderBottom: "2px solid #e5e7eb",
                          paddingBottom: "6px",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ fontWeight: "bold", fontSize: "13px", color: "#1f2937" }}>
                          {itemIndex + 1}. {item.description || `Kalem ${itemIndex + 1}`}
                        </span>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f3f4f6" }}>
                            <th style={{ textAlign: "left", padding: "6px 4px", fontWeight: "bold", color: "#374151" }}>MODÜL</th>
                            <th style={{ textAlign: "left", padding: "6px 4px", fontWeight: "bold", color: "#374151" }}>AÇIKLAMA</th>
                            {data.showSkuColumn && (
                              <th style={{ textAlign: "left", padding: "6px 4px", fontWeight: "bold", color: "#374151" }}>SKU</th>
                            )}
                            {data.showTaxColumn && (
                              <th style={{ textAlign: "left", padding: "6px 4px", fontWeight: "bold", color: "#374151" }}>VERGİ TÜRÜ</th>
                            )}
                            <th style={{ textAlign: "center", padding: "6px 4px", fontWeight: "bold", color: "#374151" }}>ADET</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.kitList.map((kitItem, kitIndex) => (
                            <tr
                              key={kitIndex}
                              style={{
                                borderBottom: "1px solid #e5e7eb",
                                backgroundColor: kitIndex % 2 === 0 ? "white" : "#f9fafb",
                              }}
                            >
                              <td style={{ padding: "5px 4px", color: "#374151", fontWeight: kitItem.module ? "600" : "normal" }}>
                                {kitItem.module || "-"}
                              </td>
                              <td style={{ padding: "5px 4px", color: "#6b7280" }}>{kitItem.description || "-"}</td>
                              {data.showSkuColumn && (
                                <td style={{ padding: "5px 4px", color: "#6b7280" }}>{kitItem.sku || "-"}</td>
                              )}
                              {data.showTaxColumn && (
                                <td style={{ padding: "5px 4px", color: "#6b7280" }}>{kitItem.taxType || "-"}</td>
                              )}
                              <td style={{ padding: "5px 4px", color: "#374151", textAlign: "center" }}>{kitItem.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div
                        style={{
                          backgroundColor: "#e5e7eb",
                          padding: "3px 8px",
                          fontSize: "10px",
                          color: "#6b7280",
                        }}
                      >
                        Toplam {item.kitList.length} kalem
                      </div>
                    </div>
                  )
              )}

            {/* Payment Terms */}
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ fontWeight: "bold", fontSize: "14px", color: "#1f2937", marginBottom: "4px" }}>
                FİYATLAR VE ÖDEME
              </h3>
              <hr style={{ borderColor: "#d1d5db", marginBottom: "8px" }} />
              <p style={{ color: "#6b7280", fontSize: "12px", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                {data.paymentTerms}
              </p>
            </div>

            {/* Validity */}
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ fontWeight: "bold", fontSize: "14px", color: "#1f2937", marginBottom: "4px" }}>
                GEÇERLİLİK SÜRESİ
              </h3>
              <hr style={{ borderColor: "#d1d5db", marginBottom: "8px" }} />
              <p style={{ color: "#6b7280", fontSize: "12px" }}>{data.validityPeriod}</p>
            </div>

            {/* Footer Note */}
            {data.footerText && (
              <p style={{ color: "#9ca3af", fontSize: "11px", fontStyle: "italic", lineHeight: "1.6", marginBottom: "16px" }}>
                {data.footerText}
              </p>
            )}

            {/* Additional Notes */}
            {data.additionalNotes && (
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ fontWeight: "bold", fontSize: "14px", color: "#1f2937", marginBottom: "4px" }}>
                  İLAVE NOTLAR
                </h3>
                <hr style={{ borderColor: "#d1d5db", marginBottom: "8px" }} />
                <p style={{ color: "#6b7280", fontSize: "12px", lineHeight: "1.6" }}>
                  {data.additionalNotes}
                </p>
              </div>
            )}

            {/* Company Footer */}
            <div style={{ textAlign: "right", marginTop: "32px" }}>
              <p style={{ color: "#6b7280", fontSize: "12px", fontStyle: "italic" }}>
                Avasya Teknoloji San. Ve Dış
              </p>
              <p style={{ color: "#6b7280", fontSize: "12px", fontStyle: "italic" }}>
                Tic. Ltd. Şti.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProposalPreview.displayName = "ProposalPreview";

export default ProposalPreview;
