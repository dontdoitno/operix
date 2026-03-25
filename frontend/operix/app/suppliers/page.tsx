import { Suspense } from "react";

import SuppliersPageClient from "./suppliers-page-client";

export default function SuppliersPage() {
  return (
    <Suspense>
      <SuppliersPageClient />
    </Suspense>
  );
}
