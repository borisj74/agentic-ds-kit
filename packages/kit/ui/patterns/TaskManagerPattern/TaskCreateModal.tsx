"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "../../Button";
import { ButtonGroup } from "../../ButtonGroup";
import { DatePicker } from "../../DatePicker";
import { Field } from "../../Field";
import { FieldSet } from "../../FieldSet";
import { Input } from "../../Input";
import { Modal } from "../../Modal";
import { Select } from "../../Select";
import { Textarea } from "../../Textarea";
import { PRIORITY_OPTIONS, type TaskPriority } from "./task-data";
import styles from "./TaskManagerPattern.module.css";

export interface TaskCreatePayload {
  title: string;
  due: string;
  priority: TaskPriority;
  notes: string;
}

export function TaskCreateModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: TaskCreatePayload) => void;
}) {
  const uid = useId();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("2026-10-07");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [notes, setNotes] = useState("");
  const [titleError, setTitleError] = useState<string | undefined>();

  function reset() {
    setTitle("");
    setDue("2026-10-07");
    setPriority("medium");
    setNotes("");
    setTitleError(undefined);
  }

  function close() {
    reset();
    onClose();
  }

  function create() {
    const nextTitle = title.trim();
    if (!nextTitle) {
      setTitleError("Enter a task name.");
      return;
    }
    onCreate({ title: nextTitle, due, priority, notes: notes.trim() });
    reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    create();
  }

  return (
    <Modal
      open={open}
      title="Add task"
      description="Name it, pick a due date, then the team can open the rest."
      size="md"
      onClose={close}
      footer={
        <ButtonGroup ariaLabel="Task actions">
          <Button variant="secondary" size="md" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={create}>
            Add task
          </Button>
        </ButtonGroup>
      }
    >
      <form onSubmit={handleSubmit}>
        <FieldSet legend="Task" description="Shown on Today, Upcoming, or Later once you save.">
          <div className={styles.form}>
            <Field label="Title" htmlFor={`${uid}-title`} hint="Something the team will recognize" error={titleError}>
              <Input
                id={`${uid}-title`}
                placeholder="Assign QA owner"
                value={title}
                onChange={(value) => {
                  setTitle(value);
                  if (titleError) setTitleError(undefined);
                }}
              />
            </Field>
            <Field label="Due date" htmlFor={`${uid}-due`}>
              <DatePicker id={`${uid}-due`} value={due} onValueChange={setDue} />
            </Field>
            <Field label="Priority" htmlFor={`${uid}-priority`}>
              <Select
                id={`${uid}-priority`}
                options={PRIORITY_OPTIONS}
                value={priority}
                onChange={(value) => {
                  if (value === "high" || value === "medium" || value === "low") setPriority(value);
                }}
              />
            </Field>
            <Field label="Notes" htmlFor={`${uid}-notes`} hint="Optional">
              <Textarea
                id={`${uid}-notes`}
                rows={3}
                placeholder="What blocked it, or who should see it"
                value={notes}
                onChange={setNotes}
              />
            </Field>
          </div>
        </FieldSet>
      </form>
    </Modal>
  );
}
