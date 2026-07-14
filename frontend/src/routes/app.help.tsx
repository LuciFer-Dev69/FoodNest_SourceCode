import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/primitives";

export const Route = createFileRoute("/app/help")({
  head: () => ({ meta: [{ title: "Help — FoodNest" }] }),
  component: Help,
});

function Help() {
  const faqs = [
    ["How do I add an item?", "Tap the + button in the Inventory page or the floating + everywhere."],
    ["How is expiry calculated?", "Based on the expiry date you enter or the average for that category."],
    ["Who sees my donations?", "Only neighbours within your chosen radius."],
    ["Is my data private?", "Yes. End-to-end encrypted backups and 2FA-ready accounts."],
  ];
  return (
    <>
      <PageHeader title="Help & resources" subtitle="We're here when you need us." />
      <div className="grid gap-4">
        {faqs.map(([q, a]) => (
          <Panel key={q}>
            <p className="font-semibold">{q}</p>
            <p className="mt-1 text-sm text-muted-foreground">{a}</p>
          </Panel>
        ))}
      </div>
    </>
  );
}
