import { Suspense } from "react";
import SearchPage from "./SearchPage";

export default function SearchPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <SearchPage />
    </Suspense>
  );
}
