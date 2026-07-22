import { useEffect, useRef } from "react";

export function FoodConnectMap({
  donorLat,
  donorLng,
  claimantLat,
  claimantLng,
}: {
  donorLat: number | null;
  donorLng: number | null;
  claimantLat?: number | null;
  claimantLng?: number | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      const center: [number, number] =
        donorLat && donorLng ? [donorLat, donorLng] : [27.7172, 85.3240];

      mapInstance.current = L.map(mapRef.current, {
        center,
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(mapInstance.current);

      if (donorLat && donorLng) {
        const greenIcon = L.divIcon({
          className: "",
          html: `<div style="width:20px;height:20px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        L.marker([donorLat, donorLng], { icon: greenIcon })
          .addTo(mapInstance.current)
          .bindPopup("<b>Donor</b><br/>Pickup location");
      }

      if (claimantLat && claimantLng) {
        const blueIcon = L.divIcon({
          className: "",
          html: `<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        L.marker([claimantLat, claimantLng], { icon: blueIcon })
          .addTo(mapInstance.current)
          .bindPopup("<b>Recipient</b>");
      }

      if (donorLat && donorLng && claimantLat && claimantLng) {
        L.polyline(
          [
            [donorLat, donorLng],
            [claimantLat, claimantLng],
          ],
          { color: "#22c55e", weight: 2, dashArray: "6, 6" },
        ).addTo(mapInstance.current);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [donorLat, donorLng, claimantLat, claimantLng]);

  return (
    <div ref={mapRef} className="h-64 w-full rounded-2xl overflow-hidden border border-border" />
  );
}
