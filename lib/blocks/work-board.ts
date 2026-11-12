import contract from "../../packages/kit/contracts/workboard.json";
import type { BlockDoc } from "./types";

export const workBoardDoc: BlockDoc = {
  slug: "work-board",
  label: "Work board",
  name: "WorkBoard",
  contract,
  lead:
    "A team's work by status. Move cards by drag or keyboard, then open one to set its status and assignee and talk it through, without leaving the board.",
  usage: `import { WorkBoard, moveWorkBoardTask } from "agentic-ds-kit";

export function Sprint({ columns, setColumns, tasks, people, me }) {
  return (
    <main className="layout-content">
      <WorkBoard
        boardTitle="Billing Q4"
        columns={columns}           // { id, label, cardIds }[]: a task's column is its status
        tasks={tasks}               // { id, title, description?, tags?, assigneeId?, dueOn?, comments? }[]
        people={people}             // { id, name, initials?, avatarSrc? }[]
        currentUserId={me.id}
        onMove={(id, to, index) => setColumns(moveWorkBoardTask(columns, id, to, index))}
        onUpdate={(id, patch) => updateTask(id, patch)}         // { assigneeId }
        onComment={(id, body, parentId) => addComment(id, body, parentId)}
      />
    </main>
  );
}`,
};
