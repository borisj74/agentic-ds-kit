"use client";

import { useState } from "react";
import { TaskBoard, type TaskBoardCard, type TaskBoardColumn } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";

const PS = { name: "Priya Shah", initials: "PS" };
const ML = { name: "Marco Li", initials: "ML" };
const AK = { name: "Ana Kova", initials: "AK" };
const CARDS: TaskBoardCard[] = [
  { id: "tax", title: "Map tax codes for EU", tags: ["Billing"], dueOn: "14 Nov", assignee: PS },
  { id: "dunning", title: "Write dunning emails", tags: ["Copy"], assignee: ML },
  { id: "sync", title: "Northwind sync retries", tags: ["Sync"], dueOn: "12 Nov", assignee: ML },
  { id: "proration", title: "Proration rules", tags: ["Billing"], assignee: PS },
  { id: "pdf", title: "Invoice PDF layout", tags: ["Design"], dueOn: "11 Nov", assignee: AK },
  { id: "card", title: "Card update flow", tags: ["Billing"], assignee: PS },
  { id: "webhook", title: "Webhook signing", tags: ["Platform"], assignee: ML },
  { id: "export", title: "Usage export", tags: ["Data"], assignee: AK },
];
const COLUMNS: TaskBoardColumn[] = [
  { id: "todo", label: "Todo", cardIds: ["tax", "dunning"] },
  { id: "doing", label: "In progress", cardIds: ["sync", "proration"] },
  { id: "review", label: "Review", cardIds: ["pdf"] },
  { id: "done", label: "Done", cardIds: ["card", "webhook", "export"] },
];
const TALL_CARDS: TaskBoardCard[] = [
  ...CARDS,
  ...Array.from({ length: 9 }, (_, index) => ({ id: `old${index}`, title: `Archived task ${index + 1}`, tags: ["Billing"] })),
];
const TALL: TaskBoardColumn[] = [
  { id: "todo", label: "Todo", cardIds: [] },
  { id: "doing", label: "In progress", cardIds: ["sync", "proration"] },
  { id: "review", label: "Review", cardIds: ["pdf"] },
  { id: "done", label: "Done", cardIds: ["card", "webhook", "export", ...Array.from({ length: 9 }, (_, index) => `old${index}`)] },
];
const BASE = { title: "Billing Q4", note: "example tasks" };
const noop = () => {};

function move(columns: TaskBoardColumn[], cardId: string, to: string, index: number) {
  const stripped = columns.map((column) => ({ ...column, cardIds: column.cardIds.filter((id) => id !== cardId) }));
  return stripped.map((column) => {
    if (column.id !== to) return column;
    const ids = [...column.cardIds];
    ids.splice(index, 0, cardId);
    return { ...column, cardIds: ids };
  });
}

export function TaskBoardDoc() {
  const [columns, setColumns] = useState(COLUMNS);
  return (
    <AgentDocFrame
      id="taskboard"
      name="TaskBoard"
      lede="A Kanban board of columns and task cards, not a full project product."
      summary="Drag a card, or focus one and press Space, move it with the arrow keys, and press Space to drop it (Escape cancels). Each step is announced."
      preview={<TaskBoard {...BASE} columns={columns} cards={CARDS} onMove={(id, to, index) => setColumns((current) => move(current, id, to, index))} onAdd={noop} onCardClick={noop} onNewTask={noop} onFilter={noop} />}
      usage="TaskBoard keeps a keyboard path for every move: Space picks up, arrows move, Space drops, Escape cancels. Counts are text beside the column names. Long columns can stop at maxCardsPerColumn with + N more."
      code={`<TaskBoard
  title="Billing Q4"
  note="example tasks"
  columns={columns}
  cards={cards}
  onMove={(cardId, toColumnId, index) => move(cardId, toColumnId, index)}
  onAdd={addCard}
  onCardClick={openCard}
  onNewTask={newTask}
  onFilter={filter}
/>`}
      variants={[
        {
          title: "Populated",
          about: "Four columns with counts; each card has tags, a due date and an assignee.",
          code: `<TaskBoard title="Billing Q4" columns={columns} cards={cards} onMove={move} onAdd={addCard} onNewTask={newTask} onFilter={filter} />`,
          render: <TaskBoard {...BASE} columns={COLUMNS} cards={CARDS} onMove={noop} onAdd={noop} onNewTask={noop} onFilter={noop} />,
        },
        {
          title: "Empty column + overflow in a tall column",
          about: "An empty column invites a drop; a long column stops at maxCardsPerColumn with + N more.",
          code: `<TaskBoard … columns={columns} cards={cards} maxCardsPerColumn={3} />`,
          render: <TaskBoard {...BASE} columns={TALL} cards={TALL_CARDS} maxCardsPerColumn={3} onMove={noop} onAdd={noop} onNewTask={noop} onFilter={noop} />,
        },
        {
          title: "Empty board",
          about: "A kit Empty with New task.",
          code: `<TaskBoard title="Billing Q4" columns={[]} cards={[]} onMove={move} onNewTask={newTask} />`,
          render: <TaskBoard {...BASE} columns={[]} cards={[]} onMove={noop} onNewTask={noop} onFilter={noop} />,
        },
        {
          title: "Loading",
          about: "Skeleton columns.",
          code: `<TaskBoard title="Billing Q4" columns={[]} cards={[]} loading onMove={move} />`,
          render: <TaskBoard {...BASE} columns={[]} cards={[]} loading onMove={noop} onNewTask={noop} onFilter={noop} />,
        },
        {
          title: "Error",
          about: "A load error with Retry.",
          code: `<TaskBoard title="Billing Q4" columns={[]} cards={[]} error="Couldn't load the board." onRetry={retry} onMove={move} />`,
          render: <TaskBoard {...BASE} columns={[]} cards={[]} error="Couldn’t load the board." onRetry={noop} onMove={noop} onNewTask={noop} onFilter={noop} />,
        },
      ]}
    />
  );
}
