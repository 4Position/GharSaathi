import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function TenantDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      {location.state?.message && (
        <p
          className="mb-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          {location.state.message}
        </p>
      )}
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
        Tenant dashboard
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Welcome, {user.name}
      </h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        Browse homes, keep track of your applications and leases, and manage
        payment and maintenance information.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="rounded-md bg-blue-800 px-4 py-2 font-medium text-white hover:bg-blue-900"
          to="/properties"
        >
          Browse properties
        </Link>
        <Link
          className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700"
          to="/payments"
        >
          My payments
        </Link>
        <Link
          className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700"
          to="/maintenance"
        >
          Maintenance
        </Link>
      </div>
    </section>
  );
}

export default TenantDashboard;
