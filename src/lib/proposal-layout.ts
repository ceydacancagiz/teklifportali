import type { LineItem } from "@/types/proposal";

export const CONTENT_PAGE_WIDTH = 794;
export const HEADER_HEIGHT = 140;
export const FOOTER_HEIGHT = 110;
export const FULL_PAGE_HEIGHT = 1123; // A4 ratio at 794px width
export const CONTENT_PAGE_HEIGHT = FULL_PAGE_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT;

const KIT_LIST_BASE = {
  pagePaddingX: 32,
  pagePaddingY: 24,
  sectionGap: 18,
  titleFontSize: 10,
  cellFontSize: 8,
  cellPaddingY: 3,
  cellPaddingX: 3,
  sectionHeaderHeight: 26,
  tableHeaderHeight: 26,
  rowHeight: 20,
  summaryHeight: 20,
  notesHeight: 120,
};

export const clampKitListScale = (scale: number) => {
  if (Number.isNaN(scale)) return 1;
  return Math.min(1.15, Math.max(0.65, scale));
};

export const getKitListMetrics = (scale: number) => {
  const safeScale = clampKitListScale(scale);

  return {
    pagePaddingX: KIT_LIST_BASE.pagePaddingX,
    pagePaddingY: KIT_LIST_BASE.pagePaddingY,
    sectionGap: KIT_LIST_BASE.sectionGap * safeScale,
    titleFontSize: KIT_LIST_BASE.titleFontSize * safeScale,
    cellFontSize: KIT_LIST_BASE.cellFontSize * safeScale,
    cellPaddingY: KIT_LIST_BASE.cellPaddingY * safeScale,
    cellPaddingX: KIT_LIST_BASE.cellPaddingX * safeScale,
    sectionHeaderHeight: KIT_LIST_BASE.sectionHeaderHeight * safeScale,
    tableHeaderHeight: KIT_LIST_BASE.tableHeaderHeight * safeScale,
    rowHeight: KIT_LIST_BASE.rowHeight * safeScale,
    summaryHeight: KIT_LIST_BASE.summaryHeight * safeScale,
    notesHeight: KIT_LIST_BASE.notesHeight,
    availableHeight: CONTENT_PAGE_HEIGHT - KIT_LIST_BASE.pagePaddingY * 2,
  };
};

export const estimateKitListSectionHeight = (item: LineItem, scale: number) => {
  const metrics = getKitListMetrics(scale);

  return (
    metrics.sectionHeaderHeight +
    metrics.tableHeaderHeight +
    item.kitList.length * metrics.rowHeight +
    metrics.summaryHeight +
    8 * clampKitListScale(scale)
  );
};

export const getFittedKitListScale = (item: LineItem, scale: number) => {
  const safeScale = clampKitListScale(scale);
  const estimatedHeight = estimateKitListSectionHeight(item, safeScale);
  const { availableHeight } = getKitListMetrics(safeScale);

  if (estimatedHeight <= availableHeight) return safeScale;

  return clampKitListScale((safeScale * availableHeight * 0.98) / estimatedHeight);
};

export const paginateKitListSections = (lineItems: LineItem[], scale: number) => {
  const itemsWithKitList = lineItems.filter((item) => item.kitList.length > 0);
  const pages: Array<Array<{ item: LineItem; scale: number }>> = [];
  const { availableHeight } = getKitListMetrics(scale);

  let currentPage: Array<{ item: LineItem; scale: number }> = [];
  let usedHeight = 0;

  itemsWithKitList.forEach((item) => {
    const fittedScale = getFittedKitListScale(item, scale);
    const sectionHeight = estimateKitListSectionHeight(item, fittedScale);
    const gap = currentPage.length > 0 ? getKitListMetrics(scale).sectionGap : 0;

    if (currentPage.length > 0 && usedHeight + gap + sectionHeight > availableHeight) {
      pages.push(currentPage);
      currentPage = [{ item, scale: fittedScale }];
      usedHeight = sectionHeight;
      return;
    }

    currentPage.push({ item, scale: fittedScale });
    usedHeight += gap + sectionHeight;
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
};
