export type RequestStatus = "Ожидает" | "Одобрено" | "Отклонено" | "На согласовании";
export type OrderStatus =
  | "Черновик"
  | "Подтвержден"
  | "Доставлен"
  | "Задержан"
  | "Отклонен";

export interface PurchaseRequest {
  id: string;
  title: string;
  department: string;
  requester: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  requestedQuantity: number;
  unitPrice: number;
  amount: number;
  submittedAt: string;
  status: RequestStatus;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  industry: string;
  email: string;
  phone: string;
  performance: number;
  activeOrders: number;
}

export interface Order {
  id: string;
  supplier: string;
  companyName: string;
  requestId: string;
  total: number;
  createdAt: string;
  expectedDate: string;
  status: OrderStatus;
  approvedByManager: boolean;
}

export interface MerchandiseItem {
  id: string;
  supplierId: string;
  name: string;
  sku: string;
  availableQuantity: number;
  reservedQuantity: number;
  price: number;
  description: string;
  category: string;
  updatedAt: string;
}

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: "REQ-1042",
    title: "Ноутбуки для инженеров",
    department: "Инженерия",
    requester: "Maya Chen",
    supplierId: "SUP-201",
    supplierName: "Nova Industrial",
    productId: "MER-1001",
    productName: "Ноутбук Orion Pro 15",
    requestedQuantity: 8,
    unitPrice: 2300,
    amount: 18400,
    submittedAt: "2026-03-01",
    status: "На согласовании",
    description:
      "Заявка на закупку 8 ноутбуков для новых сотрудников backend и data-команд.",
  },
  {
    id: "REQ-1038",
    title: "Офисные кресла",
    department: "Операции",
    requester: "Liam Brooks",
    supplierId: "SUP-163",
    supplierName: "ErgoTech Furnishings",
    productId: "MER-3001",
    productName: "Эргономичное кресло ErgoFlex",
    requestedQuantity: 20,
    unitPrice: 310,
    amount: 6200,
    submittedAt: "2026-02-26",
    status: "Одобрено",
    description:
      "Замена эргономичных кресел на 3-м этаже из-за износа и требований по соответствию.",
  },
  {
    id: "REQ-1035",
    title: "Материалы для маркетинговой кампании",
    department: "Маркетинг",
    requester: "Ava Patel",
    supplierId: "SUP-185",
    supplierName: "Paperlane Studio",
    productId: "MER-2001",
    productName: "Баннерный комплект Promo A1",
    requestedQuantity: 75,
    unitPrice: 120,
    amount: 9000,
    submittedAt: "2026-02-23",
    status: "Ожидает",
    description:
      "Дизайн и печать материалов для запуска партнерской кампании Q2 в 4 регионах.",
  },
  {
    id: "REQ-1029",
    title: "Сканеры для склада",
    department: "Логистика",
    requester: "Noah Evans",
    supplierId: "SUP-147",
    supplierName: "Lumen Logistics",
    productId: "MER-4001",
    productName: "Ручной сканер Lumen ScanPro",
    requestedQuantity: 25,
    unitPrice: 500,
    amount: 12500,
    submittedAt: "2026-02-20",
    status: "Отклонено",
    description:
      "Предложение по обновлению ручных сканеров отклонено из-за заморозки бюджета в текущем квартале.",
  },
];

export const suppliers: Supplier[] = [
  {
    id: "SUP-201",
    name: "Nova Industrial",
    category: "Оборудование",
    industry: "Оборудование",
    email: "ops@novaindustrial.com",
    phone: "+7 (495) 101-11-01",
    performance: 96,
    activeOrders: 4,
  },
  {
    id: "SUP-185",
    name: "Paperlane Studio",
    category: "Маркетинг",
    industry: "Маркетинг",
    email: "hello@paperlane.studio",
    phone: "+7 (495) 202-22-02",
    performance: 91,
    activeOrders: 2,
  },
  {
    id: "SUP-163",
    name: "ErgoTech Furnishings",
    category: "Офис",
    industry: "Офисная мебель",
    email: "support@ergotech.co",
    phone: "+7 (495) 303-33-03",
    performance: 88,
    activeOrders: 3,
  },
  {
    id: "SUP-147",
    name: "Lumen Logistics",
    category: "Дистрибуция",
    industry: "Складская логистика",
    email: "team@lumenlogistics.com",
    phone: "+7 (495) 404-44-04",
    performance: 94,
    activeOrders: 5,
  },
];

