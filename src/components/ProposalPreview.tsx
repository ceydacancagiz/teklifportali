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
      <div ref={ref} className="bg-card" style={{ fontSize: "8px", lineHeight: "1.3", color: "#000000" }}>
        <div style={{ padding: "16px 20px" }}>
          {/* Date */}
          <div style={{ textAlign: "right", fontSize: "8px", marginBottom: "8px" }}>
            {data.date}
          </div>

          {/* Customer */}
          <div style={{ marginBottom: "8px" }}>
            <span style={{ fontSize: "9px" }}>Sayın </span>
            <span style={{ fontWeight: "bold", fontSize: "9px" }}>
              {data.customerName || "Müşteri Adı"}
            </span>
          </div>

          {/* Intro */}
          <p style={{ fontSize: "7px", lineHeight: "1.4", marginBottom: "10px" }}>
            {data.introText}
          </p>

          {/* Line Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #000" }}>
                <th style={{ textAlign: "left", padding: "3px 2px", fontSize: "7px", fontWeight: "bold" }}>AÇIKLAMA</th>
                <th style={{ textAlign: "center", padding: "3px 2px", fontSize: "7px", fontWeight: "bold" }}>MİKTAR</th>
                <th style={{ textAlign: "right", padding: "3px 2px", fontSize: "7px", fontWeight: "bold" }}>BİRİM FİYAT</th>
                <th style={{ textAlign: "right", padding: "3px 2px", fontSize: "7px", fontWeight: "bold" }}>TOPLAM</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "3px 2px", fontSize: "7px" }}>{item.description || "-"}</td>
                  <td style={{ padding: "3px 2px", fontSize: "7px", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "3px 2px", fontSize: "7px", textAlign: "right" }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ padding: "3px 2px", fontSize: "7px", textAlign: "right" }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
            <div
              style={{
                border: "2px solid hsl(352, 62%, 50%)",
                borderRadius: "6px",
                padding: "3px 10px",
                display: "flex",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <span style={{ color: "hsl(352, 62%, 50%)", fontWeight: "bold", fontSize: "8px" }}>GENEL TOPLAM:</span>
              <span style={{ color: "hsl(352, 62%, 50%)", fontWeight: "bold", fontSize: "10px" }}>
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>

          {/* Payment Terms - right after total, first page only content */}
          <div data-first-page-only="true" style={{ marginBottom: "8px" }}>
            <h3 style={{ fontWeight: "bold", fontSize: "8px", marginBottom: "2px" }}>
              FİYATLAR VE ÖDEME
            </h3>
            <hr style={{ borderColor: "#999", marginBottom: "3px" }} />
            <p style={{ fontSize: "7px", lineHeight: "1.4", whiteSpace: "pre-line" }}>
              {data.paymentTerms}
            </p>
          </div>

          {/* Validity + Contact Info side by side */}
          <div data-first-page-only="true" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: "bold", fontSize: "8px", marginBottom: "2px" }}>
                GEÇERLİLİK SÜRESİ
              </h3>
              <hr style={{ borderColor: "#999", marginBottom: "3px" }} />
              <p style={{ fontSize: "7px" }}>{data.validityPeriod}</p>
            </div>
            
            {/* Contact Info */}
            {(data.contactName || data.contactTitle || data.contactPhone || data.contactEmail) && (
              <div style={{ textAlign: "right", minWidth: "140px" }}>
                <h3 style={{ fontWeight: "bold", fontSize: "8px", marginBottom: "2px" }}>
                  YETKİLİ BİLGİLERİ
                </h3>
                <hr style={{ borderColor: "#999", marginBottom: "3px" }} />
                {data.contactName && (
                  <p style={{ fontSize: "7px", fontWeight: "600" }}>{data.contactName}</p>
                )}
                {data.contactTitle && (
                  <p style={{ fontSize: "7px", fontStyle: "italic" }}>{data.contactTitle}</p>
                )}
                {data.contactPhone && (
                  <p style={{ fontSize: "7px" }}>{data.contactPhone}</p>
                )}
                {data.contactEmail && (
                  <p style={{ fontSize: "7px" }}>{data.contactEmail}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer Note - first page only */}
          {data.footerText && (
            <p data-first-page-only="true" style={{ fontSize: "6px", fontStyle: "italic", lineHeight: "1.4", marginBottom: "10px" }}>
              {data.footerText}
            </p>
          )}

          {/* Kit Lists - these go after the first-page-only content */}
          {hasKitLists &&
            data.lineItems.map(
              (item, itemIndex) =>
                item.kitList.length > 0 && (
                  <div key={item.id} data-kit-section="true" style={{ marginBottom: "8px", pageBreakInside: "avoid" }}>
                    <div
                      style={{
                        borderBottom: "1px solid #000",
                        paddingBottom: "2px",
                        marginBottom: "2px",
                      }}
                    >
                      <span style={{ fontWeight: "bold", fontSize: "7px" }}>
                        {itemIndex + 1}. {item.description || `Kalem ${itemIndex + 1}`}
                      </span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "6px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#e8e8e8" }}>
                          <th style={{ textAlign: "left", padding: "1px 2px", fontWeight: "bold" }}>MODÜL</th>
                          <th style={{ textAlign: "left", padding: "1px 2px", fontWeight: "bold" }}>AÇIKLAMA</th>
                          {data.showSkuColumn && (
                            <th style={{ textAlign: "left", padding: "1px 2px", fontWeight: "bold" }}>SKU</th>
                          )}
                          {data.showTaxColumn && (
                            <th style={{ textAlign: "left", padding: "1px 2px", fontWeight: "bold" }}>VERGİ TÜRÜ</th>
                          )}
                          <th style={{ textAlign: "center", padding: "1px 2px", fontWeight: "bold" }}>ADET</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.kitList.map((kitItem, kitIndex) => (
                          <tr
                            key={kitIndex}
                            style={{
                              borderBottom: "1px solid #ddd",
                              backgroundColor: kitIndex % 2 === 0 ? "white" : "#f5f5f5",
                            }}
                          >
                            <td style={{ padding: "1px 2px", fontWeight: kitItem.module ? "600" : "normal" }}>
                              {kitItem.module || "-"}
                            </td>
                            <td style={{ padding: "1px 2px" }}>{kitItem.description || "-"}</td>
                            {data.showSkuColumn && (
                              <td style={{ padding: "1px 2px" }}>{kitItem.sku || "-"}</td>
                            )}
                            {data.showTaxColumn && (
                              <td style={{ padding: "1px 2px" }}>{kitItem.taxType || "-"}</td>
                            )}
                            <td style={{ padding: "1px 2px", textAlign: "center" }}>{kitItem.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div
                      style={{
                        backgroundColor: "#e0e0e0",
                        padding: "1px 4px",
                        fontSize: "6px",
                      }}
                    >
                      Toplam {item.kitList.length} kalem
                    </div>
                  </div>
                )
            )}

          {/* Additional Notes */}
          {data.additionalNotes && (
            <div style={{ marginBottom: "8px" }}>
              <h3 style={{ fontWeight: "bold", fontSize: "8px", marginBottom: "2px" }}>
                İLAVE NOTLAR
              </h3>
              <hr style={{ borderColor: "#999", marginBottom: "3px" }} />
              <p style={{ fontSize: "7px", lineHeight: "1.4" }}>
                {data.additionalNotes}
              </p>
            </div>
          )}

          {/* Company Footer */}
          <div style={{ textAlign: "right", marginTop: "12px" }}>
            <p style={{ fontSize: "7px", fontStyle: "italic" }}>
              Avasya Teknoloji San. Ve Dış
            </p>
            <p style={{ fontSize: "7px", fontStyle: "italic" }}>
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
