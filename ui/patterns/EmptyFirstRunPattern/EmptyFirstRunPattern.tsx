"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import { Empty } from "@/ui/Empty";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { Modal } from "@/ui/Modal";
import { PageHeader } from "@/ui/PageHeader";
import type { PageHeaderProps } from "@/ui/PageHeader";
import { Toast } from "@/ui/Toast";

export interface EmptyFirstRunPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  onCreate?: (payload: { title: string }) => void;
}

export function EmptyFirstRunPattern({ breadcrumbs, onCreate }: EmptyFirstRunPatternProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | undefined>();
  const [toastOpen, setToastOpen] = useState(false);
  const [createdTitle, setCreatedTitle] = useState("");

  function close() {
    setOpen(false);
    setTitleError(undefined);
  }

  function create() {
    const nextTitle = title.trim();
    if (!nextTitle) {
      setTitleError("Enter a study name.");
      return;
    }

    onCreate?.({ title: nextTitle });
    setCreatedTitle(nextTitle);
    setTitle("");
    setTitleError(undefined);
    setOpen(false);
    setToastOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    create();
  }

  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title="User research"
          subtitle="Interview notes and findings for Sprint 24."
          breadcrumbs={breadcrumbs}
        />
      </div>
      <div className="layout-content">
        <Empty
          title="No studies yet"
          description="Add the first study so launch comments have evidence."
          icon="User"
          outlined
          actions={
            <Button variant="primary" size="md" onClick={() => setOpen(true)}>
              New study
            </Button>
          }
        />
      </div>
      <Modal
        open={open}
        title="New study"
        description="Name the study. Notes can come later."
        size="md"
        onClose={close}
        footer={
          <ButtonGroup ariaLabel="Study actions">
            <Button variant="secondary" size="md" onClick={close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={create}>
              Create study
            </Button>
          </ButtonGroup>
        }
      >
        <form onSubmit={handleSubmit}>
          <Field
            label="Title"
            htmlFor={titleId}
            hint="Something the team will recognize"
            error={titleError}
          >
            <Input
              id={titleId}
              iconStart="Search"
              placeholder="Launch interview round"
              value={title}
              onChange={(value) => {
                setTitle(value);
                if (titleError) setTitleError(undefined);
              }}
            />
          </Field>
        </form>
      </Modal>
      <Toast
        open={toastOpen}
        title="Study added"
        description={
          createdTitle ? `We'll keep “${createdTitle}” in User research.` : undefined
        }
        status="success"
        duration={3000}
        onClose={() => setToastOpen(false)}
        onOpenChange={setToastOpen}
      />
    </div>
  );
}
