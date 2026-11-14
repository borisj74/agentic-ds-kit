import { ExternalLink } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import type { KitLinkComponent } from "../shared/link";
import { cx } from "../shared/cx";
import type { LinkProps } from "./Link.types";
import styles from "./Link.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { LinkProps, LinkVariant } from "./Link.types";

/** Text that navigates. Inline inside a sentence, or standalone on its own line. Not an action: use Button. */
export function Link({
  href,
  children,
  variant = "inline",
  external = false,
  linkAs,
  className,
  rel,
  ref,
  ...rest
}: LinkProps) {
  // An external link is a plain anchor so target and rel always apply.
  const Tag: KitLinkComponent = external ? "a" : (linkAs ?? "a");
  const externalProps = external
    ? { target: "_blank", rel: [rel, "noopener", "noreferrer"].filter(Boolean).join(" ") }
    : { rel };

  return (
    <Tag
      {...rest} {...nisthaAttr("link", rest)}
      {...externalProps}
      ref={ref}
      href={href}
      className={cx(styles.link, styles[variant], className)}
    >
      {children}
      {external ? (
        <>
          <ExternalLink className={styles.icon} size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span className={styles.srOnly}> (opens in a new tab)</span>
        </>
      ) : null}
    </Tag>
  );
}
