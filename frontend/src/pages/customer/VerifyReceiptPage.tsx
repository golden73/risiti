import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { VerifyCard } from "@/components/customer/VerifyCard";

export default function VerifyReceiptPage() {
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Earn points"
        title="Verify a receipt"
        description="Enter the receipt ID from your ZRA Smart Invoice, or paste the QR link. Valid receipts earn points instantly."
      />
      <VerifyCard initialReceiptId={id} autoVerify={Boolean(id)} />
    </div>
  );
}