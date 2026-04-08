import headerBanner from "@/assets/header-banner.png";
import footerBanner from "@/assets/footer-banner.png";
import { CONTENT_PAGE_WIDTH, FULL_PAGE_HEIGHT, HEADER_HEIGHT, FOOTER_HEIGHT, CONTENT_PAGE_HEIGHT } from "@/lib/proposal-layout";

interface Props {
  dataPage: string;
  date: string;
  children: React.ReactNode;
}

export default function PageShell({ dataPage, date, children }: Props) {
  return (
    <div
      data-page={dataPage}
      style={{
        width: `${CONTENT_PAGE_WIDTH}px`,
        height: `${FULL_PAGE_HEIGHT}px`,
        backgroundColor: "hsl(0 0% 100%)",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "hsl(0 0% 0%)",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        width: "100%",
        height: `${HEADER_HEIGHT}px`,
        padding: "16px 40px 0",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <img
            src={headerBanner}
            alt=""
            style={{ height: "36px", objectFit: "contain", display: "block" }}
          />
          <div style={{ width: "60px", height: "2px", backgroundColor: "hsl(0 75% 45%)", marginTop: "4px" }} />
        </div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "hsl(0 0% 0%)",
            lineHeight: 1.2,
            paddingBottom: "4px",
          }}
        >
          Tarih : {date}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: `${CONTENT_PAGE_HEIGHT}px`,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      <div style={{ width: "100%", height: `${FOOTER_HEIGHT}px`, lineHeight: 0, padding: "0 8px 4px", boxSizing: "border-box" }}>
        <img
          src={footerBanner}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      </div>
    </div>
  );
}
