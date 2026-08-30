import { getLeadStats } from "@/lib/leads/store";
import {
  DashboardClient,
  type DashboardPayload,
} from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMPTY: DashboardPayload = {
  stats: {
    totalLeads: 0,
    consultations: 0,
    accompagnements: 0,
    formations: 0,
    audits: 0,
    webServices: 0,
    applications: 0,
  },
  recent: [],
};

export default async function AdminDashboardPage() {
  let initial = EMPTY;
  let initialError: string | null = null;

  try {
    initial = await getLeadStats();
  } catch (error) {
    console.error("[admin] dashboard stats failed:", error);
    initialError = "Impossible de charger les statistiques";
  }

  return <DashboardClient initial={initial} initialError={initialError} />;
}
