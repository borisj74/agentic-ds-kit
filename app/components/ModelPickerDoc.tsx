"use client";

import { useState } from "react";
import { ModelPicker } from "agentic-ds-kit";
import type { PickerModel } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const MODELS: PickerModel[] = [
  { id: "opus", name: "Claude Opus 5.5", vendor: "Anthropic", description: "Deepest reasoning", contextWindow: "200K", costTier: "$$$", tagline: "deepest" },
  { id: "sonnet", name: "Claude Sonnet 5.5", vendor: "Anthropic", description: "Balanced default", contextWindow: "200K", costTier: "$$", tagline: "balanced", recommended: true },
  { id: "haiku", name: "Claude Haiku 5.5", vendor: "Anthropic", description: "Fastest, lowest cost", contextWindow: "200K", costTier: "$", tagline: "fastest" },
  { id: "nw70", name: "Northwind 70B", vendor: "Example vendor", description: "Open weights · example data", contextWindow: "128K", costTier: "$" },
  { id: "nw405", name: "Northwind 405B", vendor: "Example vendor", contextWindow: "128K", costTier: "$$$", disabled: true, disabledReason: "Needs the Pro plan" },
];

const noop = () => {};

export function ModelPickerDoc() {
  const [value, setValue] = useState("sonnet");
  return (
    <AgentDocFrame
      id="modelpicker"
      name="ModelPicker"
      lede="Choose the model an agent uses. Not Select. Not Combobox."
      summary="Open the menu: models are grouped by vendor with context window and cost tier; disabled ones keep their reason."
      preview={
        <div className={agentDoc.stack}>
          <ModelPicker models={MODELS} value={value} onValueChange={setValue} />
        </div>
      }
      usage="ModelPicker is built on the kit DropdownMenu, so keyboard and overlay motion match. Keep unavailable models visible with their reason instead of hiding them."
      code={`<ModelPicker models={models} value={modelId} onValueChange={setModelId} />`}
      variants={[
        {
          title: "Closed — md and sm",
          about: "The trigger shows the name, cost tier and tagline.",
          code: `<ModelPicker models={models} value="sonnet" />
<ModelPicker models={models} value="sonnet" size="sm" />`,
          render: (
            <div className={agentDoc.stack}>
              <ModelPicker models={MODELS} value="sonnet" onValueChange={noop} />
              <ModelPicker models={MODELS} value="sonnet" size="sm" hideLabel onValueChange={noop} />
            </div>
          ),
        },
        {
          title: "Selected — Haiku chosen",
          about: "The selected model is checked in the menu.",
          code: `<ModelPicker models={models} value="haiku" />`,
          render: <ModelPicker models={MODELS} value="haiku" onValueChange={noop} />,
        },
        {
          title: "Loading",
          about: "loading disables the trigger and spins its icon.",
          code: `<ModelPicker models={[]} loading />`,
          render: <ModelPicker models={[]} loading />,
        },
        {
          title: "Error",
          about: "error keeps the last choice and offers Retry.",
          code: `<ModelPicker models={models} value="sonnet" error="Couldn't load other models. Using the last choice." onRetry={reload} />`,
          render: <ModelPicker models={MODELS.slice(1, 2)} value="sonnet" error="Couldn't load other models. Using the last choice." onRetry={noop} />,
        },
        {
          title: "Empty — no models available",
          about: "No models: the trigger is disabled and the note says who can fix it.",
          code: `<ModelPicker models={[]} />`,
          render: <ModelPicker models={[]} />,
        },
      ]}
    />
  );
}
