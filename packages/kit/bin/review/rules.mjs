/**
 * The five review rules. Each finding: { rule, severity, offset, contractId, message, fix }.
 * bin/review.mjs adds id, file and line.
 *
 * Only what can be checked reliably is reported. A dynamic value (an expression, a spread)
 * is unknown, and unknown is never a finding.
 */
import { dirname, relative, resolve, sep } from "node:path";
import {
  kebabProp,
  objectEntries,
  readCssDeclarations,
  readImports,
  readJsxTags,
  skipBalanced,
  stringsIn,
  stripComments,
} from "./scan.mjs";
import { parseHex, parseRgb, toPx } from "./kit.mjs";

export const RULES = Object.freeze({
  "raw-value": "error",
  "wrong-use": "error",
  "outside-kit": "error",
  rebuild: "warning",
  "pattern-fits": "warning",
});

/** Other UI libraries. A source matches when it equals one of these or starts with it plus "/". */
export const OTHER_UI_LIBRARIES = Object.freeze([
  "@radix-ui",
  "radix-ui",
  "@mui",
  "@material-ui",
  "@chakra-ui",
  "@mantine",
  "antd",
  "@ant-design",
  "@headlessui",
  "react-bootstrap",
  "reactstrap",
  "@nextui-org",
  "@heroui",
  "@ark-ui",
  "@base-ui-components",
  "@base-ui",
  "react-aria-components",
  "@react-aria",
  "@ariakit",
  "primereact",
  "semantic-ui-react",
  "@fluentui",
  "@blueprintjs",
  "evergreen-ui",
  "grommet",
  "rsuite",
  "@shadcn",
  "shadcn",
  "@tremor",
  "flowbite-react",
  "@geist-ui",
  "vaul",
  "cmdk",
  "sonner",
]);

