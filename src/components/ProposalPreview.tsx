import { forwardRef } from "react";
import type { ProposalData } from "@/types/proposal";
import ProposalFirstPage from "@/components/proposal-preview/ProposalFirstPage";
import ProposalKitListPages from "@/components/proposal-preview/ProposalKitListPages";

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

    return (
      <div ref={ref}>
        <ProposalFirstPage data={data} formatCurrency={formatCurrency} calculateTotal={calculateTotal} />
        <ProposalKitListPages data={data} />
      </div>
    );
  }
);

ProposalPreview.displayName = "ProposalPreview";

export default ProposalPreview;
