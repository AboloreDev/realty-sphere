import { Suspense } from "react";
import PaymentSuccessPage from "./PaymentSuccessPage";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PaymentSuccessPage />
    </Suspense>
  );
}
