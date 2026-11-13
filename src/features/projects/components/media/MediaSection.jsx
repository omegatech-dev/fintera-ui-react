import { Card } from "@/shared/ui";

export default function MediaSection({ title, description, hint, children, actions }) {
  return (
    <Card
      title={title}
      action={actions}
      bodyClassName="flex flex-col gap-4 p-5"
    >
      {description && <p className="text-body text-ink-3">{description}</p>}
      {children}
      {hint && (
        <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
          {hint}
        </p>
      )}
    </Card>
  );
}
