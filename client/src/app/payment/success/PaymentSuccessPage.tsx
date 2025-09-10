"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetCheckoutStatusQuery } from "@/state/api/paymemtApi";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  const sessionId = searchParams.get("session_id");
  const paymentId = searchParams.get("payment_id");

  const { data: checkoutStatus, refetch } = useGetCheckoutStatusQuery(
    Number(paymentId),
    { skip: !paymentId }
  );

  useEffect(() => {
    if (sessionId && paymentId) {
      let attempts = 0;
      const maxAttempts = 10;

      const pollInterval = setInterval(async () => {
        attempts++;
        await refetch();

        if (checkoutStatus?.data?.payment.paymentStatus === "paid") {
          setIsVerifying(false);
          clearInterval(pollInterval);
        } else if (attempts >= maxAttempts) {
          setIsVerifying(false);
          clearInterval(pollInterval);
        }
      }, 3000);

      return () => clearInterval(pollInterval);
    }
  }, [sessionId, paymentId, refetch, checkoutStatus]);

  const handleContinue = () => {
    router.push("/dashboard/tenant/payments");
  };

  const handleViewPayment = () => {
    router.push(`/dashboard/tenant/invoices?paymentId=${paymentId}`);
  };

  if (!sessionId || !paymentId) {
    return <p>Invalid payment session</p>;
  }

  return (
    <div>
      {isVerifying ? (
        <p>Verifying payment...</p>
      ) : checkoutStatus?.data?.payment.paymentStatus === "paid" ? (
        <p>Payment successful ✅</p>
      ) : (
        <p>Payment processing...</p>
      )}

      <button onClick={handleContinue}>Return to Dashboard</button>
      <button onClick={handleViewPayment}>View Payment</button>
    </div>
  );
}
