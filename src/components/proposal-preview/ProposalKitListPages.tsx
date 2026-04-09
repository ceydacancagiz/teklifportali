import type { ProposalData } from "@/types/proposal";
import { getKitListMetrics, paginateKitListSections } from "@/lib/proposal-layout";
import PageShell from "@/components/proposal-preview/PageShell";

interface Props {
  data: ProposalData;
}

export default function ProposalKitListPages({ data }: Props) {
  const pages = paginateKitListSections(data.lineItems, data.kitListScale);
  const baseMetrics = getKitListMetrics(data.kitListScale);

  if (pages.length === 0 && !data.additionalNotes) {
    return null;
  }

  return (
    <>
      {pages.map((page, pageIndex) => (
        <PageShell key={`kit-page-${pageIndex + 1}`} dataPage={`kit-${pageIndex + 2}`} date={data.date}>
          <div
            style={{
              padding: `${baseMetrics.pagePaddingY}px ${baseMetrics.pagePaddingX}px`,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: `${baseMetrics.sectionGap}px`,
              boxSizing: "border-box",
            }}
          >
            {page.map(({ item, scale }, itemIndex) => {
              const metrics = getKitListMetrics(scale);

              return (
                <div key={item.id} data-kit-section="true">
                  <div
                    style={{
                      borderBottom: "2px solid hsl(0 0% 0%)",
                      paddingBottom: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: `${metrics.titleFontSize}px` }}>
                      {data.lineItems.findIndex((lineItem) => lineItem.id === item.id) + 1}. {item.description || `Kalem ${itemIndex + 1}`}
                    </span>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "hsl(0 0% 91%)", lineHeight: 1.6 }}>
                        <th style={{ textAlign: "left", padding: `${metrics.cellPaddingY}px ${metrics.cellPaddingX}px`, fontWeight: 700, fontSize: `${metrics.cellFontSize}px` }}>MODÜL</th>
                        <th style={{ textAlign: "left", padding: `${metrics.cellPaddingY}px ${metrics.cellPaddingX}px`, fontWeight: 700, fontSize: `${metrics.cellFontSize}px` }}>AÇIKLAMA</th>
                        {data.showSkuColumn && (
                          <th style={{ textAlign: "left", padding: `${metrics.cellPaddingY}px ${metrics.cellPaddingX}px`, fontWeight: 700, fontSize: `${metrics.cellFontSize}px` }}>SKU</th>
                        )}
                        {data.showTaxColumn && (
                          <th style={{ textAlign: "left", padding: `${metrics.cellPaddingY}px ${metrics.cellPaddingX}px`, fontWeight: 700, fontSize: `${metrics.cellFontSize}px` }}>VERGİ TÜRÜ</th>
                        )}
                        <th style={{ textAlign: "center", padding: `${metrics.cellPaddingY}px ${metrics.cellPaddingX}px`, fontWeight: 700, fontSize: `${metrics.cellFontSize}px`, width: `${40 * scale}px` }}>ADET</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.kitList.map((kitItem, kitIndex) => (
                        <tr
                          key={`${item.id}-${kitIndex}`}
                          style={{
                            borderBottom: "1px solid hsl(0 0% 86%)",
                            backgroundColor: kitIndex % 2 === 0 ? "hsl(0 0% 100%)" : "hsl(0 0% 96%)",
                            height: `${metrics.rowHeight}px`,
                            lineHeight: 1.4,
                            verticalAlign: "middle",
                          }}
                        >
                          <td style={{ padding: `${metrics.cellPaddingY}px ${metrics.cellPaddingX}px`, fontSize: `${metrics.cellFontSize}px`, fontWeight: 700, verticalAlign: "middle" }}>
                            {kitItem.module || "-"}
                          </td>
                          <td style={{ padding: `${metrics.cellPaddingY}px ${metrics.cellPaddingX}px`, fontSize: `${metrics.cellFontSize}px`, fontWeight: 400, verticalAlign: "middle" }}>
                            {kitItem.description || "-"}
                          </td>
                          {data.showSkuColumn && (
                            <td style={{ padding: `${metrics.cellPaddingY}px ${metrics.cellPaddingX}px`, fontSize: `${metrics.cellFontSize}px`, verticalAlign: "middle" }}>{kitItem.sku || "-"}</td>
                          )}
                          {data.showTaxColumn && (
                            <td style={{ padding: `${metrics.cellPaddingY}px ${metrics.cellPaddingX}px`, fontSize: `${metrics.cellFontSize}px`, verticalAlign: "middle" }}>{kitItem.taxType || "-"}</td>
                          )}
                          <td style={{ padding: `${metrics.cellPaddingY}px ${metrics.cellPaddingX}px`, fontSize: `${metrics.cellFontSize}px`, textAlign: "center", verticalAlign: "middle" }}>
                            {kitItem.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ backgroundColor: "hsl(0 0% 88%)", padding: `2px 6px`, fontSize: `${metrics.cellFontSize}px` }}>
                    Toplam {item.kitList.length} kalem
                  </div>
                </div>
              );
            })}
          </div>
        </PageShell>
      ))}

      {data.additionalNotes && (
        <PageShell dataPage="notes" date={data.date}>
          <div style={{ padding: `${baseMetrics.pagePaddingY}px ${baseMetrics.pagePaddingX}px`, boxSizing: "border-box" }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "11px", marginBottom: "4px" }}>İLAVE NOTLAR</h3>
              <hr style={{ borderColor: "hsl(0 0% 65%)", marginBottom: "6px" }} />
              <p style={{ fontSize: "9px", lineHeight: 1.6 }}>{data.additionalNotes}</p>
            </div>
          </div>
        </PageShell>
      )}
    </>
  );
}
