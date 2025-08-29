"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetCheckoutStatusQuery } from "@/state/api/paymemtApi";

const PaymentSuccessPage = () => {
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
      // Poll for a few seconds to ensure webhook has processed
      let attempts = 0;
      const maxAttempts = 10; // 30 seconds max

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
    // Redirect back to dashboard or wherever appropriate
    router.push("/dashboard/tenant/payments");
  };

  const handleViewPayment = () => {
    router.push(`/dashboard/tenant/invoices?paymentId=${paymentId}`);
  };

  if (!sessionId || !paymentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Payment Session
          </h1>
          <p className="text-gray-600 mb-6">
            Missing session or payment information.
          </p>
          <button
            onClick={() => router.push("/dashboard/tenant")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {isVerifying ? (
          // Verification in progress
          <>
            <div className="text-blue-600 mb-4">
              <div className="animate-spin w-16 h-16 mx-auto border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying Payment
            </h1>
            <p className="text-gray-600 mb-4">
              Please wait while we confirm your payment...
            </p>
            <p className="text-sm text-gray-500">
              Session ID: {sessionId.slice(-10)}
            </p>
          </>
        ) : checkoutStatus?.data?.payment.paymentStatus === "paid" ? (
          // Payment confirmed
          <>
            <div className="text-green-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-2">
              Your payment has been processed successfully.
            </p>

            {checkoutStatus.data.payment.amountPaid && (
              <p className="text-lg font-semibold text-green-600 mb-6">
                Amount Paid: $
                {checkoutStatus.data.payment.amountPaid.toLocaleString()}
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={handleViewPayment}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                View Payment Details
              </button>
              <button
                onClick={handleContinue}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
              >
                Return to Dashboard
              </button>
            </div>
          </>
        ) : (
          // Payment not confirmed yet
          <>
            <div className="text-yellow-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Processing
            </h1>
            <p className="text-gray-600 mb-4">
              Your payment is being processed. This may take a few minutes.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Current Status:{" "}
              {checkoutStatus?.data?.payment.paymentStatus || "Processing"}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Refresh Status
              </button>
              <button
                onClick={handleViewPayment}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
              >
                View Payment Page
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
