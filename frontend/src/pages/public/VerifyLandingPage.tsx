import { useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { VerifyCard } from "@/components/customer/VerifyCard";

/**
 * Public landing for scanned QR codes. QR payloads look like
 * `http://localhost:5173/verify?id=<receipt_id>`, so we read `id` and verify.
 */
export default function VerifyLandingPage() {
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";

  return (
    <PublicLayout>
      <div className="container-page py-10 sm:py-14">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            {id ? "Verify your scanned receipt" : "Verify a receipt"}
          </h1>
          <p className="mt-3 text-ink-500">
            {id
              ? "We've read the receipt from your QR code. Confirm your number to verify and earn points."
              : "Enter a receipt ID to check it against the simulated ZRA register and earn points."}
          </p>
        </div>
        <div className="mx-auto max-w-4xl">
          <VerifyCard initialReceiptId={id} autoVerify={Boolean(id)} />
        </div>
      </div>
    </PublicLayout>
  );
}