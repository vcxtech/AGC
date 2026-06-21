import { Download } from "lucide-react";
import { Button } from "@/components/Button";

export type ArticleDownloadItem = {
  label: string;
  href: string;
  description?: string;
};

type Props = {
  heading?: string;
  subheading?: string;
  items: ArticleDownloadItem[];
  downloadLabel?: string;
  bordered?: boolean;
};

export function ArticleDownloadSection({
  heading = "Download",
  subheading,
  items,
  downloadLabel = "Download",
  bordered = true,
}: Props) {
  if (items.length === 0) return null;

  return (
    <div className={bordered ? "mt-14 border-t border-border pt-10" : ""}>
      <h3 className="page-heading text-lg text-black">{heading}</h3>
      {subheading ? (
        <p className="mt-1 text-sm text-black">{subheading}</p>
      ) : null}
      <ul className="mt-6 space-y-4">
        {items.map((doc) => (
          <li key={`${doc.label}-${doc.href}`}>
            <div className="rounded-none border border-border/90 bg-white p-6 shadow-sm sm:p-8">
              <h4 className="page-heading text-xl text-black">{doc.label}</h4>
              {doc.description ? (
                <p className="mt-2 page-prose text-[0.98rem] text-black">
                  {doc.description}
                </p>
              ) : null}
              <Button
                asChild
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="mt-5 gap-2 rounded-none px-5 py-3"
              >
                <span className="inline-flex items-center gap-2">
                  <Download className="h-4 w-4" aria-hidden />
                  {downloadLabel}
                </span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
