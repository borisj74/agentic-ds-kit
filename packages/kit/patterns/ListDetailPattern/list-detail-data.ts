/** Demo data for ListDetailPattern: Northwind's invoices. Replace with your own records. */

export type InvoiceStatus = "overdue" | "open" | "paid";

export interface InvoiceLine {
  item: string;
  qty: string;
  amount: string;
}

export interface InvoicePayment {
  id: string;
  /** One line that says what happened, in words. */
  text: string;
  at: string;
  icon: "CircleX" | "Mail" | "CircleCheck";
}

export interface ListDetailItem {
  /** Invoice number, also the record's URL id (#INV-1842). */
  id: string;
  customer: string;
  amount: string;
  status: InvoiceStatus;
  /** Short date, like "Nov 4". */
  due: string;
  /** Days past due; 0 when not late. */
  daysLate: number;
  issued: string;
  card: string;
  contact: string;
  lines: InvoiceLine[];
  total: string;
  payments: InvoicePayment[];
}

function lines(seats: number, seatAmount: string, overage: string | null, tax: string): InvoiceLine[] {
  const rows: InvoiceLine[] = [{ item: "Scale plan, annual seat", qty: String(seats), amount: seatAmount }];
  if (overage) rows.push({ item: "API calls over 2M", qty: "370K", amount: overage });
  rows.push({ item: "Sales tax 8%", qty: "", amount: tax });
  return rows;
}

const declined = (id: string, at: string, retry: string): InvoicePayment[] => [
  { id: `${id}-declined`, text: "Visa ending 4242 declined · insufficient funds", at, icon: "CircleX" },
  { id: `${id}-retry`, text: "Automatic retry declined", at: retry, icon: "CircleX" },
];

/** Overdue invoices come first, oldest first; then open, then paid. */
export const INVOICES: ListDetailItem[] = [
  {
    id: "INV-1821",
    customer: "Pinecrest Clinics",
    amount: "$14,700.00",
    status: "overdue",
    due: "Nov 1",
    daysLate: 20,
    issued: "Oct 2",
    card: "Mastercard 5100",
    contact: "Leah Park",
    lines: lines(140, "$13,611.11", null, "$1,088.89"),
    total: "$14,700.00",
    payments: declined("INV-1821", "Nov 1, 09:04", "Nov 4, 09:00"),
  },
  {
    id: "INV-1842",
    customer: "Northwind Traders",
    amount: "$2,418.00",
    status: "overdue",
    due: "Nov 4",
    daysLate: 17,
    issued: "Oct 5",
    card: "Visa 4242",
    contact: "Ana Ruiz",
    lines: lines(24, "$2,016.00", "$222.00", "$180.00"),
    total: "$2,418.00",
    payments: [
      ...declined("INV-1842", "Nov 4, 09:12", "Nov 7, 09:00"),
      { id: "INV-1842-reminder", text: "Reminder 1 sent to ana.ruiz@northwind.example", at: "Nov 8, 10:30", icon: "Mail" },
    ],
  },
  {
    id: "INV-1838",
    customer: "Kettle Analytics",
    amount: "$6,540.00",
    status: "overdue",
    due: "Nov 8",
    daysLate: 13,
    issued: "Oct 9",
    card: "Visa 1881",
    contact: "Sam Okafor",
    lines: lines(60, "$6,055.56", null, "$484.44"),
    total: "$6,540.00",
    payments: declined("INV-1838", "Nov 8, 09:02", "Nov 11, 09:00"),
  },
  {
    id: "INV-1850",
    customer: "Brightline Studio",
    amount: "$1,920.00",
    status: "overdue",
    due: "Nov 12",
    daysLate: 9,
    issued: "Oct 13",
    card: "Amex 1005",
    contact: "Jo Brandt",
    lines: lines(18, "$1,777.78", null, "$142.22"),
    total: "$1,920.00",
    payments: declined("INV-1850", "Nov 12, 09:10", "Nov 15, 09:00"),
  },
  {
    id: "INV-1853",
    customer: "Hollis & Grey",
    amount: "$2,160.00",
    status: "overdue",
    due: "Nov 15",
    daysLate: 6,
    issued: "Oct 16",
    card: "Visa 7310",
    contact: "Priya Nair",
    lines: lines(20, "$2,000.00", null, "$160.00"),
    total: "$2,160.00",
    payments: declined("INV-1853", "Nov 15, 09:01", "Nov 18, 09:00"),
  },
  {
    id: "INV-1854",
    customer: "Ostrava Bikes",
    amount: "$890.00",
    status: "overdue",
    due: "Nov 17",
    daysLate: 4,
    issued: "Oct 18",
    card: "Visa 0056",
    contact: "Tomas Novak",
    lines: lines(8, "$824.07", null, "$65.93"),
    total: "$890.00",
    payments: declined("INV-1854", "Nov 17, 09:06", "Nov 20, 09:00"),
  },
  {
    id: "INV-1861",
    customer: "Harbor Freight Co.",
    amount: "$3,240.00",
    status: "open",
    due: "Nov 28",
    daysLate: 0,
    issued: "Oct 29",
    card: "Visa 9921",
    contact: "Dana Wu",
    lines: lines(30, "$3,000.00", null, "$240.00"),
    total: "$3,240.00",
    payments: [],
  },
  {
    id: "INV-1863",
    customer: "Lumen Labs",
    amount: "$1,296.00",
    status: "open",
    due: "Dec 2",
    daysLate: 0,
    issued: "Nov 2",
    card: "Mastercard 4410",
    contact: "Eli Moss",
    lines: lines(12, "$1,200.00", null, "$96.00"),
    total: "$1,296.00",
    payments: [],
  },
  {
    id: "INV-1866",
    customer: "Fjord Outfitters",
    amount: "$4,860.00",
    status: "open",
    due: "Dec 5",
    daysLate: 0,
    issued: "Nov 5",
    card: "Visa 3007",
    contact: "Ingrid Dahl",
    lines: lines(45, "$4,500.00", null, "$360.00"),
    total: "$4,860.00",
    payments: [],
  },
  {
    id: "INV-1830",
    customer: "Copperleaf Foods",
    amount: "$2,592.00",
    status: "paid",
    due: "Nov 6",
    daysLate: 0,
    issued: "Oct 7",
    card: "Visa 6604",
    contact: "Marco Russo",
    lines: lines(24, "$2,400.00", null, "$192.00"),
    total: "$2,592.00",
    payments: [{ id: "INV-1830-paid", text: "Paid with Visa ending 6604", at: "Nov 6, 09:00", icon: "CircleCheck" }],
  },
  {
    id: "INV-1834",
    customer: "Alder & Finch",
    amount: "$756.00",
    status: "paid",
    due: "Nov 9",
    daysLate: 0,
    issued: "Oct 10",
    card: "Amex 2290",
    contact: "Ruth Alder",
    lines: lines(7, "$700.00", null, "$56.00"),
    total: "$756.00",
    payments: [{ id: "INV-1834-paid", text: "Paid with Amex ending 2290", at: "Nov 9, 09:00", icon: "CircleCheck" }],
  },
];
