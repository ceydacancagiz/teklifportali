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
      <div ref={ref} className="bg-card" style={{ fontSize: "9px", lineHeight: "1.4" }}>
        <div style={{ padding: "20px 24px" }}>
          {/* Date */}
          <div style={{ textAlign: "right", color: "#6b7280", fontSize: "10px", marginBottom: "10px" }}>
            {data.date}
          </div>

          {/* Customer */}
          <div style={{ marginBottom: "10px" }}>
            <span style={{ color: "#374151", fontSize: "10px" }}>Sayın </span>
            <span style={{ color: "#1f2937", fontWeight: "bold", fontSize: "10px" }}>
              {data.customerName || "Müşteri Adı"}
            </span>
          </div>

          {/* Intro */}
          <p style={{ color: "#6b7280", fontSize: "8px", lineHeight: "1.5", marginBottom: "14px" }}>
            {data.introText}
          </p>

          {/* Line Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "4px 3px", fontSize: "8px", fontWeight: "bold", color: "#374151" }}>AÇIKLAMA</th>
                <th style={{ textAlign: "center", padding: "4px 3px", fontSize: "8px", fontWeight: "bold", color: "#374151" }}>MİKTAR</th>
                <th style={{ textAlign: "right", padding: "4px 3px", fontSize: "8px", fontWeight: "bold", color: "#374151" }}>BİRİM FİYAT</th>
                <th style={{ textAlign: "right", padding: "4px 3px", fontSize: "8px", fontWeight: "bold", color: "#374151" }}>TOPLAM</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 3px", fontSize: "8px", color: "#374151" }}>{item.description || "-"}</td>
                  <td style={{ padding: "4px 3px", fontSize: "8px", color: "#374151", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "4px 3px", fontSize: "8px", color: "#374151", textAlign: "right" }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ padding: "4px 3px", fontSize: "8px", color: "#374151", textAlign: "right" }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
            <div
              style={{
                border: "2px solid hsl(352, 62%, 50%)",
                borderRadius: "6px",
                padding: "4px 12px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <span style={{ color: "hsl(352, 62%, 50%)", fontWeight: "bold", fontSize: "9px" }}>GENEL TOPLAM:</span>
              <span style={{ color: "hsl(352, 62%, 50%)", fontWeight: "bold", fontSize: "11px" }}>
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>

          {/* Kit Lists */}
          {hasKitLists &&
            data.lineItems.map(
              (item, itemIndex) =>
                item.kitList.length > 0 && (
                  <div key={item.id} style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        borderBottom: "2px solid #e5e7eb",
                        paddingBottom: "3px",
                        marginBottom: "4px",
                      }}
                    >
                      <span style={{ fontWeight: "bold", fontSize: "9px", color: "#1f2937" }}>
                        {itemIndex + 1}. {item.description || `Kalem ${itemIndex + 1}`}
                      </span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f3f4f6" }}>
                          <th style={{ textAlign: "left", padding: "3px 3px", fontWeight: "bold", color: "#374151" }}>MODÜL</th>
                          <th style={{ textAlign: "left", padding: "3px 3px", fontWeight: "bold", color: "#374151" }}>AÇIKLAMA</th>
                          {data.showSkuColumn && (
                            <th style={{ textAlign: "left", padding: "3px 3px", fontWeight: "bold", color: "#374151" }}>SKU</th>
                          )}
                          {data.showTaxColumn && (
                            <th style={{ textAlign: "left", padding: "3px 3px", fontWeight: "bold", color: "#374151" }}>VERGİ TÜRÜ</th>
                          )}
                          <th style={{ textAlign: "center", padding: "3px 3px", fontWeight: "bold", color: "#374151" }}>ADET</th>
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
                            <td style={{ padding: "3px 3px", color: "#374151", fontWeight: kitItem.module ? "600" : "normal" }}>
                              {kitItem.module || "-"}
                            </td>
                            <td style={{ padding: "3px 3px", color: "#6b7280" }}>{kitItem.description || "-"}</td>
                            {data.showSkuColumn && (
                              <td style={{ padding: "3px 3px", color: "#6b7280" }}>{kitItem.sku || "-"}</td>
                            )}
                            {data.showTaxColumn && (
                              <td style={{ padding: "3px 3px", color: "#6b7280" }}>{kitItem.taxType || "-"}</td>
                            )}
                            <td style={{ padding: "3px 3px", color: "#374151", textAlign: "center" }}>{kitItem.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div
                      style={{
                        backgroundColor: "#e5e7eb",
                        padding: "2px 6px",
                        fontSize: "7px",
                        color: "#6b7280",
                      }}
                    >
                      Toplam {item.kitList.length} kalem
                    </div>
                  </div>
                )
            )}

          {/* Payment Terms - first page only content */}
          <div style={{ marginBottom: "10px" }}>
            <h3 style={{ fontWeight: "bold", fontSize: "10px", color: "#1f2937", marginBottom: "3px" }}>
              FİYATLAR VE ÖDEME
            </h3>
            <hr style={{ borderColor: "#d1d5db", marginBottom: "4px" }} />
            <p style={{ color: "#6b7280", fontSize: "8px", lineHeight: "1.5", whiteSpace: "pre-line" }}>
              {data.paymentTerms}
            </p>
          </div>

          {/* Validity + Contact Info side by side */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: "bold", fontSize: "10px", color: "#1f2937", marginBottom: "3px" }}>
                GEÇERLİLİK SÜRESİ
              </h3>
              <hr style={{ borderColor: "#d1d5db", marginBottom: "4px" }} />
              <p style={{ color: "#6b7280", fontSize: "8px" }}>{data.validityPeriod}</p>
            </div>
            
            {/* Contact Info */}
            {(data.contactName || data.contactTitle || data.contactPhone || data.contactEmail) && (
              <div style={{ textAlign: "right", minWidth: "160px" }}>
                <h3 style={{ fontWeight: "bold", fontSize: "10px", color: "#1f2937", marginBottom: "3px" }}>
                  YETKİLİ BİLGİLERİ
                </h3>
                <hr style={{ borderColor: "#d1d5db", marginBottom: "4px" }} />
                {data.contactName && (
                  <p style={{ color: "#374151", fontSize: "8px", fontWeight: "600" }}>{data.contactName}</p>
                )}
                {data.contactTitle && (
                  <p style={{ color: "#6b7280", fontSize: "8px", fontStyle: "italic" }}>{data.contactTitle}</p>
                )}
                {data.contactPhone && (
                  <p style={{ color: "#6b7280", fontSize: "8px" }}>{data.contactPhone}</p>
                )}
                {data.contactEmail && (
                  <p style={{ color: "#6b7280", fontSize: "8px" }}>{data.contactEmail}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer Note */}
          {data.footerText && (
            <p style={{ color: "#9ca3af", fontSize: "7px", fontStyle: "italic", lineHeight: "1.5", marginBottom: "10px" }}>
              {data.footerText}
            </p>
          )}

          {/* Additional Notes */}
          {data.additionalNotes && (
            <div style={{ marginBottom: "10px" }}>
              <h3 style={{ fontWeight: "bold", fontSize: "10px", color: "#1f2937", marginBottom: "3px" }}>
                İLAVE NOTLAR
              </h3>
              <hr style={{ borderColor: "#d1d5db", marginBottom: "4px" }} />
              <p style={{ color: "#6b7280", fontSize: "8px", lineHeight: "1.5" }}>
                {data.additionalNotes}
              </p>
            </div>
          )}

          {/* Company Footer */}
          <div style={{ textAlign: "right", marginTop: "16px" }}>
            <p style={{ color: "#6b7280", fontSize: "8px", fontStyle: "italic" }}>
              Avasya Teknoloji San. Ve Dış
            </p>
            <p style={{ color: "#6b7280", fontSize: "8px", fontStyle: "italic" }}>
              Tic. Ltd. Şti.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

ProposalPreview.displayName = "ProposalPreview";

export default ProposalPreview;