const RAMP = /var\(\s*(--color-[a-z]+(?:-[a-z]+)*-\d+)\s*(?:,[^)]*)?\)/g;
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/;
const LENGTH = /(?<![\w.#-])-?\d*\.?\d+(?:px|rem|em)\b/g;
const NAMED_COLORS = new Set(
  "white black red green blue yellow orange purple pink gray grey silver maroon navy teal olive lime aqua fuchsia brown gold indigo violet crimson coral salmon tomato".split(
    " ",
  ),
);
const COLOR_PROP = /^(color|background|background-color|border|border-(top|right|bottom|left|block|inline)(-(start|end))?(-color)?|border-color|outline|outline-color|fill|stroke|box-shadow|text-decoration-color|caret-color|accent-color|column-rule|column-rule-color)$/;
const SPACING_PROP = /^(margin|padding)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$|^(row-|column-|grid-|grid-row-|grid-column-)?gap$/;
const RADIUS_PROP = /^border(-(top|bottom|start|end)-(left|right|start|end))?-radius$/;

function stripVars(value) {
  let out = "";
  let i = 0;
  while (i < value.length) {
    if (value.startsWith("var(", i)) {
      i = skipBalanced(value, i + 3);
      out += " ";
      continue;
    }
    out += value[i++];
  }
  return out;
}

/**
 * Raw colour, spacing, radius and shadow values in one declaration.
 * `say(token)` writes the fix for the token we suggest (plain CSS or a Tailwind class).
 */
export function checkDeclaration(kit, prop, value, say = (token) => `Use var(${token}).`) {
  if (prop.startsWith("--")) return [];
  const out = [];
  const clean = String(value)
    .replace(/url\([^)]*\)/g, " ")
    .replace(/(["'])[^"']*\1/g, " ");

  for (const name of new Set([...clean.matchAll(RAMP)].map((m) => m[1]))) {
    const hex = kit.rampHex(name);
    const rgb = hex ? parseHex(hex) : null;
    const token = rgb ? kit.nearestColor(rgb, prop) : null;
    out.push({
      what: "colour",
      message: `Primitive colour ramp var(${name}) in ${prop}. Use a semantic colour token.`,
      fix: token ? say(token) : "Use a semantic colour token from agentic-ds-kit/tokens.css.",
    });
  }

  const rest = stripVars(clean);
  const hex = rest.match(HEX)?.[0];
  const fn = COLOR_FN.test(rest) ? rest.match(/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\([^)]*\)?/)[0] : null;
  const named = COLOR_PROP.test(prop) ? rest.split(/[\s,()]+/).find((word) => NAMED_COLORS.has(word.toLowerCase())) : null;
  const raw = hex ?? fn ?? named;
  const lengths = [...rest.matchAll(LENGTH)].map((m) => m[0]).filter((len) => toPx(len) !== 0);
  // A whole hardcoded shadow is one finding (the shadow), not a colour plus a shadow.
  const rawShadow = prop === "box-shadow" && !/var\(/.test(clean) && lengths.length > 0;
  if (raw && !rawShadow) {
    const rgb = hex ? parseHex(hex) : fn ? parseRgb(fn) : null;
    const token = rgb ? kit.nearestColor(rgb, prop) : null;
    out.push({
      what: "colour",
      message: `Hardcoded colour ${raw} in ${prop}.`,
      fix: token ? `${say(token)} It is the closest semantic colour.` : "Use a semantic colour token from agentic-ds-kit/tokens.css.",
    });
  }

  if (lengths.length && SPACING_PROP.test(prop)) {
    out.push({
      what: "spacing",
      message: `Hardcoded spacing ${lengths[0]} in ${prop}.`,
      fix: say(kit.nearestSpace(toPx(lengths[0]), prop)),
    });
  }
  if (lengths.length && RADIUS_PROP.test(prop)) {
    out.push({
      what: "radius",
      message: `Hardcoded radius ${lengths[0]} in ${prop}.`,
      fix: say(kit.nearestRadius(toPx(lengths[0]))),
    });
  }
  if (rawShadow) {
    out.push({
      what: "shadow",
      message: `Hardcoded shadow in ${prop}: ${String(value).trim()}.`,
      fix: say(kit.nearestShadow(value)),
    });
  }
  return out;
}

/** A Tailwind arbitrary value such as p-[12px] or bg-[#fff], read as the CSS property it sets. */
const TAILWIND_PROPS = [
  [/^p[trblxyse]?$/, "padding"],
  [/^-?m[trblxyse]?$/, "margin"],
  [/^(gap(-[xy])?|space-[xy])$/, "gap"],
  [/^rounded(-[a-z]+)?$/, "border-radius"],
  [/^shadow$/, "box-shadow"],
  [/^bg$/, "background-color"],
  [/^(from|via|to)$/, "background"],
  [/^text$/, "color"],
  [/^(border(-[trblxyse])?|divide)$/, "border-color"],
  [/^(ring|outline)$/, "outline-color"],
  [/^(fill|stroke|caret|accent)$/, "fill"],
  [/^decoration$/, "text-decoration-color"],
];

function tailwindFindings(kit, text) {
  const out = [];
  for (const m of text.matchAll(/(^|\s)(?:[\w-]+:)*!?(-?[a-z][\w-]*?)-\[([^\]\s]+)\](?=\s|$)/g)) {
    const utility = m[2];
    const prop = TAILWIND_PROPS.find(([re]) => re.test(utility))?.[1] ?? utility;
    const value = m[3].replace(/_/g, " ");
    for (const f of checkDeclaration(kit, prop, value, (token) => `Use ${utility}-[var(${token})].`)) {
      out.push({ ...f, at: m.index + m[1].length });
    }
  }
  return out;
}

const isCss = (file) => /\.css$/i.test(file);

export function reviewSource(kit, { file, absPath, text }) {
  if (isCss(file)) return reviewCss(kit, text);
  return reviewScript(kit, { file, absPath, text });
}

function reviewCss(kit, text) {
  const css = stripComments(text, { css: true });
  const findings = [];
  for (const decl of readCssDeclarations(css)) {
    for (const f of checkDeclaration(kit, decl.prop, decl.value)) findings.push(raw(f, decl.offset));
  }
  return findings;
}

const raw = (f, offset) => ({
  rule: "raw-value",
  severity: RULES["raw-value"],
  offset,
  contractId: "tokens",
  message: f.message,
  fix: f.fix,
});

/** Where each kit component is imported in this file: Map(local name -> { component, offset }). */
function kitImports(kit, imports, absPath) {
  const out = new Map();
  for (const imp of imports) {
    if (imp.typeOnly) continue;
    if (imp.source === "agentic-ds-kit") {
      for (const { imported, local } of imp.names) {
        const component = kit.component(imported);
        if (component && imported === component.name) out.set(local, { component, offset: imp.offset });
      }
      continue;
    }
    const folder = kitUiFolder(kit, imp.source, absPath);
    if (folder) {
      const component = kit.component(folder);
      if (!component) continue;
      for (const { imported, local } of imp.names) {
        if (imported === component.name || imported === "default") out.set(local, { component, offset: imp.offset });
      }
    }
  }
  return out;
}

/** For a relative import into this kit's own ui/<Folder> (the kit's patterns do this), the folder name. */
function kitUiFolder(kit, source, absPath) {
  if (!source.startsWith(".") || !absPath) return null;
  const target = relative(resolve(kit.root, "ui"), resolve(dirname(absPath), source));
  if (!target || target.startsWith("..") || target.includes(":")) return null;
  const parts = target.split(sep);
  if (parts.length === 1 || (parts.length === 2 && (parts[1] === parts[0] || parts[1] === "index"))) return parts[0];
  return null;
}

function isLocal(source) {
  return /^(\.|@\/|~\/|#\/|src\/)/.test(source);
}

function reviewScript(kit, { file, absPath, text }) {
  const code = stripComments(text);
  const imports = readImports(code);
  const findings = [];
  const posix = file.split(sep).join("/");

  // outside-kit
  for (const imp of imports) {
    if (imp.typeOnly) continue;
    const lib = OTHER_UI_LIBRARIES.find((name) => imp.source === name || imp.source.startsWith(`${name}/`));
    if (lib) {
      findings.push({
        rule: "outside-kit",
        severity: RULES["outside-kit"],
        offset: imp.offset,
        contractId: null,
        message: `Import from "${imp.source}", another UI library.`,
        fix: "Use the matching agentic-ds-kit component (see contracts/index.json). If nothing fits, stop and ask.",
      });
      continue;
    }
    if (!isLocal(imp.source) || kitUiFolder(kit, imp.source, absPath)) continue;
    const segments = imp.source.split("/");
    const last = segments[segments.length - 1];
    const inUiFolder = /(^|\/)components\/ui(\/|$)/.test(imp.source);
    const cousin = (inUiFolder || segments.includes("ui") || segments.includes("components")) && kit.component(last);
    if (cousin) {
      findings.push({
        rule: "outside-kit",
        severity: RULES["outside-kit"],
        offset: imp.offset,
        contractId: cousin.id,
        message: `"${imp.source}" is a local copy of ${cousin.name}.`,
        fix: `import { ${cousin.name} } from "agentic-ds-kit";`,
      });
    } else if (inUiFolder) {
      findings.push({
        rule: "outside-kit",
        severity: RULES["outside-kit"],
        offset: imp.offset,
        contractId: null,
        message: `"${imp.source}" is a local UI folder.`,
        fix: "Use agentic-ds-kit components. If the kit has nothing that fits, stop and ask.",
      });
    }
  }

  const fromKit = kitImports(kit, imports, absPath);
  const jsx = /\.(tsx|jsx|js)$/i.test(file);
  const tags = jsx ? readJsxTags(code) : [];

  // raw-value: inline style and className strings. Next image routes (opengraph-image, icon, …)
  // render with next/og, where CSS variables do not exist, so tokens cannot be used there.
  const imageRoute = /(^|\/)(opengraph-image|twitter-image|icon|apple-icon)\.(tsx|jsx|ts|js)$/.test(posix);
  for (const tag of imageRoute ? [] : tags) {
    const style = tag.attrs.get("style");
    if (style?.kind === "expr" && style.value.trim().startsWith("{")) {
      for (const { key, value } of objectEntries(style.value, style.offset)) {
        const prop = kebabProp(key);
        if (value.kind === "string") {
          for (const f of checkDeclaration(kit, prop, value.value)) findings.push(raw(f, value.offset));
        } else if (value.kind === "number" && value.value !== 0 && (SPACING_PROP.test(prop) || RADIUS_PROP.test(prop))) {
          for (const f of checkDeclaration(kit, prop, `${value.value}px`)) {
            findings.push(raw({ ...f, message: f.message.replace(`${value.value}px`, String(value.value)) }, value.offset));
          }
        }
      }
    }
    const className = tag.attrs.get("className") ?? tag.attrs.get("class");
    if (className) {
      const parts = className.kind === "string" ? [{ text: className.value, offset: className.offset }] : className.kind === "expr" ? stringsIn(className.value, className.offset) : [];
      for (const part of parts) {
        for (const f of tailwindFindings(kit, part.text)) findings.push(raw(f, part.offset + f.at));
      }
    }
  }

  // wrong-use: Button checked against the Button and Link contracts
  const buttonNames = [...fromKit].filter(([, v]) => v.component.id === "button").map(([local]) => local);
  const link = kit.byId.get("link");
  const solidPrimary = [];
  const slots = tags.flatMap((t) => [...t.attrs.values()].filter((a) => a.kind === "expr").map((a) => [a.offset, a.offset + a.value.length]));
  for (const tag of tags) {
    if (!buttonNames.includes(tag.name)) continue;
    const as = tag.attrs.get("as");
    const nav = ["href", "to"].find((name) => tag.attrs.has(name)) ?? (as?.kind === "string" && as.value === "a" ? 'as="a"' : null);
    if (nav) {
      findings.push({
        rule: "wrong-use",
        severity: RULES["wrong-use"],
        offset: tag.offset,
        contractId: "button",
        message: `Button with ${nav} navigates. Button is for actions; navigation is a Link.`,
        fix: link ? `Use <${link.name} href="…"> (${link.level}) for navigation.` : "Use Link for navigation.",
      });
    }
    const appearance = literal(tag, "appearance", "solid");
    const mode = literal(tag, "mode", "primary");
    if (appearance === "solid" && mode === "primary" && rendersWithTheRest(code, tag, slots)) solidPrimary.push(tag);

    const iconOnly =
      (tag.attrs.has("iconStart") || tag.attrs.has("iconEnd")) &&
      !tag.attrs.has("children") &&
      !tag.spread &&
      !tag.children.trim();
    const labelled = ["ariaLabel", "aria-label", "aria-labelledby"].some((name) => tag.attrs.has(name));
    if (iconOnly && !labelled) {
      findings.push({
        rule: "wrong-use",
        severity: RULES["wrong-use"],
        offset: tag.offset,
        contractId: "button",
        message: "Icon-only Button without an aria label. Screen readers cannot name it.",
        fix: 'Add ariaLabel="…" that names the action, or a visible label.',
      });
    }
  }
  if (solidPrimary.length > 1) {
    for (const tag of solidPrimary.slice(1)) {
      findings.push({
        rule: "wrong-use",
        severity: RULES["wrong-use"],
        offset: tag.offset,
        contractId: "button",
        message: `More than one solid primary Button in this file (${solidPrimary.length}). A missing appearance or mode counts as solid and primary.`,
        fix: 'Keep one appearance="solid" mode="primary" Button per view. Make the others outline, soft or ghost, or mode="neutral".',
      });
    }
  }

  // rebuild and pattern-fits
  const used = new Map();
  for (const { component, offset } of fromKit.values()) {
    if (!used.has(component.id) || used.get(component.id) > offset) used.set(component.id, offset);
  }
  // A file inside a copied pattern is already the biggest piece (a template); rebuild stays quiet there.
  const inPattern = kit.patterns.some((p) => inPatternFolder(p, posix));
  const rebuild = inPattern ? null : rebuildFinding(kit, used, posix);
  if (rebuild) findings.push(rebuild);
  const pattern = patternFinding(kit, used, { code, imports, posix });
  if (pattern) findings.push(pattern);

  return findings;
}

/**
 * False for a Button that only shows in one branch (`cond ? <Button/> : …`, `cond && <Button/>`)
 * or that sits in another component's slot (`actions={<Button/>}`, `footer={…}`), such as an Empty
 * state or a Modal. Those never render beside the page's own Buttons, so the one-solid-primary
 * count leaves them out.
 */
function rendersWithTheRest(code, tag, slots) {
  if (slots.some(([start, end]) => tag.offset >= start && tag.offset < end)) return false;
  const before = code.slice(Math.max(0, tag.offset - 60), tag.offset).replace(/[\s(]+$/, "");
  return !/(\?|:|&&|\|\||\?\?)$/.test(before);
}

/**
 * "solid" / "primary" when the prop is that literal or missing (the default), "other" for another
 * literal, null when we cannot know (an expression, or a spread that might set it).
 */
function literal(tag, name, fallback) {
  const attr = tag.attrs.get(name);
  if (!attr) return tag.spread ? null : fallback;
  if (attr.kind === "string") return attr.value === fallback ? fallback : "other";
  if (attr.kind === "expr") {
    const m = attr.value.trim().match(/^(["'`])([\w-]+)\1$/);
    if (m) return m[2] === fallback ? fallback : "other";
  }
  return null;
}

/**
 * The share test both rules use. distinctive = contains minus common parts.
 * Fires when the file uses at least two distinctive parts, at least two thirds of the distinctive
 * parts and at least two thirds of the whole list. With fewer than two distinctive parts,
 * `allowSmall` lets it fire only when every part is used; otherwise it never fires.
 */
export function shareMatch(kit, contains, usedIds, { allowSmall = false } = {}) {
  if (!contains.length) return null;
  const distinctive = contains.filter((id) => !kit.common.has(id));
  const usedAll = contains.filter((id) => usedIds.has(id));
  const usedDistinctive = distinctive.filter((id) => usedIds.has(id));
  if (distinctive.length < 2) {
    if (!allowSmall || usedAll.length !== contains.length) return null;
    return { usedAll, share: 1 };
  }
  const ok =
    usedDistinctive.length >= 2 &&
    usedDistinctive.length * 3 >= distinctive.length * 2 &&
    usedAll.length * 3 >= contains.length * 2;
  return ok ? { usedAll, share: usedDistinctive.length / distinctive.length } : null;
}

/** Organisms and blocks the rebuild test can ever fire for (at least two distinctive parts). */
export function rebuildCandidates(kit) {
  return kit.components.filter(
    (c) => (c.level === "organism" || c.level === "block") && c.contains.filter((id) => !kit.common.has(id)).length >= 2,
  );
}

function rebuildFinding(kit, used, posix) {
  const usedIds = new Set(used.keys());
  let best = null;
  for (const candidate of rebuildCandidates(kit)) {
    if (usedIds.has(candidate.id)) continue;
    if (posix.includes(`/ui/${candidate.name}/`) || posix.startsWith(`ui/${candidate.name}/`)) continue;
    const match = shareMatch(kit, candidate.contains, usedIds);
    if (!match) continue;
    const size = [kit.levelRank(candidate.level), candidate.contains.length, match.usedAll.length];
    if (!best || compareSize(size, best.size) > 0) best = { candidate, match, size };
  }
  if (!best) return null;
  const { candidate, match } = best;
  const parts = match.usedAll.map((id) => kit.byId.get(id)?.name ?? id);
  return {
    rule: "rebuild",
    severity: RULES.rebuild,
    offset: Math.min(...match.usedAll.map((id) => used.get(id))),
    contractId: candidate.id,
    message: `This file rebuilds ${candidate.name} by hand. Use ${candidate.name} (${candidate.level}).`,
    fix: `import { ${candidate.name} } from "agentic-ds-kit"; it already brings ${parts.join(", ")}.`,
  };
}

function compareSize(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

function inPatternFolder(pattern, posix) {
  return posix.includes(`/${pattern.name}/`) || posix.startsWith(`${pattern.name}/`) || posix.includes(`patterns/${pattern.id}/`);
}

function usesPattern(pattern, { code, imports, posix }) {
  if (inPatternFolder(pattern, posix)) return true;
  if (new RegExp(`\\b(function|const|let|class)\\s+${pattern.name}\\b`).test(code)) return true;
  return imports.some(
    (imp) =>
      imp.names.some((n) => n.imported === pattern.name || n.local === pattern.name) ||
      imp.source.endsWith(`/${pattern.name}`) ||
      imp.source.includes(`patterns/${pattern.id}`),
  );
}

function patternFinding(kit, used, ctx) {
  const usedIds = new Set(used.keys());
  let best = null;
  for (const pattern of kit.patterns) {
    if (usesPattern(pattern, ctx)) continue;
    const match = shareMatch(kit, pattern.contains, usedIds, { allowSmall: true });
    if (!match) continue;
    const size = [match.share, match.usedAll.length, pattern.contains.length];
    if (!best || compareSize(size, best.size) > 0) best = { pattern, match, size };
  }
  if (!best) return null;
  const { pattern, match } = best;
  const parts = match.usedAll.map((id) => kit.byId.get(id)?.name ?? id);
  return {
    rule: "pattern-fits",
    severity: RULES["pattern-fits"],
    offset: Math.min(...match.usedAll.map((id) => used.get(id))),
    contractId: pattern.id,
    message: `This file looks like the ${pattern.id} pattern (it uses ${parts.join(", ")}). Start from the pattern instead.`,
    fix: pattern.add || `npx agentic-ds-kit add ${pattern.id}`,
  };
}
