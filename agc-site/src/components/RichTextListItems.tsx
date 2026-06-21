import { RichTextContent } from "@/components/RichTextContent";
import { cn } from "@/lib/utils";

type Props = {
  items: string[];
  className?: string;
  itemClassName?: string;
  as?: "ul" | "ol";
  listClassName?: string;
};

/** Renders CMS string arrays that may contain rich text or legacy plain strings. */
export function RichTextListItems({
  items,
  className,
  itemClassName,
  as: Tag = "ul",
  listClassName,
}: Props) {
  const visible = items.filter((item) => item?.trim());
  if (visible.length === 0) return null;
  return (
    <Tag className={listClassName}>
      {visible.map((item, index) => (
        <li key={`${index}-${item.slice(0, 24)}`} className={itemClassName}>
          <RichTextContent html={item} className={className} />
        </li>
      ))}
    </Tag>
  );
}

type InlineProps = {
  items: string[];
  className?: string;
  bulletClassName?: string;
  itemClassName?: string;
};

/** Bullet list with optional dot marker (get-involved style). */
export function RichTextBulletList({
  items,
  className,
  bulletClassName,
  itemClassName,
}: InlineProps) {
  const visible = items.filter((item) => item?.trim());
  if (visible.length === 0) return null;
  return (
    <>
      {visible.map((item, index) => (
        <li
          key={`${index}-${item.slice(0, 24)}`}
          className={cn("flex items-start gap-2", itemClassName)}
        >
          <span
            className={cn(
              "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-600",
              bulletClassName,
            )}
          />
          <RichTextContent html={item} className={className} />
        </li>
      ))}
    </>
  );
}
