import { PageHero } from "@/components/PageHero";
import { donateDefaultHeroImage } from "@/data/donate-page";

export default function DonateLoading() {
  return (
    <PageHero
      title="Support Our Work"
      subtitle="Make a Donation"
      image={donateDefaultHeroImage}
      imageAlt="Loading donation page"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Donate" }]}
    />
  );
}
