import type { ProposalData } from "@/types/proposal";
import { CONTENT_PAGE_HEIGHT, CONTENT_PAGE_WIDTH } from "@/lib/proposal-layout";

interface Props {
  data: ProposalData;
  formatCurrency: (amount: number) => string;
  calculateTotal: () => number;
}

const PAGE_STYLE: React.CSSProperties = {
  width: `${CONTENT_PAGE_WIDTH}px`,
  height: `${CONTENT_PAGE_HEIGHT}px`,
  backgroundColor: "hsl(0 0% 100%)",
  fontFamily: "Arial, Helvetica, sans-serif",
  color: "hsl(0 0% 0%)",
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden",
};

export default function ProposalFirstPage({ data, formatCurrency, calculateTotal }: Props) {
  const itemCount = data.lineItems.length;
  const contentGap = itemCount > 6 ? 18 : itemCount > 4 ? 22 : 28;
  const customerBottom = itemCount > 5 ? 18 : 28;
  const tableFontSize = itemCount > 6 ? 10 : 11;
  const tablePadding = itemCount > 6 ? "6px 4px" : "8px 4px";

  return (
    <div data-page="1" style={PAGE_STYLE}>
      <div
        style={{
          position: "absolute",
          top: "28px",
          right: "48px",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        {data.date}
      </div>

      <div
        style={{
          padding: "52px 48px 56px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: `${contentGap}px` }}>
          <div style={{ marginBottom: `${customerBottom}px` }}>
            <div style={{ fontSize: "15px", marginBottom: "8px", fontWeight: 600 }}>Sayın</div>
            <div style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "0.2px", marginBottom: "14px" }}>
              {data.customerName || "Müşteri Adı"},
            </div>
            {data.introText && (
              <p style={{ fontSize: "10px", lineHeight: 1.7, fontWeight: 500, whiteSpace: "pre-line", maxWidth: "90%" }}>
                {data.introText}
              </p>
            )}
          </div>

          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid hsl(0 0% 0%)" }}>
                  <th style={{ textAlign: "left", padding: tablePadding, fontSize: "11px", fontWeight: 700 }}>AÇIKLAMA</th>
                  <th style={{ textAlign: "center", padding: tablePadding, fontSize: "11px", fontWeight: 700, width: "70px" }}>ADET</th>
                  <th style={{ textAlign: "right", padding: tablePadding, fontSize: "11px", fontWeight: 700, width: "100px" }}>BİRİM FİYAT</th>
                  <th style={{ textAlign: "right", padding: tablePadding, fontSize: "11px", fontWeight: 700, width: "100px" }}>TOPLAM</th>
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
                  <td colSpan={3} style={{ padding: "10px 4px 0", fontSize: "12px", fontWeight: 700, textAlign: "right" }}>
                    GENEL TOPLAM
                  </td>
                  <td style={{ padding: "10px 4px 0", fontSize: "13px", fontWeight: 700, textAlign: "right" }}>
                    <span style={{
                      border: "2.5px solid hsl(0 75% 42%)",
                      color: "hsl(0 75% 42%)",
                      padding: "6px 16px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "0.3px",
                      lineHeight: 1,
                      minWidth: "100px",
                      textAlign: "center",
                    }}>
                      {formatCurrency(calculateTotal())}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "12px", marginBottom: "5px" }}>FİYATLAR VE ÖDEME</h3>
              <hr style={{ borderColor: "hsl(0 0% 65%)", marginBottom: "8px" }} />
              <p style={{ fontSize: "10px", lineHeight: 1.6, whiteSpace: "pre-line", fontWeight: 500 }}>
                {data.paymentTerms}
              </p>
            </div>

            <div>
              <h3 style={{ fontWeight: 700, fontSize: "12px", marginBottom: "5px" }}>GEÇERLİLİK SÜRESİ</h3>
              <hr style={{ borderColor: "hsl(0 0% 65%)", marginBottom: "8px" }} />
              <p style={{ fontSize: "10px", lineHeight: 1.6, fontWeight: 500 }}>{data.validityPeriod}</p>
            </div>
          </div>

          {(data.contactName || data.contactTitle || data.contactPhone || data.contactEmail) && (
            <div style={{ alignSelf: "flex-end", marginLeft: "auto" }}>
              <h3 style={{ fontWeight: 700, fontSize: "12px", marginBottom: "5px" }}>ŞİRKET YETKİLİ BİLGİLERİ</h3>
              <hr style={{ borderColor: "hsl(0 0% 65%)", marginBottom: "8px" }} />
              {data.contactName && <p style={{ fontSize: "10px", fontWeight: 700, marginBottom: "4px" }}>{data.contactName}</p>}
              {data.contactTitle && <p style={{ fontSize: "10px", fontStyle: "italic", marginBottom: "4px" }}>{data.contactTitle}</p>}
              {data.contactPhone && <p style={{ fontSize: "10px", marginBottom: "4px" }}>{data.contactPhone}</p>}
              {data.contactEmail && <p style={{ fontSize: "10px" }}>{data.contactEmail}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}