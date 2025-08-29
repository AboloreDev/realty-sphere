"use client";

import { useSearchParams, useRouter } from "next/navigation";

const PaymentCancelPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get("payment_id");

  const handleTryAgain = () => {
    if (paymentId) {
      router.push(`/dashboard/tenant/invoices?paymentId=${paymentId}`);
    } else {
      router.push("/dashboard/tenant/payments");
    }
  };

  const handleReturnToDashboard = () => {
    router.push("/dashboard/tenant");
  };

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
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        {paymentId && (
          <p className="text-sm text-gray-500 mb-6">Payment ID: {paymentId}</p>
        )}

        <div className="space-y-3">
          {paymentId && (
            <button
              onClick={handleTryAgain}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Try Payment Again
            </button>
          )}
          <button
            onClick={handleReturnToDashboard}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          >
            Return to Dashboard
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team for assistance with your
            payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
