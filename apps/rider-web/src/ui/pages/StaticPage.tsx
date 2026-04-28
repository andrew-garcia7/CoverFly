import { Link } from "react-router-dom";

export function StaticPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <Link to="/" className="text-sm text-blue-700 font-medium hover:underline">
        ← Back home
      </Link>
      <h1 className="mt-6 text-3xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-4 text-slate-600 leading-relaxed">
        We are preparing this page. Please check back soon, or reach out via the contact link in the footer.
      </p>
    </div>
  );
}
