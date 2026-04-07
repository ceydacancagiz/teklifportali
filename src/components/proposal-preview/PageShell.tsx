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
      <div style={{ position: "relative", width: "100%", height: `${HEADER_HEIGHT}px`, lineHeight: 0 }}>
        <img
          src={headerBanner}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "48px",
            fontSize: "11px",
            fontWeight: 600,
            color: "hsl(0 0% 0%)",
            lineHeight: 1.2,
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

      <div style={{ width: "100%", height: `${FOOTER_HEIGHT}px`, lineHeight: 0 }}>
        <img
          src={footerBanner}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
        />
      </div>
    </div>
  );
}
