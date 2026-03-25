import { Suspense } from "react";

import RequestsPageClient from "./requests-page-client";

export default function RequestsPage() {
  return (
    <Suspense>
      <RequestsPageClient />
    </Suspense>
  );
}
