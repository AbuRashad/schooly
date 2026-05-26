import { useEffect, useState } from "react";
import type { SSILiveData, SSIHistoryData, UnitInfo, AnalyticsOverview, ReportItem, ReportStats, StudentPortalData, AgentSessionInsights, EngagementSnapshotRecord, AlertFeedItem } from "../types/monitoring";

const BASE = "/api/v1";

export function useSSILive() {
  const [data, setData] = useState<SSILiveData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/ssi/live`)
      .then((r) => r.json())
      .then((d) => setData(d as SSILiveData))
      .catch(() => setError("SSI live endpoint unavailable."));
  }, []);

  return { data, error };
}

export function useSSIHistory() {
  const [data, setData] = useState<SSIHistoryData | null>(null);

  useEffect(() => {
    fetch(`${BASE}/ssi/history`)
      .then((r) => r.json())
      .then((d) => setData(d as SSIHistoryData))
      .catch(() => null);
  }, []);

  return data;
}

export function useUnits() {
  const [units, setUnits] = useState<UnitInfo[]>([]);

  useEffect(() => {
    fetch(`${BASE}/units`)
      .then((r) => r.json())
      .then((d) => setUnits(d as UnitInfo[]))
      .catch(() => null);
  }, []);

  return units;
}

export function useAnalyticsOverview() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/analytics/overview`)
      .then((r) => r.json())
      .then((d) => setData(d as AnalyticsOverview))
      .catch(() => setError("Analytics endpoint unavailable."));
  }, []);

  return { data, error };
}

export function useReportsList() {
  const [data, setData] = useState<ReportItem[]>([]);

  useEffect(() => {
    fetch(`${BASE}/reports/list`)
      .then((r) => r.json())
      .then((d) => setData(d as ReportItem[]))
      .catch(() => null);
  }, []);

  return data;
}

export function useReportsStats() {
  const [data, setData] = useState<ReportStats | null>(null);

  useEffect(() => {
    fetch(`${BASE}/reports/stats`)
      .then((r) => r.json())
      .then((d) => setData(d as ReportStats))
      .catch(() => null);
  }, []);

  return data;
}

export function useStudentPortal() {
  const [data, setData] = useState<StudentPortalData | null>(null);

  useEffect(() => {
    fetch(`${BASE}/portal/student`)
      .then((r) => r.json())
      .then((d) => setData(d as StudentPortalData))
      .catch(() => null);
  }, []);

  return data;
}

export function useAgentInsights() {
  const [data, setData] = useState<AgentSessionInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/agent/insights`)
      .then((r) => r.json())
      .then((d) => setData(d as AgentSessionInsights))
      .catch(() => setError("Agent insights endpoint unavailable."));
  }, []);

  return { data, error };
}

export function useStudentBehavioralHistory(studentId: string, days = 30) {
  const [data, setData] = useState<EngagementSnapshotRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BASE}/students/${encodeURIComponent(studentId)}/behavioral-history?days=${days}`)
      .then((r) => r.json())
      .then((d) => setData(d as EngagementSnapshotRecord[]))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [studentId, days]);

  return { data, loading, error };
}

type CameraAgentAlertRecord = {
  alert_id: string;
  title: string;
  message: string;
  severity: "critical" | "warning";
  zone_label: string;
  updated_at: string;
};

type ComputerVisionRiskRecord = {
  risk_id: string;
  title: string;
  message: string;
  severity: "critical" | "warning";
  reason: string;
  updated_at: string;
};

export function useCameraAgentAlerts() {
  const [alerts, setAlerts] = useState<AlertFeedItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch(`${BASE}/cameras/agent/alerts?active_only=true&limit=20`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          const raw = Array.isArray(d?.alerts) ? (d.alerts as CameraAgentAlertRecord[]) : [];
          const mapped: AlertFeedItem[] = raw.map((a) => ({
            id: a.alert_id,
            title: a.title,
            message: a.message,
            severity: a.severity,
            stream: "anomaly",
            timestamp: new Date(a.updated_at).toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setAlerts(mapped);
        })
        .catch(() => {
          if (!cancelled) setAlerts([]);
        });
    };

    load();
    const id = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return alerts;
}

export function useComputerVisionAgentAlerts() {
  const [alerts, setAlerts] = useState<AlertFeedItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch(`${BASE}/computer-vision/agent/risks?active_only=true&limit=20`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          const raw = Array.isArray(d?.risks) ? (d.risks as ComputerVisionRiskRecord[]) : [];
          const mapped: AlertFeedItem[] = raw.map((a) => ({
            id: a.risk_id,
            title: a.title,
            message: a.message,
            severity: a.severity,
            stream: a.reason.includes("coherence")
              ? "coherence"
              : a.reason.includes("density")
                ? "density"
                : "anomaly",
            timestamp: new Date(a.updated_at).toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setAlerts(mapped);
        })
        .catch(() => {
          if (!cancelled) setAlerts([]);
        });
    };

    load();
    const id = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return alerts;
}
