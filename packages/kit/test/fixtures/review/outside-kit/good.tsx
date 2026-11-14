import clsx from "clsx";
import { Plus } from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { formatMoney } from "../lib/format";

export function Good() {
  const [open, setOpen] = useState(false);
  return (
    <div className={clsx(open && "is-open")}>
      <NextLink href="/">{formatMoney(1)}</NextLink>
      <Button iconStart={Plus} onClick={() => setOpen(true)}>
        Add
      </Button>
    </div>
  );
}
