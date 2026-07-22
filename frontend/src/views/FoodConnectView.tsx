import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, HeartHandshake, CheckCheck, XCircle, Truck, ExternalLink,
  MapPin, Clock, User, Mail, Loader2,
} from "lucide-react";
import { FoodConnectMap } from "@/components/donations/FoodConnectMap";
import type { FoodConnectController } from "@/controllers/food-connect.controller";

export function FoodConnectView({
  data, loading, isDonor, isClaimant,
  handleComplete, handleCancel, handleBack,
  handleProposeDelivery, handleAcceptDelivery, handleRejectDelivery,
  fetchData,
}: FoodConnectController) {
  if (loading) {
    return (
      <div className="grid place-items-center h-[80vh] text-muted-foreground text-sm">
        Loading food connect…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid place-items-center h-[80vh] text-muted-foreground text-sm">
        Food connect not found.
      </div>
    );
  }

  const f = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  const PARTNERS: { label: string; url: string; logo: string }[] = data.pickupLocation.country === "Nepal"
    ? [
        { label: "Yango", url: "https://yango.com/", logo: f("yango.com") },
        { label: "InDrive", url: "https://indrive.com/delivery", logo: f("indrive.com") },
        { label: "Pathao", url: "https://pathao.com/delivery", logo: f("pathao.com") },
      ]
    : [
        { label: "Grab", url: "https://www.grab.com/my/delivery", logo: f("grab.com") },
        { label: "InDrive", url: "https://indrive.com/delivery", logo: f("indrive.com") },
        { label: "Maxim", url: "https://maxim.com/", logo: f("maxim.com") },
        { label: "Air Asia Ride", url: "https://www.airasia.com/ride", logo: f("airasia.com") },
      ];

  const chosenPartner = PARTNERS.find((p) => p.label === data.deliveryPartner);

  const ds = data.deliveryStatus;
  const dm = data.deliveryMethod;

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    if (ds === "proposed" && isClaimant) {
      pollingRef.current = setInterval(() => {
        pollCountRef.current += 1;
        if (pollCountRef.current >= 24) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
          return;
        }
        fetchData();
      }, 5000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      pollCountRef.current = 0;
    };
  }, [ds, isClaimant, fetchData]);

  return (
    <div className="space-y-6 pb-8">
      <button onClick={handleBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="h-4 w-4" /> Back to Donations
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Donation Details */}
        <div className="glass-card rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
              {data.image ? (
                <img src={data.image} alt="" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <HeartHandshake className="h-6 w-6 text-emerald-500" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">{data.foodName}</h2>
              <p className="text-xs text-muted-foreground">{data.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Quantity</span>
              <p className="font-semibold">{data.quantity} {data.unit}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <p className="font-semibold">{data.status}</p>
            </div>
            {data.pickupDate && (
              <div>
                <span className="text-muted-foreground">Pickup date</span>
                <p className="font-semibold">{data.pickupDate}</p>
              </div>
            )}
            {data.pickupTime && (
              <div>
                <span className="text-muted-foreground">Pickup time</span>
                <p className="font-semibold">{data.pickupTime}</p>
              </div>
            )}
          </div>

          {data.description && (
            <p className="text-sm text-muted-foreground">{data.description}</p>
          )}

          <div className="border-t border-border/40 pt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{data.pickupLocation.address || `${data.pickupLocation.city}, ${data.pickupLocation.country}`}</span>
            </div>
          </div>

          {/* Delivery section */}
          <div className="border-t border-border/40 pt-3 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">Delivery</p>

            {/* State: none + claimant → Self Pickup or choose partner */}
            {ds === "none" && isClaimant && data.status === "Reserved" && (
              <div className="space-y-2">
                <button
                  onClick={() => handleProposeDelivery("self_pickup")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
                >
                  <Truck className="h-4 w-4" /> Self Pickup
                </button>
                <p className="text-center text-xs text-muted-foreground">— or choose a delivery partner —</p>
                <div className="grid grid-cols-2 gap-2">
                  {PARTNERS.map((partner) => (
                    <button
                      key={partner.label}
                      onClick={() => handleProposeDelivery("third_party", partner.label)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-border px-3 py-2.5 text-xs font-medium hover:bg-secondary"
                    >
                      <img src={partner.logo} alt="" className="h-4 w-4 rounded" />
                      {partner.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">You'll send a request to the donor for confirmation.</p>
              </div>
            )}

            {/* State: proposed + claimant → waiting */}
            {ds === "proposed" && isClaimant && (
              <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for donor to confirm <strong>{data.deliveryPartner}</strong> delivery…
              </div>
            )}

            {/* State: proposed + donor → accept/reject with partner name */}
            {ds === "proposed" && isDonor && (
              <div className="space-y-2">
                <p className="text-sm">
                  Claimant proposes delivery via <strong>{data.deliveryPartner}</strong>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAcceptDelivery}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
                  >
                    <CheckCheck className="h-4 w-4" /> Accept
                  </button>
                  <button
                    onClick={handleRejectDelivery}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            )}

            {/* State: accepted → show method + chosen partner link */}
            {ds === "accepted" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-semibold">
                    {dm === "self_pickup" ? "Self Pickup" : `Delivery via ${data.deliveryPartner}`}
                  </span>
                </div>
                {dm === "third_party" && data.status !== "Cancelled" && chosenPartner && (
                  <div className="pt-2 space-y-2">
                    <a
                      href={chosenPartner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90"
                    >
                      <img src={chosenPartner.logo} alt="" className="h-5 w-5 rounded" />
                      Open {chosenPartner.label}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <details className="group">
                      <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground">
                        Other delivery partners
                      </summary>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {PARTNERS.filter((p) => p.label !== data.deliveryPartner).map((link) => (
                          <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                          >
                            <img src={link.logo} alt="" className="h-3.5 w-3.5 rounded" />
                            {link.label} <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </details>
                    <p className="text-[10px] text-muted-foreground">Opens external site. No booking or payment handled here.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="border-t border-border/40 pt-3 space-y-2">
            {ds === "accepted" && isDonor && data.status === "Reserved" && (
              <>
                <button
                  onClick={handleComplete}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
                >
                  <CheckCheck className="h-4 w-4" /> Complete Delivery
                </button>
                <button
                  onClick={handleCancel}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5"
                >
                  <XCircle className="h-4 w-4" /> Cancel
                </button>
              </>
            )}
            {data.status === "Completed" && (
              <p className="flex items-center justify-center gap-2 rounded-2xl bg-green-500/10 px-5 py-2.5 text-sm font-semibold text-green-600">
                <CheckCheck className="h-4 w-4" /> Completed
              </p>
            )}
            {data.status === "Cancelled" && (
              <p className="flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-500">
                <XCircle className="h-4 w-4" /> Cancelled
              </p>
            )}
          </div>
        </div>

        {/* Column 2: Map */}
        <div className="glass-card rounded-3xl p-5 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Pickup Location
          </h3>
          <div className="text-xs text-muted-foreground">
            {data.pickupLocation.address && <p>{data.pickupLocation.address}</p>}
            <p>{data.pickupLocation.city}, {data.pickupLocation.country}</p>
          </div>
          <FoodConnectMap
            donorLat={data.pickupLocation.latitude}
            donorLng={data.pickupLocation.longitude}
          />
        </div>

        {/* Column 3: People */}
        <div className="glass-card rounded-3xl p-5 space-y-5">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> People
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-sm font-bold text-emerald-600">
                {data.donor.profilePicture ? (
                  <img src={data.donor.profilePicture} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  data.donor.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{data.donor.name}</p>
                <p className="text-xs text-muted-foreground">Donor</p>
                {isDonor && <span className="text-[10px] text-primary font-semibold">You</span>}
                <a href={`mailto:${data.donor.email}`} className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
                  <Mail className="h-3 w-3" /> {data.donor.email}
                </a>
              </div>
            </div>

            {data.claimant && (
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-sm font-bold text-blue-600">
                  {data.claimant.profilePicture ? (
                    <img src={data.claimant.profilePicture} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    data.claimant.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{data.claimant.name}</p>
                  <p className="text-xs text-muted-foreground">Recipient</p>
                  {isClaimant && <span className="text-[10px] text-primary font-semibold">You</span>}
                  <a href={`mailto:${data.claimant.email}`} className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
                    <Mail className="h-3 w-3" /> {data.claimant.email}
                  </a>
                </div>
              </div>
            )}

            {!data.claimant && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No recipient yet
              </div>
            )}
          </div>

          {data.claimedAt && (
            <div className="border-t border-border/40 pt-3 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" /> Claimed {new Date(data.claimedAt).toLocaleDateString()}
              </div>
              {data.completedAt && (
                <div className="flex items-center gap-2">
                  <CheckCheck className="h-3 w-3" /> Completed {new Date(data.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
