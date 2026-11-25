"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Building2, ReceiptText } from "lucide-react";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { ButtonGroup } from "../../ui/ButtonGroup";
import { Card } from "../../ui/Card";
import { Combobox } from "../../ui/Combobox";
import { DatePicker } from "../../ui/DatePicker";
import { Divider } from "../../ui/Divider";
import { Empty } from "../../ui/Empty";
import { Field } from "../../ui/Field";
import { Modal } from "../../ui/Modal";
import { PageHeader } from "../../ui/PageHeader";
import type { PageHeaderProps } from "../../ui/PageHeader";
import { Select } from "../../ui/Select";
import { Table } from "../../ui/Table";
import type { TableColumn } from "../../ui/Table";
import { Toast } from "../../ui/Toast";
import { AppShellPattern, useAppShell } from "../AppShellPattern";
import type { AppShellPatternProps } from "../AppShellPattern";
import "./EmptyFirstRunPattern.css";

/** What Create draft hands your app. Open the new record from here. */
export interface EmptyFirstRunInvoice {
  customer: string;
  /** True when the customer was typed in, not picked: your app adds it. */
  newCustomer: boolean;
  plan: string;
  /** ISO date, YYYY-MM-DD. */
  dueDate: string;
}

/** The one-line setup status under Empty. The task list itself lives on Home (SetupGuide). */
export interface EmptyFirstRunSetup {
  done: number;
  total: number;
  /** What's left, in words, like "Tax rates and payments left". */
  left: string;
}

export interface EmptyFirstRunPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  /** Create draft in the Modal. Your app saves the draft and opens it. */
  onCreate?: (invoice: EmptyFirstRunInvoice) => void;
  /** The setup line. null hides it (setup is done). Default: the demo's 3 of 5. */
  setup?: EmptyFirstRunSetup | null;
  /** Open setup: go to the page that holds SetupGuide (Home in the demo). */
  onOpenSetup?: () => void;
  /** App shell props for your app (nav, workspace, account…), merged over the demo shell. */
  shell?: Partial<Omit<AppShellPatternProps, "children">>;
}

/** Demo shell: the app-shell example's chrome for a new Northwind workspace. Home carries the setup count. */
export const EMPTY_FIRST_RUN_DEMO_SHELL: Omit<AppShellPatternProps, "children"> = {
  layout: "inset",
  className: "layout-shell--viewport",
  workspace: {
    name: "Northwind",
    mark: Building2,
    menu: [{ heading: "Workspaces", items: [{ id: "northwind", label: "Northwind", selected: true }] }],
  },
  nav: {
    title: "Northwind",
    markIcon: Building2,
    items: [
      { id: "home", label: "Home", icon: "House", badge: "3/5" },
      {
        id: "billing",
        label: "Billing",
        icon: "CreditCard",
        items: [
          { id: "invoices", label: "Invoices", active: true },
          { id: "customers", label: "Customers" },
          { id: "plans", label: "Plans" },
        ],
      },
    ],
  },
  account: {
    name: "Maya Chen",
    secondary: "Owner",
    initials: "MC",
    menu: [{ items: [{ id: "settings", label: "Settings", icon: "Settings" }] }, { items: [{ id: "sign-out", label: "Sign out", icon: "LogOut" }] }],
  },
};

export const EMPTY_FIRST_RUN_DEMO_SETUP: EmptyFirstRunSetup = {
  done: 3,
  total: 5,
  left: "Tax rates and payments left",
};

const PLANS = [
  { value: "scale-annual", label: "Scale, annual · $84.00 per seat", amount: "$84.00" },
  { value: "growth-monthly", label: "Growth, monthly · $29.00 per seat", amount: "$29.00" },
  { value: "starter-monthly", label: "Starter, monthly · $12.00 per seat", amount: "$12.00" },
];

const COLUMNS: TableColumn[] = [
  { key: "customer", header: "Customer", emphasis: true },
  { key: "status", header: "Status" },
  { key: "amount", header: "Amount", numeric: true },
];

interface InvoiceRow {
  id: string;
  customer: string;
  status: string;
  amount: string;
  sample?: boolean;
}

