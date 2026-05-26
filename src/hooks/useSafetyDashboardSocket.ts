import { useEffect, useMemo, useState } from "react";
import type { DashboardSnapshot, HeatmapCell } from "../types/monitoring";

const disconnectedSnapshot: DashboardSnapshot = {
  schoolName: "Schooly",
  ssi: 0,
  benchmark: 75,
  websocketStatus: "offline",
  fetchedFromBackend: false,
  availableTimeSlots: ["live", "prediction_15m"],
  liveAlerts: [],
  heatmapCells: [],
  backendError: "Backend disconnected. Live data unavailable.",
};

type BackendResponse = Partial<DashboardSnapshot>;

export function useSafetyDashboardSocket(url = "ws://127.0.0.1:8000/api/v1/dashboard/ws") {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(disconnectedSnapshot);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboardState() {
      try {
        const [summaryRes, alertsRes, heatmapRes] = await Promise.all([
          fetch("/api/v1/dashboard/summary"),
          fetch("/api/v1/dashboard/alerts"),
          fetch("/api/v1/dashboard/heatmap"),
        ]);

        if (!summaryRes.ok || !alertsRes.ok || !heatmapRes.ok) {
          throw new Error("backend unavailable");
        }

        const summary = (await summaryRes.json()) as BackendResponse;
        const alerts = (await alertsRes.json()) as unknown;
        const heatmap = (await heatmapRes.json()) as { cells?: HeatmapCell[]; availableTimeSlots?: string[] };

        if (!cancelled) {
          setSnapshot((current: DashboardSnapshot) => ({
            ...current,
            ...summary,
            liveAlerts: Array.isArray(alerts) ? alerts : current.liveAlerts,
            heatmapCells: Array.isArray(heatmap?.cells) ? heatmap.cells : current.heatmapCells,
            availableTimeSlots: Array.isArray(heatmap?.availableTimeSlots)
              ? heatmap.availableTimeSlots
              : current.availableTimeSlots,
            fetchedFromBackend: true,
            backendError: undefined,
          }));
        }
      } catch {
        if (!cancelled) {
          setSnapshot({
            ...disconnectedSnapshot,
            websocketStatus: "offline",
            backendError: "Backend disconnected. REST dashboard endpoints are unavailable.",
          });
        }
      }
    }

    void fetchDashboardState();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!url) return undefined;

    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(url);

      socket.onopen = () => {
        setSnapshot((current: DashboardSnapshot) => ({
          ...current,
          websocketStatus: "connected",
          backendError: undefined,
        }));
      };

      socket.onclose = () => {
        setSnapshot((current: DashboardSnapshot) => ({
          ...current,
          websocketStatus: "reconnecting",
          backendError: current.fetchedFromBackend
            ? undefined
            : "Backend disconnected. WebSocket stream unavailable.",
        }));
      };

      socket.onerror = () => {
        setSnapshot((current: DashboardSnapshot) => ({
          ...current,
          websocketStatus: "offline",
          backendError: current.fetchedFromBackend
            ? undefined
            : "Backend disconnected. WebSocket stream unavailable.",
        }));
      };

      socket.onmessage = (event: MessageEvent) => {
        try {
          const next = JSON.parse(event.data as string) as DashboardSnapshot;
          setSnapshot((current: DashboardSnapshot) => ({
            ...current,
            ...next,
            fetchedFromBackend: true,
            backendError: undefined,
          }));
        } catch {
          setSnapshot((current: DashboardSnapshot) => ({
            ...current,
            websocketStatus: "offline",
            backendError: "Dashboard stream returned malformed data.",
          }));
        }
      };
    } catch {
      setSnapshot((current: DashboardSnapshot) => ({
        ...current,
        websocketStatus: "offline",
        backendError: "Unable to initialize WebSocket stream.",
      }));
    }

    return () => { socket?.close(); };
  }, [url]);

  return useMemo(() => snapshot, [snapshot]);
}
