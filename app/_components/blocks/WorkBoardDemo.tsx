"use client";

import { useState } from "react";
import { WorkBoard, moveWorkBoardTask, type WorkBoardTask } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import { WORK_BOARD_COLUMNS, WORK_BOARD_ME, WORK_BOARD_PEOPLE, WORK_BOARD_TASKS } from "@/lib/blocks/work-board.sample";

/**
 * WorkBoard with the sample sprint. Moves, status and assignee changes and comments all change
 * the sample live; New task and Add card add an untitled task.
 */
export function WorkBoardDemo() {
  const [columns, setColumns] = useState(WORK_BOARD_COLUMNS);
  const [tasks, setTasks] = useState<WorkBoardTask[]>(WORK_BOARD_TASKS);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("");
  const me = WORK_BOARD_PEOPLE.find((person) => person.id === WORK_BOARD_ME)!;

  function patch(id: string, change: (task: WorkBoardTask) => WorkBoardTask) {
    setTasks((list) => list.map((task) => (task.id === id ? change(task) : task)));
  }

  function addTask(columnId: string) {
    const id = `new-${count + 1}`;
    setCount((n) => n + 1);
    setTasks((list) => [...list, { id, title: `New task ${count + 1}`, assigneeId: WORK_BOARD_ME }]);
    setColumns((list) => list.map((column) => (column.id === columnId ? { ...column, cardIds: [...column.cardIds, id] } : column)));
    setStatus(`Added New task ${count + 1}`);
  }

  return (
    <>
      <WorkBoard
        boardTitle="Billing Q4"
        note="example tasks"
        columns={columns}
        tasks={tasks}
        people={WORK_BOARD_PEOPLE}
        currentUserId={WORK_BOARD_ME}
        onMove={(id, to, index) => setColumns((list) => moveWorkBoardTask(list, id, to, index))}
        onUpdate={(id, change) => patch(id, (task) => ({ ...task, assigneeId: change.assigneeId ?? undefined }))}
        onComment={(id, body, parentId) =>
          patch(id, (task) => ({
            ...task,
            comments: [...(task.comments ?? []), { id: `${id}-${Date.now()}`, author: me, createdAt: "now", body, parentId }],
          }))
        }
        onEditComment={(id, commentId, body) =>
          patch(id, (task) => ({
            ...task,
            comments: task.comments?.map((comment) => (comment.id === commentId ? { ...comment, body, edited: true } : comment)),
          }))
        }
        onDeleteComment={(id, commentId) =>
          patch(id, (task) => ({
            ...task,
            comments: task.comments?.filter((comment) => comment.id !== commentId && comment.parentId !== commentId),
          }))
        }
        onAdd={addTask}
        onNewTask={() => addTask(columns[0].id)}
      />
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}
