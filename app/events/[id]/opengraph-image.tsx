import { ogCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { prisma } from "@/lib/prisma";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "CrewGoals event";
export const runtime = "nodejs";

export default async function EventOpengraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { group: { select: { title: true } } },
  });

  if (!event) {
    return ogCard({ eyebrow: "CrewGoals", title: "Event not found" });
  }

  const when = event.startTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return ogCard({
    eyebrow: `${event.group.title} · ${event.locationName}`,
    title: event.title,
    chips: [when, event.status.toLowerCase()],
  });
}
