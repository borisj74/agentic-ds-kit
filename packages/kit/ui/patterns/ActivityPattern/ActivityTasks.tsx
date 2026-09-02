import { Badge } from "../../Badge";
import { Button } from "../../Button";
import { ButtonGroup } from "../../ButtonGroup";
import { Carousel } from "../../Carousel";
import type { CarouselSlidesPerView } from "../../Carousel";
import { InsightCard } from "../../InsightCard";
import { Table } from "../../Table";
import type { TaskInsight } from "./TaskDrawer";

export function TaskCards({
  tasks,
  onOpen,
  onDismiss,
}: {
  tasks: TaskInsight[];
  onOpen: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const slidesPerView = Math.min(3, Math.max(1, tasks.length)) as CarouselSlidesPerView;

  return (
    <div className="layout-carousel">
      <Carousel
        ariaLabel="Tasks that need attention"
        slidesPerView={slidesPerView}
        items={tasks.map((task) => (
          <InsightCard
            key={task.id}
            eyebrow="Task"
            title={task.title}
            description={task.description}
            tone={task.tone}
            source={task.source}
            secondaryAction={{ label: "View task", onClick: () => onOpen(task.id) }}
            onDismiss={() => onDismiss(task.id)}
          />
        ))}
      />
    </div>
  );
}

export function TaskList({
  tasks,
  onOpen,
  onDismiss,
}: {
  tasks: TaskInsight[];
  onOpen: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <Table
      caption="Open tasks"
      size="sm"
      emptyLabel="No open tasks."
      columns={[
        { key: "task", header: "Task", emphasis: true },
        { key: "owner", header: "Owner" },
        { key: "status", header: "Status" },
        { key: "due", header: "Due" },
        { key: "actions", header: "Actions", align: "end" },
      ]}
      rows={tasks.map((task) => ({
        task: task.title,
        owner: task.owner,
        status: (
          <Badge size="sm" tone={task.statusTone}>
            {task.status}
          </Badge>
        ),
        due: task.due,
        actions: (
          <ButtonGroup ariaLabel={`${task.title} actions`}>
            <Button variant="secondary" size="sm" onClick={() => onOpen(task.id)}>
              View task
            </Button>
            <Button variant="tertiary" size="sm" onClick={() => onDismiss(task.id)}>
              Dismiss
            </Button>
          </ButtonGroup>
        ),
      }))}
    />
  );
}
