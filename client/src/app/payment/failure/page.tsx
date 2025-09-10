import { Suspense } from "react";
import PaymentFailurePage from "./PaymentFailurePage";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PaymentFailurePage />
    </Suspense>
  );
}
