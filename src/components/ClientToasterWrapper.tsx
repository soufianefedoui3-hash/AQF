"use client";

import { ClientToaster } from "@/components/ui/ClientToaster";

/**
 * Client boundary for the root layout toaster.
 * Keeps react-hot-toast out of the Server Component layout.
 */
export default function ClientToasterWrapper() {
  return <ClientToaster />;
}
