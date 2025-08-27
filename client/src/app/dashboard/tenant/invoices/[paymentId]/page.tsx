"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  useCreateCheckoutSessionMutation,
  useGetCheckoutStatusQuery,
} from "@/state/api/paymemtApi";
import { toast } from "sonner";

const PaymentPage = () => {
  const searchParams = useSearchParams();

  // Get paymentId from query parameter: ?paymentId=123
  const paymentId = searchParams.get("paymentId");

  console.log("Payment ID from URL:", paymentId);

  const [createCheckoutSession, { isLoading, error }] =
    useCreateCheckoutSessionMutation();

  const { data: checkoutStatus, refetch } = useGetCheckoutStatusQuery(
    Number(paymentId),
    { skip: !paymentId }
  );

  console.log("Checkout Status:", checkoutStatus);

  // Poll for status after redirect from Stripe
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId && paymentId) {
      const interval = setInterval(() => {
        refetch();
        if (checkoutStatus?.data?.payment.paymentStatus === "Paid") {
          clearInterval(interval);
          alert("Payment completed successfully!");
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [checkoutStatus, refetch, searchParams, paymentId]);

  const handlePayment = async () => {
    if (!paymentId) {
      toast.error("Payment ID not found");
      return;
    }

    try {
      const response = await createCheckoutSession(Number(paymentId)).unwrap();
      if (response.success && response?.data?.checkoutUrl) {
        window.location.href = response?.data?.checkoutUrl;
      }
    } catch (err) {
      console.error("Failed to create checkout session:", err);
      toast.error("Error initiating payment. Please try again.");
    }
  };

  // Handle case where payment ID is missing
  if (!paymentId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Payment ID Missing
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Unable to load payment information. Please try again.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Complete Payment
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Payment ID: {paymentId}
            </p>
          </div>

          {/* Payment Details */}
          {checkoutStatus?.data && (
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount Due
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    ${checkoutStatus.data.payment.amountPaid?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      checkoutStatus.data.payment.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {checkoutStatus.data.payment.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Action */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Processing...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-red-600 mb-4">
                  Error: {(error as any)?.data?.error || "An error occurred"}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-red-900 bg-red-100 border border-transparent rounded-md hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handlePayment}
                  disabled={
                    isLoading ||
                    checkoutStatus?.data?.payment.paymentStatus === "Paid"
                  }
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {checkoutStatus?.data?.payment.paymentStatus === "Paid" ? (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Payment Completed
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Pay Now
                    </>
                  )}
                </button>

                {checkoutStatus?.data?.payment.paymentStatus !== "Paid" && (
                  <p className="mt-2 text-sm text-gray-500">
                    You will be redirected to a secure payment page
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Status Info */}
        {checkoutStatus?.data?.session && (
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Session Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Status:</span>
                  <span className="font-medium">
                    {checkoutStatus.data.session.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium">
                    {checkoutStatus.data.session.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
