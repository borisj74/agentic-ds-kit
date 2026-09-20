import { Button } from "../Button";
import { DatePicker } from "../DatePicker";
import { Drawer } from "../Drawer";
import { Field } from "../Field";
import { Input } from "../Input";
import { Select } from "../Select";
import { Switch } from "../Switch";
import { Textarea } from "../Textarea";
import type { CalendarSource } from "./Calendar.types";
import { timeOptions, toneClass, TONES, type EventDraft } from "./calendarModel";
import styles from "./Calendar.module.css";

export function CalendarsDrawer({
  open,
  calendars,
  hidden,
  onClose,
  onToggle,
}: {
  open: boolean;
  calendars: CalendarSource[];
  hidden: Set<string>;
  onClose: () => void;
  onToggle: (id: string, shown: boolean) => void;
}) {
  return (
    <Drawer open={open} title="Calendars" onClose={onClose} footer={<Button variant="secondary" onClick={onClose}>Done</Button>}>
      <ul className={styles.sources}>
        {calendars.map((calendar, index) => {
          const tone = calendar.tone ?? TONES[index % TONES.length];
          return (
            <li key={calendar.id} className={styles.source}>
              <span className={`${styles.sourceSwatch} ${styles[toneClass(tone)]}`} aria-hidden />
              <Switch
                id={`calendar-source-${calendar.id}`}
                label={calendar.name}
                checked={!hidden.has(calendar.id)}
                onChange={(shown) => onToggle(calendar.id, shown)}
              />
            </li>
          );
        })}
      </ul>
    </Drawer>
  );
}

export function EventDrawer({
  open,
  formId,
  draft,
  errors,
  calendars,
  isEdit,
  onClose,
  onEdit,
  onSave,
  onRemove,
  onStartDate,
  onStartTime,
}: {
  open: boolean;
  formId: string;
  draft: EventDraft | null;
  errors: { title?: string; end?: string };
  calendars: CalendarSource[];
  isEdit: boolean;
  onClose: () => void;
  onEdit: (patch: Partial<EventDraft>) => void;
  onSave: () => void;
  onRemove: () => void;
  onStartDate: (value: string) => void;
  onStartTime: (value: string) => void;
}) {
  const ids = {
    calendar: `${formId}-calendar`,
    title: `${formId}-title`,
    allDay: `${formId}-all-day`,
    start: `${formId}-start`,
    startTime: `${formId}-start-time`,
    end: `${formId}-end`,
    endTime: `${formId}-end-time`,
    note: `${formId}-note`,
  };

  return (
    <Drawer
      open={open}
      title={isEdit ? "Edit event" : "New event"}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" onClick={onSave}>
            Save
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {isEdit ? (
            <Button variant="danger" onClick={onRemove}>
              Delete
            </Button>
          ) : null}
        </>
      }
    >
      {draft ? (
        <div className={styles.form}>
          {calendars.length > 0 ? (
            <Field label="Calendar" htmlFor={ids.calendar}>
              <Select
                id={ids.calendar}
                options={calendars.map((calendar) => ({ value: calendar.id, label: calendar.name }))}
                value={draft.calendar}
                onChange={(value) => onEdit({ calendar: typeof value === "string" ? value : "" })}
              />
            </Field>
          ) : null}
          <Field label="Title" htmlFor={ids.title} error={errors.title}>
            <Input id={ids.title} value={draft.title} onChange={(value) => onEdit({ title: value })} />
          </Field>
          <Field label="All day" htmlFor={ids.allDay}>
            <Switch id={ids.allDay} ariaLabel="All day" checked={draft.allDay} onChange={(value) => onEdit({ allDay: value })} />
          </Field>
          <div className={styles.pair}>
            <Field label="Start" htmlFor={ids.start}>
              <DatePicker id={ids.start} value={draft.startDate} onValueChange={onStartDate} />
            </Field>
            {draft.allDay ? null : (
              <Field label="Start time" htmlFor={ids.startTime}>
                <Select
                  id={ids.startTime}
                  options={timeOptions(draft.startTime)}
                  value={draft.startTime}
                  onChange={(value) => {
                    if (typeof value === "string") onStartTime(value);
                  }}
                />
              </Field>
            )}
          </div>
          <div className={styles.pair}>
            <Field label="End" htmlFor={ids.end} error={draft.allDay ? errors.end : undefined}>
              <DatePicker id={ids.end} value={draft.endDate} onValueChange={(value) => onEdit({ endDate: value })} />
            </Field>
            {draft.allDay ? null : (
              <Field label="End time" htmlFor={ids.endTime} error={errors.end}>
                <Select
                  id={ids.endTime}
                  options={timeOptions(draft.endTime)}
                  value={draft.endTime}
                  onChange={(value) => {
                    if (typeof value === "string") onEdit({ endTime: value });
                  }}
                />
              </Field>
            )}
          </div>
          <Field label="Note" htmlFor={ids.note}>
            <Textarea id={ids.note} rows={3} value={draft.note} onChange={(value) => onEdit({ note: value })} />
          </Field>
        </div>
      ) : null}
    </Drawer>
  );
}
