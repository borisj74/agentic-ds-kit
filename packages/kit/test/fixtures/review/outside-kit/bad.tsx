import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import TextField from "@mui/material/TextField";

export function Bad() {
  return (
    <Dialog.Root>
      <TextField />
      <Button>Save</Button>
    </Dialog.Root>
  );
}
