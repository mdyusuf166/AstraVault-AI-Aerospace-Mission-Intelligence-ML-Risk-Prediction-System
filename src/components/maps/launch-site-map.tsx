"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type LaunchSitePoint = {
  id: string;
  name: string;
  code?: string | null;
  country: string;
  latitude: number;
  longitude: number;
  missions: number;
};

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function LaunchSiteMap({ sites }: { sites: LaunchSitePoint[] }) {
  return (
    <MapContainer center={[22, 20]} zoom={2} scrollWheelZoom className="overflow-hidden rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sites.map((site) => (
        <Marker key={site.id} position={[site.latitude, site.longitude]} icon={icon}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{site.name}</p>
              <p className="text-xs text-slate-300">{site.code ?? site.country}</p>
              <p className="text-xs text-slate-300">{site.missions} missions tracked</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
