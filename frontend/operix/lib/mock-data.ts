export type RequestStatus = "Pending" | "Approved" | "Rejected" | "In Review";
export type OrderStatus = "Draft" | "Confirmed" | "Delivered" | "Delayed";

export interface PurchaseRequest {
  id: string;
  title: string;
  department: string;
  requester: string;
  amount: number;
  submittedAt: string;
  status: RequestStatus;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contact: string;
  performance: number;
  activeOrders: number;
}

export interface Order {
  id: string;
  supplier: string;
  requestId: string;
  total: number;
  expectedDate: string;
  status: OrderStatus;
}

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: "REQ-1042",
    title: "Engineering Laptops",
    department: "Engineering",
    requester: "Maya Chen",
    amount: 18400,
    submittedAt: "2026-03-01",
    status: "In Review",
    description:
      "Procurement request for 8 development laptops for new backend and data hires.",
  },
  {
    id: "REQ-1038",
    title: "Office Chairs",
    department: "Operations",
    requester: "Liam Brooks",
    amount: 6200,
    submittedAt: "2026-02-26",
    status: "Approved",
    description:
      "Replace ergonomic chairs on the 3rd floor due to wear and compliance recommendations.",
  },
  {
    id: "REQ-1035",
    title: "Marketing Campaign Assets",
    department: "Marketing",
    requester: "Ava Patel",
    amount: 9100,
    submittedAt: "2026-02-23",
    status: "Pending",
    description:
      "Design and print materials for Q2 partner campaign launch across 4 regions.",
  },
  {
    id: "REQ-1029",
    title: "Warehouse Scanner Devices",
    department: "Logistics",
    requester: "Noah Evans",
    amount: 12500,
    submittedAt: "2026-02-20",
    status: "Rejected",
    description:
      "Handheld scanners upgrade proposal; rejected due to budget freeze in current quarter.",
  },
];

export const suppliers: Supplier[] = [
  {
    id: "SUP-201",
    name: "Nova Industrial",
    category: "Hardware",
    contact: "ops@novaindustrial.com",
    performance: 96,
    activeOrders: 4,
  },
  {
    id: "SUP-185",
    name: "Paperlane Studio",
    category: "Marketing",
    contact: "hello@paperlane.studio",
    performance: 91,
    activeOrders: 2,
  },
  {
    id: "SUP-163",
    name: "ErgoTech Furnishings",
    category: "Office",
    contact: "support@ergotech.co",
    performance: 88,
    activeOrders: 3,
  },
  {
    id: "SUP-147",
    name: "Lumen Logistics",
    category: "Distribution",
    contact: "team@lumenlogistics.com",
    performance: 94,
    activeOrders: 5,
  },
];

export const orders: Order[] = [
  {
    id: "ORD-8801",
    supplier: "Nova Industrial",
    requestId: "REQ-1042",
    total: 18400,
    expectedDate: "2026-03-18",
    status: "Confirmed",
  },
  {
    id: "ORD-8794",
    supplier: "ErgoTech Furnishings",
    requestId: "REQ-1038",
    total: 6200,
    expectedDate: "2026-03-15",
    status: "Delivered",
  },
  {
    id: "ORD-8781",
    supplier: "Paperlane Studio",
    requestId: "REQ-1035",
    total: 9100,
    expectedDate: "2026-03-22",
    status: "Draft",
  },
  {
    id: "ORD-8769",
    supplier: "Lumen Logistics",
    requestId: "REQ-1029",
    total: 12500,
    expectedDate: "2026-03-12",
    status: "Delayed",
  },
];