/** Sample rows: app data, flagged so Clear sample data removes only these. */
const SAMPLE_INVOICES: InvoiceRow[] = [
  { id: "sample-1", customer: "Acme Rentals", status: "Paid · Nov 2", amount: "$1,200.00", sample: true },
  { id: "sample-2", customer: "Birch Dental", status: "Open · due Nov 30", amount: "$486.00", sample: true },
  { id: "sample-3", customer: "Cobalt Labs", status: "Overdue · 6 days late", amount: "$2,940.00", sample: true },
];

const DEFAULT_DUE = "2026-12-21";

function formatDue(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * A new Northwind workspace with no invoices, inside AppShellPattern (inset). Empty (first-use) holds
 * the one primary, Create invoice, and an outline Try sample data. Under it, in the same Card, one
 * setup line: a count, what's left and Open setup (the task list stays on Home's SetupGuide).
 * Create invoice opens a Modal that adds a new customer inline; Create draft hands the invoice to
 * onCreate. Sample data shows an info Alert with Clear sample data above the invoices Table.
 */
export function EmptyFirstRunPattern({ shell, ...props }: EmptyFirstRunPatternProps) {
  const shellProps = { ...EMPTY_FIRST_RUN_DEMO_SHELL, ...shell };
  return (
    <AppShellPattern {...shellProps}>
      <EmptyFirstRunPage {...props} />
    </AppShellPattern>
  );
}

