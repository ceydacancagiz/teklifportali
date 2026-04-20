import type { ProposalData } from "@/types/proposal";
import { CONTENT_PAGE_HEIGHT } from "@/lib/proposal-layout";
import PageShell from "@/components/proposal-preview/PageShell";

interface Props {
  data: ProposalData;
  formatCurrency: (amount: number) => string;
  calculateTotal: () => number;
}

export default function ProposalFirstPage({ data, formatCurrency, calculateTotal }: Props) {
  const itemCount = data.lineItems.length;
  const contentGap = itemCount > 6 ? 16 : itemCount > 4 ? 20 : 24;
  const customerBottom = itemCount > 5 ? 16 : 24;
  const tableFontSize = itemCount > 6 ? 12 : 13;
  const tablePadding = itemCount > 6 ? "8px 6px" : "10px 6px";

  return (
    <PageShell dataPage="1" date={data.date}>
      <div
        style={{
          padding: "6px 38px 20px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: `${contentGap}px` }}>
          <div style={{ marginBottom: `${customerBottom}px` }}>
            <div style={{ fontSize: "18px", marginBottom: "6px", fontWeight: 600 }}>Sayın</div>
            <div style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "0.2px", marginBottom: "12px" }}>
              {data.customerName || "Müşteri Adı"},
            </div>
            {data.introText && (
              <p style={{ fontSize: "12px", lineHeight: 1.7, fontWeight: 500, whiteSpace: "pre-line", maxWidth: "90%" }}>
                {data.introText}
              </p>
            )}
          </div>

          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid hsl(0 0% 0%)" }}>
                  <th style={{ textAlign: "left", padding: tablePadding, fontSize: "13px", fontWeight: 700 }}>AÇIKLAMA</th>
                  <th style={{ textAlign: "center", padding: tablePadding, fontSize: "13px", fontWeight: 700, width: "70px" }}>ADET</th>
                  <th style={{ textAlign: "right", padding: tablePadding, fontSize: "13px", fontWeight: 700, width: "100px" }}>BİRİM FİYAT</th>
                  <th style={{ textAlign: "right", padding: tablePadding, fontSize: "13px", fontWeight: 700, width: "100px" }}>TOPLAM</th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid hsl(0 0% 80%)" }}>
                    <td style={{ padding: tablePadding, fontSize: `${tableFontSize}px`, fontWeight: 700, verticalAlign: "middle", lineHeight: 1.5 }}>
                      {index + 1}. {item.description || "-"}
                    </td>
                    <td style={{ padding: tablePadding, fontSize: `${tableFontSize}px`, textAlign: "center", verticalAlign: "middle", lineHeight: 1.5 }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: tablePadding, fontSize: `${tableFontSize}px`, textAlign: "right", verticalAlign: "middle", lineHeight: 1.5 }}>
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td style={{ padding: tablePadding, fontSize: `${tableFontSize}px`, textAlign: "right", verticalAlign: "middle", lineHeight: 1.5 }}>
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid hsl(0 0% 0%)" }}>
                  <td colSpan={3} style={{ padding: "10px 6px 0", fontSize: "14px", fontWeight: 700, textAlign: "right" }}>
                    GENEL TOPLAM
                  </td>
                  <td style={{ padding: "10px 4px 0", textAlign: "right" }}>
                    <div style={{
                      display: "block",
                      border: "2.5px solid hsl(0 75% 42%)",
                      color: "hsl(0 75% 42%)",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: 700,
                      letterSpacing: "0.3px",
                      textAlign: "center",
                      verticalAlign: "middle",
                      whiteSpace: "nowrap",
                      padding: 0,
                      margin: "0 0 0 auto",
                      height: "36px",
                      minHeight: "36px",
                      width: "120px",
                      lineHeight: "36px",
                      boxSizing: "border-box",
                    }}>
                      {formatCurrency(calculateTotal())}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>FİYATLAR VE ÖDEME</h3>
              <hr style={{ borderColor: "hsl(0 0% 65%)", marginBottom: "10px" }} />
              <p style={{ fontSize: "12px", lineHeight: 1.6, whiteSpace: "pre-line", fontWeight: 500 }}>
                {data.paymentTerms}
              </p>
            </div>

            <div>
              <h3 style={{ fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>GEÇERLİLİK SÜRESİ</h3>
              <hr style={{ borderColor: "hsl(0 0% 65%)", marginBottom: "10px" }} />
              <p style={{ fontSize: "12px", lineHeight: 1.6, fontWeight: 500 }}>{data.validityPeriod}</p>
            </div>
          </div>

          {(data.contactName || data.contactTitle || data.contactPhone || data.contactEmail) && (
            <div style={{ alignSelf: "flex-end", marginLeft: "auto" }}>
              <h3 style={{ fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>ŞİRKET YETKİLİ BİLGİLERİ</h3>
              <hr style={{ borderColor: "hsl(0 0% 65%)", marginBottom: "10px" }} />
              {data.contactName && <p style={{ fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>{data.contactName}</p>}
              {data.contactTitle && <p style={{ fontSize: "12px", fontStyle: "italic", marginBottom: "4px" }}>{data.contactTitle}</p>}
              {data.contactPhone && <p style={{ fontSize: "12px", marginBottom: "4px" }}>{data.contactPhone}</p>}
              {data.contactEmail && <p style={{ fontSize: "12px" }}>{data.contactEmail}</p>}
            </div>
          )}

          {data.footerText && (
            <p style={{ fontSize: "10px", lineHeight: 1.6, fontWeight: 400, fontStyle: "italic", marginTop: "4px" }}>
              {data.footerText}
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
}
