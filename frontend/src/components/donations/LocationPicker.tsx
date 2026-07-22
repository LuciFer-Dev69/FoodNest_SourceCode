import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

const CENTERS: Record<string, [number, number]> = {
  Nepal: [27.7172, 85.3240],
  Malaysia: [3.1390, 101.6869],
};

export function LocationPicker({
  country,
  latitude,
  longitude,
  onLocationChange,
}: {
  country: string;
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mapInstance.current) {
        const center = CENTERS[country] || CENTERS.Nepal;
        mapInstance.current = L.map(mapRef.current, {
          center,
          zoom: 12,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 18,
        }).addTo(mapInstance.current);

        mapInstance.current.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          onLocationChange(lat, lng);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { draggable: true })
              .addTo(mapInstance.current)
              .bindPopup("Pickup location")
              .openPopup();
            markerRef.current.on("dragend", (ev: any) => {
              const pos = ev.target.getLatLng();
              onLocationChange(pos.lat, pos.lng);
            });
          }
        });
      } else {
        const center = CENTERS[country] || CENTERS.Nepal;
        mapInstance.current.setView(center, 12);
      }

      if (latitude && longitude) {
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          markerRef.current = L.marker([latitude, longitude], { draggable: true })
            .addTo(mapInstance.current)
            .bindPopup("Pickup location")
            .openPopup();
          markerRef.current.on("dragend", (ev: any) => {
            const pos = ev.target.getLatLng();
            onLocationChange(pos.lat, pos.lng);
          });
        }
        mapInstance.current.setView([latitude, longitude], 14);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [country]);

  return (
    <div className="space-y-2">
      <span className="mb-1 block text-sm font-medium">Pickup Location (click on map)</span>
      <div ref={mapRef} className="h-52 w-full rounded-2xl overflow-hidden border border-border" />
      {latitude && longitude ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 text-primary" />
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Click on the map to set pickup location</p>
      )}
    </div>
  );
}
