import { Button } from "../Button";
import type { IconButtonProps } from "./IconButton.types";
import { nisthaAttr } from "../shared/inspect";

export type { IconButtonProps } from "./IconButton.types";

/** A kit Button with an icon and no label. It renders Button, so it looks and behaves the same. */
export function IconButton({ icon, ariaLabel, ...rest }: IconButtonProps) {
  return <Button {...rest} {...nisthaAttr("iconbutton", rest)} iconStart={icon} ariaLabel={ariaLabel} />;
}
