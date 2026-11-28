import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
          <Compass className="h-10 w-10" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand-600">
          404
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 max-w-md text-ink-500">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s
          get you back into the loop.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/">
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to home
            </Button>
          </Link>
          <Link to="/app">
            <Button variant="outline">Open the app</Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}