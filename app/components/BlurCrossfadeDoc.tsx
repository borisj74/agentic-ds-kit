"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { BlurCrossfade, Button, Tag } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import motion from "./MotionDoc.module.css";

type Status = "running" | "done";

const AUTOPLAY_MS = 1600;

function StatusChip({ status }: { status: Status }) {
  return status === "running" ? <Tag dot="info">Running</Tag> : <Tag dot="success">Done</Tag>;
}

/** Mounts on "running", swaps to "done" once, then the parent's .freeze pauses it at --freeze-at. */
function FrozenSwap({ at, children }: { at: string; children: (status: Status) => ReactNode }) {
  const [status, setStatus] = useState<Status>("running");
  useEffect(() => {
    const timer = window.setTimeout(() => setStatus("done"), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className={`${motion.well} ${motion.freeze}`} style={{ "--freeze-at": at } as CSSProperties}>
      <BlurCrossfade contentKey={status} duration="normal">
        {children(status)}
      </BlurCrossfade>
    </div>
  );
}

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={motion.frame}>
      <p className={motion.frameLabel}>{label}</p>
      {children}
    </div>
  );
}

export function BlurCrossfadeDoc() {
  const [status, setStatus] = useState<Status>("running");
  const [duration, setDuration] = useState<"fast" | "normal">("fast");
  const [thumb, setThumb] = useState<"v1" | "v2">("v1");
  const [playing, setPlaying] = useState(true);
  const next = status === "running" ? "done" : "running";

  // Auto-play the swap so the preview is never static; skipped under reduced motion.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setStatus((current) => (current === "running" ? "done" : "running"));
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <AgentDocFrame
      id="blurcrossfade"
      name="BlurCrossfade"
      lede="A tiny wrapper that crossfades one child to the next when its key changes, for value and state swaps. A motion primitive, not a Card."
      summary="It swaps Running ↔ Done on its own; pause it and swap by hand. The old value blurs out while the new one sharpens in over it."
      preview={
        <div className={motion.stage}>
          <div className={motion.bare}>
            {/* No live region while auto-playing: a polite announcement every 1.6s would be noise. */}
            <BlurCrossfade
              contentKey={status}
              duration={duration}
              label={playing ? undefined : `Status: ${status === "running" ? "Running" : "Done"}`}
            >
              <StatusChip status={status} />
            </BlurCrossfade>
          </div>
          <div className={motion.row}>
            <Button appearance="outline" mode="neutral" size="sm" onClick={() => setPlaying((value) => !value)}>
              {playing ? "Pause" : "Play"}
            </Button>
            <Button
              appearance="ghost"
              mode="neutral"
              size="sm"
              onClick={() => {
                setPlaying(false);
                setStatus(next);
              }}
            >
              {`Swap to ${next === "running" ? "Running" : "Done"}`}
            </Button>
          </div>
        </div>
      }
      controls={<DocOptions label="Duration" options={["fast", "normal"] as const} value={duration} onChange={setDuration} />}
      usage="Wrap a small value and give it a contentKey; change the key to swap. fast is motion.duration200 (Paper's motion.fast), normal is motion.duration300. The outgoing value fades and blurs to 6px while the new one sharpens in; this blur is the kit's one approved exception to the transform/opacity rule. Under reduced motion there is no blur: the old value goes at once and the new one fades in over motion.duration100."
      code={`<BlurCrossfade contentKey={status} label={\`Status: \${status}\`}>
  <Tag dot={status === "done" ? "success" : "info"}>{label}</Tag>
</BlurCrossfade>`}
      variants={[
        {
          title: "Frames — Running to Done",
          about: "Paper's four stills, paused at the normal duration (240ms): rest, the outgoing value leaving, the incoming value arriving, and the new rest. The kit's ease-out front-loads the change, so the frames that match Paper's 60ms and 140ms stills fall at about 15ms and 45ms.",
          code: `<BlurCrossfade contentKey={status}>…</BlurCrossfade>`,
          render: (
            <div className={motion.frames}>
              <Frame label="01 · rest — running">
                <div className={motion.well}>
                  <BlurCrossfade contentKey="running">
                    <StatusChip status="running" />
                  </BlurCrossfade>
                </div>
              </Frame>
              <Frame label="02 · t ≈ 15ms — leaving">
                <FrozenSwap at="15ms">{(s) => <StatusChip status={s} />}</FrozenSwap>
              </Frame>
              <Frame label="03 · t ≈ 45ms — entering">
                <FrozenSwap at="45ms">{(s) => <StatusChip status={s} />}</FrozenSwap>
              </Frame>
              <Frame label="04 · rest — done">
                <div className={motion.well}>
                  <BlurCrossfade contentKey="done">
                    <StatusChip status="done" />
                  </BlurCrossfade>
                </div>
              </Frame>
            </div>
          ),
        },
        {
          title: "Thumbnail swap",
          about: "The same helper, any child: an image, a chart, a status. Both layers share one cell, so the swap never shifts layout.",
          code: `<BlurCrossfade contentKey={version}>
  <img src={thumbnail} alt={\`Version \${version}\`} />
</BlurCrossfade>`,
          render: (
            <div className={motion.stage}>
              <div className={motion.well}>
                <BlurCrossfade contentKey={thumb} duration="normal">
                  <div className={`${motion.thumb} ${thumb === "v1" ? motion.thumbA : motion.thumbB}`}>{thumb}</div>
                </BlurCrossfade>
              </div>
              <Button appearance="outline" mode="neutral" size="sm" onClick={() => setThumb(thumb === "v1" ? "v2" : "v1")}>
                Replay
              </Button>
            </div>
          ),
        },
        {
          title: "Reduced motion",
          about: "With prefers-reduced-motion the outgoing value is removed at once and the new one fades in over motion.duration100: no blur, no overlap. Turn on reduced motion in your OS and press Swap above to see it.",
          code: `@media (prefers-reduced-motion: reduce) — handled inside the component`,
          render: (
            <div className={motion.well}>
              <div className={motion.row}>
                <StatusChip status="running" />
                <span aria-hidden="true">→</span>
                <StatusChip status="done" />
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