function EmptyFirstRunPage({
  breadcrumbs,
  onCreate,
  setup = EMPTY_FIRST_RUN_DEMO_SETUP,
  onOpenSetup,
}: Omit<EmptyFirstRunPatternProps, "shell">) {
  const uid = useId();
  const customerId = `${uid}-customer`;
  const planId = `${uid}-plan`;
  const dueId = `${uid}-due`;
  const setupLineId = `${uid}-setup`;
  // Below the shell's breakpoint: lg 40 controls, stacked actions.
  const narrow = useAppShell()?.narrow ?? false;
  const size = narrow ? "lg" : "md";

  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerError, setCustomerError] = useState<string | undefined>();
  const [plan, setPlan] = useState(PLANS[0].value);
  const [dueDate, setDueDate] = useState(DEFAULT_DUE);
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [nextNumber, setNextNumber] = useState(1842);
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);

  const createRef = useRef<HTMLButtonElement>(null);
  const hasRows = rows.length > 0;
  const hasSample = rows.some((row) => row.sample);

  // Try sample data, Clear sample data and Create draft swap Empty and the Table; the button that was
  // pressed is gone, so focus moves to Create invoice in its new place. Runs after Modal's restore.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    createRef.current?.focus();
  }, [hasRows]);

  function resetForm() {
    setCustomer("");
    setCustomerQuery("");
    setCustomerError(undefined);
    setPlan(PLANS[0].value);
    setDueDate(DEFAULT_DUE);
  }

  function close() {
    setOpen(false);
    resetForm();
  }

  function create() {
    const name = (customer || customerQuery).trim();
    if (!name) {
      setCustomerError("Enter a customer name.");
      return;
    }
    const picked = PLANS.find((item) => item.value === plan) ?? PLANS[0];
    const number = `INV-${nextNumber}`;
    onCreate?.({ customer: name, newCustomer: true, plan: picked.value, dueDate });
    setRows((current) => [
      { id: number, customer: name, status: `Draft · due ${formatDue(dueDate)}`, amount: picked.amount },
      ...current,
    ]);
    setNextNumber((current) => current + 1);
    setToast({ title: `Draft ${number} saved`, description: "Nothing is sent yet." });
    setOpen(false);
    resetForm();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    create();
  }

  // One Create invoice: in Empty while the list is empty, in PageHeader once it has rows.
  // Outline while its Modal is open, so Create draft is the view's one solid primary.
  const createButton = (
    <Button
      ref={createRef}
      appearance={open ? "outline" : "solid"}
      mode={open ? "neutral" : "primary"}
      size={size}
      iconStart="Plus"
      block={narrow && !hasRows}
      onClick={() => setOpen(true)}
    >
      Create invoice
    </Button>
  );

  return (
    <main className="layout-canvas layout-canvas--sticky-header empty-first-run-pattern">
      <div className="layout-header">
        <PageHeader
          title="Invoices"
          subtitle="Northwind · billed in USD"
          breadcrumbs={breadcrumbs}
          actions={hasRows ? createButton : undefined}
        />
      </div>
      <div className="layout-content">
        {hasRows ? (
          <div className="empty-first-run-pattern__list">
            {hasSample ? (
              <Alert
                variant="info"
                title="Sample data"
                secondaryAction={{
                  label: "Clear sample data",
                  onClick: () => setRows((current) => current.filter((row) => !row.sample)),
                }}
              >
                3 invoices, never sent or counted.
              </Alert>
            ) : null}
            <Table aria-label="Invoices" columns={COLUMNS} rows={rows.map(({ id, customer, status, amount }) => ({ id, customer, status, amount }))} stack />
          </div>
        ) : (
          <div className={`empty-first-run-pattern__start${narrow ? " empty-first-run-pattern__start--narrow" : ""}`}>
            <Card flush>
              <Empty
                kind="first-use"
                size="lg"
                icon={ReceiptText}
                title="No invoices yet"
                description="Each invoice bills one customer for a plan. Add the customer as you go."
                actions={
                  <>
                    {createButton}
                    <Button
                      appearance="outline"
                      mode="neutral"
                      size={size}
                      block={narrow}
                      onClick={() => setRows(SAMPLE_INVOICES)}
                    >
                      Try sample data
                    </Button>
                  </>
                }
              />
              {setup ? (
                <>
                  <Divider tone="default" />
                  <div className="empty-first-run-pattern__setup">
                    <p id={setupLineId} className="empty-first-run-pattern__setup-text">
                      <span className="empty-first-run-pattern__setup-count">
                        Setup {setup.done} of {setup.total}
                      </span>{" "}
                      <span className="empty-first-run-pattern__setup-left">{setup.left}</span>
                    </p>
                    <Button
                      appearance="ghost"
                      mode="neutral"
                      size={narrow ? "lg" : "sm"}
                      iconEnd="ArrowRight"
                      aria-describedby={setupLineId}
                      onClick={onOpenSetup}
                    >
                      Open setup
                    </Button>
                  </div>
                </>
              ) : null}
            </Card>
          </div>
        )}
      </div>
      <Modal
        open={open}
        title="New invoice"
        description="Saved as a draft. Nothing is sent yet."
        size="md"
        onClose={close}
        footer={
          <ButtonGroup ariaLabel="Invoice actions">
            <Button appearance="outline" mode="neutral" size={size} onClick={close}>
              Cancel
            </Button>
            <Button appearance="solid" mode="primary" size={size} onClick={create}>
              Create draft
            </Button>
          </ButtonGroup>
        }
      >
        <form className="empty-first-run-pattern__form" onSubmit={handleSubmit}>
          <Field
            label="Customer"
            htmlFor={customerId}
            hint="No customers yet. Type a name to add one."
            error={customerError}
          >
            <Combobox
              id={customerId}
              size={size}
              options={[]}
              allowCustomValue
              placeholder="Customer name"
              value={customer}
              emptyLabel={customerQuery.trim() ? `Press Enter to add ${customerQuery.trim()}` : "Type a name"}
              onQueryChange={(query) => {
                setCustomerQuery(query);
                if (customerError) setCustomerError(undefined);
              }}
              onChange={(value) => {
                setCustomer(value);
                if (customerError) setCustomerError(undefined);
              }}
            />
          </Field>
          <Field label="Plan" htmlFor={planId}>
            <Select
              id={planId}
              size={size}
              options={PLANS.map(({ value, label }) => ({ value, label }))}
              value={plan}
              onChange={(value) => setPlan(Array.isArray(value) ? value[0] : value)}
            />
          </Field>
          <Field label="Due date" htmlFor={dueId}>
            <DatePicker
              id={dueId}
              size={size}
              value={dueDate}
              onValueChange={(value) => {
                if (typeof value === "string") setDueDate(value);
              }}
            />
          </Field>
        </form>
      </Modal>
      <Toast
        open={toast !== null}
        title={toast?.title ?? ""}
        description={toast?.description}
        status="success"
        duration={3000}
        onClose={() => setToast(null)}
      />
    </main>
  );
}
