"use client";

import dynamic from "next/dynamic";

const LaunchSiteMap = dynamic(() => import("@/components/maps/launch-site-map").then((mod) => mod.LaunchSiteMap), {
  ssr: false,
  loading: () => <div className="flex min-h-[520px] items-center justify-center rounded-lg bg-white/[0.03] text-sm text-slate-400">Loading orbital ground network</div>
});

type LaunchSitePoint = {
  id: string;
  name: string;
  code?: string | null;
  country: string;
  latitude: number;
  longitude: number;
  missions: number;
};

export function LaunchSiteMapLoader({ sites }: { sites: LaunchSitePoint[] }) {
  return <LaunchSiteMap sites={sites} />;
}
