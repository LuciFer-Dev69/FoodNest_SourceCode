import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  HeartHandshake, Package, Clock, CheckCheck, XCircle, User,
} from "lucide-react";
import type { FoodConnectListController } from "@/controllers/food-connect.controller";

const STATUS_COLORS: Record<string, string> = {
  Reserved: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Completed: "bg-green-500/15 text-green-600 dark:text-green-400",
  Cancelled: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
};

const STATUS_ICONS: Record<string, any> = {
  Reserved: Clock,
  Completed: CheckCheck,
  Cancelled: XCircle,
};

export function FoodConnectList({
  active, history, loading, userId, handleOpen,
}: FoodConnectListController) {
  if (loading) {
    return (
      <div className="grid place-items-center h-[60vh] text-muted-foreground text-sm">
        Loading food connects…
      </div>
    );
  }

  if (active.length === 0 && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <HeartHandshake className="h-16 w-16 text-primary/40" />
        <h2 className="text-xl font-bold">Food Connect</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          No food connects yet. Claim a donation or have someone claim yours to get started.
        </p>
        <Link
          to="/app/donations"
          className="rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
        >
          Go to Donations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {active.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Active ({active.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((item) => (
              <FoodConnectCard key={item.id} item={item} userId={userId} onClick={handleOpen} />
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            History ({history.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <FoodConnectCard key={item.id} item={item} userId={userId} onClick={handleOpen} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FoodConnectCard({ item, userId, onClick }: { item: any; userId?: string; onClick: (id: string) => void }) {
  const isDonor = userId ? item.donor.id === userId : false;
  const otherPerson = isDonor ? item.claimant : item.donor;
  const StatusIcon = STATUS_ICONS[item.status] || HeartHandshake;

  return (
    <motion.button
      onClick={() => onClick(item.id)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card w-full space-y-3 rounded-3xl p-4 text-left transition hover:shadow-lift"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
          {item.image ? (
            <img src={item.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <Package className="h-5 w-5 text-emerald-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{item.foodName}</p>
          <p className="text-[11px] text-muted-foreground">{item.category}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[item.status] || ""}`}>
          {item.status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <User className="h-3 w-3 shrink-0" />
        <span className="truncate">
          {otherPerson ? (
            <>{isDonor ? "Claimed by" : "Donated by"} <strong>{otherPerson.name}</strong></>
          ) : "No recipient yet"}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <StatusIcon className="h-3 w-3 shrink-0" />
        <span>
          {item.status === "Reserved" && item.claimedAt
            ? `Claimed ${new Date(item.claimedAt).toLocaleDateString()}`
            : item.status === "Completed" && item.completedAt
              ? `Completed ${new Date(item.completedAt).toLocaleDateString()}`
              : `Created ${new Date(item.createdAt).toLocaleDateString()}`}
        </span>
      </div>
    </motion.button>
  );
}
