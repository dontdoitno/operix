import { Suspense } from "react";

import { OrdersPageClient } from "@/components/orders/orders-page-client";

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersPageClient />
    </Suspense>
  );
}
