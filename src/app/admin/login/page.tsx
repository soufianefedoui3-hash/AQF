"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      if (!res.ok) {
        toast.error("Identifiants invalides");
        return;
      }

      toast.success("Connexion réussie");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-gradient p-4">
      <div className="w-full max-w-md rounded-2xl border border-primary-700/20 bg-white p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo variant="login" href={null} priority />
          <h1 className="mt-6 text-2xl font-bold text-primary-900">لوحة التحكم الخاصة</h1>
          <p className="mt-2 text-sm text-text-muted">Administration AQF</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="email"
            label="Email administrateur"
            type="email"
            required
            defaultValue="admin@aqf.ma"
          />
          <Input name="password" label="Mot de passe" type="password" required />
          <Button type="submit" loading={loading} className="w-full">
            <Lock className="h-4 w-4" />
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
