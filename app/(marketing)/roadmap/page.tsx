import { RoadmapList } from "@/components/marketing/roadmap-list";
import { ContentPage } from "@/components/pages/content-page";

export default function RoadmapPage() {
  return (
    <ContentPage
      eyebrow="Milestone map"
      title="Roadmap"
      description="JETS is being built in deliberate layers. Each version should create a stronger product foundation without sneaking in the next milestone early."
    >
      <RoadmapList />
    </ContentPage>
  );
}
