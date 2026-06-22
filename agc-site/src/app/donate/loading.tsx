import { PageHero } from "@/components/PageHero";

export default function DonateLoading() {
  return (
    <PageHero
      title="Support Our Work"
      subtitle="Make a Donation"
      image="/uploads/placeholder.svg"
      imageAlt="Loading donation page"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Donate" }]}
    />
  );
}
