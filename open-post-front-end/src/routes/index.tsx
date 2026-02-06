import { createFileRoute } from "@tanstack/react-router";
import { ContentCalendar } from "@/components/content-calendar";

export const Route = createFileRoute("/")({ component: CalendarPage });

function CalendarPage() {
  return <ContentCalendar />;
}