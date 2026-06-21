import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

type Props = {
  intro?: string;
  programsEmail: string;
  contactHref?: string;
  contactLabel?: string;
  className?: string;
};

export function EmptyListingCard({
  intro,
  programsEmail,
  contactHref = "/contact",
  contactLabel = "Contact Us",
  className,
}: Props) {
  const hasIntro = Boolean(intro?.trim());

  return (
    <div className={cn("page-card max-w-2xl p-8", className)}>
      {hasIntro ? <p className="page-prose">{intro}</p> : null}
      <p className={cn("page-prose", hasIntro && "mt-6")}>
        Stay up-to-date with our latest updates. Subscribe to our newsletter or
        contact{" "}
        <a
          href={`mailto:${programsEmail}`}
          className="font-medium text-accent-600 hover:underline"
        >
          {programsEmail}
        </a>{" "}
        to receive updates.
      </p>
      <Button asChild href={contactHref} variant="outline" className="mt-6">
        {contactLabel}
      </Button>
    </div>
  );
}
