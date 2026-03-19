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
      <div
        ref={ref}
        style={{
          width: "794px",
          backgroundColor: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "11px",
          lineHeight: "1.4",
          color: "#000000",
        }}
      >
        <div style={{ padding: "24px 32px" }}>
          {/* Date */}
          <div style={{ textAlign: "right", fontSize: "11px", marginBottom: "12px" }}>
            {data.date}
          </div>

          {/* Customer */}
          <div style={{ marginBottom: "12px" }}>
            <span style={{ fontSize: "12px" }}>Sayın </span>
            <span style={{ fontWeight: "bold", fontSize: "12px" }}>
              {data.customerName || "Müşteri Adı"}
            </span>
          </div>

          {/* Intro */}
          <p style={{ fontSize: "10px", lineHeight: "1.5", marginBottom: "16px" }}>
            {data.introText}
          </p>

          {/* Line Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #000" }}>
                <th style={{ textAlign: "left", padding: "5px 4px", fontSize: "10px", fontWeight: "bold" }}>AÇIKLAMA</th>
                <th style={{ textAlign: "center", padding: "5px 4px", fontSize: "10px", fontWeight: "bold", width: "80px" }}>MİKTAR</th>
                <th style={{ textAlign: "right", padding: "5px 4px", fontSize: "10px", fontWeight: "bold", width: "100px" }}>BİRİM FİYAT</th>
                <th style={{ textAlign: "right", padding: "5px 4px", fontSize: "10px", fontWeight: "bold", width: "100px" }}>TOPLAM</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "4px 4px", fontSize: "10px" }}>{item.description || "-"}</td>
                  <td style={{ padding: "4px 4px", fontSize: "10px", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "4px 4px", fontSize: "10px", textAlign: "right" }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ padding: "4px 4px", fontSize: "10px", textAlign: "right" }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <div
              style={{
                border: "2px solid hsl(352, 62%, 50%)",
                borderRadius: "6px",
                padding: "6px 16px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <span style={{ color: "hsl(352, 62%, 50%)", fontWeight: "bold", fontSize: "11px" }}>GENEL TOPLAM:</span>
              <span style={{ color: "hsl(352, 62%, 50%)", fontWeight: "bold", fontSize: "14px" }}>
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>

          {/* Payment Terms - first page only */}
          <div data-first-page-only="true" style={{ marginBottom: "12px" }}>
            <h3 style={{ fontWeight: "bold", fontSize: "11px", marginBottom: "3px" }}>
              FİYATLAR VE ÖDEME
            </h3>
            <hr style={{ borderColor: "#999", marginBottom: "4px" }} />
            <p style={{ fontSize: "9px", lineHeight: "1.5", whiteSpace: "pre-line" }}>
              {data.paymentTerms}
            </p>
          </div>

          {/* Validity + Contact Info side by side */}
          <div data-first-page-only="true" style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", gap: "24px" }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: "bold", fontSize: "11px", marginBottom: "3px" }}>
                GEÇERLİLİK SÜRESİ
              </h3>
              <hr style={{ borderColor: "#999", marginBottom: "4px" }} />
              <p style={{ fontSize: "9px" }}>{data.validityPeriod}</p>
            </div>

            {/* Contact Info */}
            {(data.contactName || data.contactTitle || data.contactPhone || data.contactEmail) && (
              <div style={{ textAlign: "right", minWidth: "180px" }}>
                <h3 style={{ fontWeight: "bold", fontSize: "11px", marginBottom: "3px" }}>
                  YETKİLİ BİLGİLERİ
                </h3>
                <hr style={{ borderColor: "#999", marginBottom: "4px" }} />
                {data.contactName && (
                  <p style={{ fontSize: "9px", fontWeight: "600" }}>{data.contactName}</p>
                )}
                {data.contactTitle && (
                  <p style={{ fontSize: "9px", fontStyle: "italic" }}>{data.contactTitle}</p>
                )}
                {data.contactPhone && (
                  <p style={{ fontSize: "9px" }}>{data.contactPhone}</p>
                )}
                {data.contactEmail && (
                  <p style={{ fontSize: "9px" }}>{data.contactEmail}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer Note - first page only */}
          {data.footerText && (
            <p data-first-page-only="true" style={{ fontSize: "8px", fontStyle: "italic", lineHeight: "1.5", marginBottom: "16px" }}>
              {data.footerText}
            </p>
          )}

          {/* Kit Lists */}
          {hasKitLists &&
            data.lineItems.map(
              (item, itemIndex) =>
                item.kitList.length > 0 && (
                  <div key={item.id} data-kit-section="true" style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        borderBottom: "2px solid #000",
                        paddingBottom: "3px",
                        marginBottom: "2px",
                      }}
                    >
                      <span style={{ fontWeight: "bold", fontSize: "10px" }}>
                        {itemIndex + 1}. {item.description || `Kalem ${itemIndex + 1}`}
                      </span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#e8e8e8", lineHeight: "1.6" }}>
                          <th style={{ textAlign: "left", padding: "2px 3px", fontWeight: "bold", fontSize: "8px" }}>MODÜL</th>
                          <th style={{ textAlign: "left", padding: "2px 3px", fontWeight: "bold", fontSize: "8px" }}>AÇIKLAMA</th>
                          {data.showSkuColumn && (
                            <th style={{ textAlign: "left", padding: "2px 3px", fontWeight: "bold", fontSize: "8px" }}>SKU</th>
                          )}
                          {data.showTaxColumn && (
                            <th style={{ textAlign: "left", padding: "2px 3px", fontWeight: "bold", fontSize: "8px" }}>VERGİ TÜRÜ</th>
                          )}
                          <th style={{ textAlign: "center", padding: "2px 3px", fontWeight: "bold", fontSize: "8px", width: "40px" }}>ADET</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.kitList.map((kitItem, kitIndex) => (
                          <tr
                            key={kitIndex}
                            style={{
                              borderBottom: "1px solid #ddd",
                              backgroundColor: kitIndex % 2 === 0 ? "#ffffff" : "#f5f5f5",
                              lineHeight: "1.6",
                              verticalAlign: "middle",
                            }}
                          >
                            <td style={{ padding: "3px 3px", fontSize: "8px", fontWeight: kitItem.module ? "600" : "normal", verticalAlign: "middle" }}>
                              {kitItem.module || "-"}
                            </td>
                            <td style={{ padding: "2px 3px", fontSize: "8px" }}>{kitItem.description || "-"}</td>
                            {data.showSkuColumn && (
                              <td style={{ padding: "2px 3px", fontSize: "8px" }}>{kitItem.sku || "-"}</td>
                            )}
                            {data.showTaxColumn && (
                              <td style={{ padding: "2px 3px", fontSize: "8px" }}>{kitItem.taxType || "-"}</td>
                            )}
                            <td style={{ padding: "2px 3px", fontSize: "8px", textAlign: "center" }}>{kitItem.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div
                      style={{
                        backgroundColor: "#e0e0e0",
                        padding: "2px 6px",
                        fontSize: "8px",
                      }}
                    >
                      Toplam {item.kitList.length} kalem
                    </div>
                  </div>
                )
            )}

          {/* Additional Notes */}
          {data.additionalNotes && (
            <div style={{ marginBottom: "12px" }}>
              <h3 style={{ fontWeight: "bold", fontSize: "11px", marginBottom: "3px" }}>
                İLAVE NOTLAR
              </h3>
              <hr style={{ borderColor: "#999", marginBottom: "4px" }} />
              <p style={{ fontSize: "9px", lineHeight: "1.5" }}>
                {data.additionalNotes}
              </p>
            </div>
          )}

          {/* Company Footer */}
          <div style={{ textAlign: "right", marginTop: "16px" }}>
            <p style={{ fontSize: "9px", fontStyle: "italic" }}>
              Avasya Teknoloji San. Ve Dış
            </p>
            <p style={{ fontSize: "9px", fontStyle: "italic" }}>
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