export const orders: Order[] = [
  {
    id: "ORD-8801",
    supplier: "Nova Industrial",
    companyName: "Орион Тех",
    requestId: "REQ-1042",
    total: 18400,
    createdAt: "2026-03-02",
    expectedDate: "2026-03-18",
    status: "Подтвержден",
    approvedByManager: true,
  },
  {
    id: "ORD-8794",
    supplier: "ErgoTech Furnishings",
    companyName: "Орион Тех",
    requestId: "REQ-1038",
    total: 6200,
    createdAt: "2026-02-27",
    expectedDate: "2026-03-15",
    status: "Доставлен",
    approvedByManager: true,
  },
  {
    id: "ORD-8781",
    supplier: "Paperlane Studio",
    companyName: "Орион Тех",
    requestId: "REQ-1035",
    total: 9100,
    createdAt: "2026-02-24",
    expectedDate: "2026-03-22",
    status: "Черновик",
    approvedByManager: false,
  },
  {
    id: "ORD-8769",
    supplier: "Lumen Logistics",
    companyName: "Орион Тех",
    requestId: "REQ-1029",
    total: 12500,
    createdAt: "2026-02-22",
    expectedDate: "2026-03-12",
    status: "Задержан",
    approvedByManager: false,
  },
  {
    id: "ORD-8810",
    supplier: "Nova Industrial",
    companyName: "Орион Тех",
    requestId: "REQ-1038",
    total: 5600,
    createdAt: "2026-03-05",
    expectedDate: "2026-03-20",
    status: "Подтвержден",
    approvedByManager: true,
  },
];

export const merchandise: MerchandiseItem[] = [
  {
    id: "MER-1001",
    supplierId: "SUP-201",
    name: "Ноутбук Orion Pro 15",
    sku: "ORION-NB-15",
    availableQuantity: 42,
    reservedQuantity: 9,
    price: 2300,
    description:
      "Производительный ноутбук для инженерных и аналитических задач. Подходит для корпоративных поставок среднего объема.",
    category: "Компьютерная техника",
    updatedAt: "2026-03-09",
  },
  {
    id: "MER-1002",
    supplierId: "SUP-201",
    name: "Док-станция Orion Dock X",
    sku: "ORION-DOCK-X",
    availableQuantity: 120,
    reservedQuantity: 18,
    price: 190,
    description:
      "Универсальная док-станция с поддержкой питания, двух мониторов и гигабитной сети для офисных рабочих мест.",
    category: "Периферия",
    updatedAt: "2026-03-07",
  },
  {
    id: "MER-1003",
    supplierId: "SUP-201",
    name: "Монитор Orion Vision 27",
    sku: "ORION-MON-27",
    availableQuantity: 67,
    reservedQuantity: 24,
    price: 340,
    description:
      "27-дюймовый монитор для офисной и проектной работы с матовым покрытием и регулируемой подставкой.",
    category: "Мониторы",
    updatedAt: "2026-03-10",
  },
  {
    id: "MER-2001",
    supplierId: "SUP-185",
    name: "Баннерный комплект Promo A1",
    sku: "PROMO-A1",
    availableQuantity: 35,
    reservedQuantity: 4,
    price: 120,
    description:
      "Набор печатных баннеров формата A1 для маркетинговых кампаний и партнерских мероприятий.",
    category: "Маркетинговые материалы",
    updatedAt: "2026-03-04",
  },
  {
    id: "MER-3001",
    supplierId: "SUP-163",
    name: "Эргономичное кресло ErgoFlex",
    sku: "ERGO-CHAIR-FLEX",
    availableQuantity: 85,
    reservedQuantity: 11,
    price: 310,
    description:
      "Кресло с поддержкой поясницы и регулировкой по высоте для интенсивного офисного использования.",
    category: "Офисная мебель",
    updatedAt: "2026-03-08",
  },
  {
    id: "MER-4001",
    supplierId: "SUP-147",
    name: "Ручной сканер Lumen ScanPro",
    sku: "LUMEN-SCAN-PRO",
    availableQuantity: 50,
    reservedQuantity: 7,
    price: 500,
    description:
      "Складской сканер штрихкодов с повышенной защитой корпуса и длительной автономной работой.",
    category: "Складское оборудование",
    updatedAt: "2026-03-06",
  },
];
