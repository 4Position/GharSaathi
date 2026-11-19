import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyLeases, updateLeaseStatus } from "../services/lease.service";
function MyLeasesPage() {
  const { user } = useAuth();
  const [leases, setLeases] = useState([]);
  const [error, setError] = useState("");
  const load = () =>
    getMyLeases()
      .then(({ leases: results }) => setLeases(results))
      .catch((e) =>
        setError(e.response?.data?.error?.message || "Unable to load leases."),
      );
  useEffect(() => {
    load();
  }, []);
  const change = async (id, status) => {
    try {
      await updateLeaseStatus(id, status);
      load();
    } catch (e) {
      setError(e.response?.data?.error?.message || "Unable to update lease.");
    }
  };
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">My leases</h1>
      {error && (
        <p className="mt-5 rounded bg-red-50 p-3 text-red-700">{error}</p>
      )}
      {!error && leases.length === 0 && (
        <p className="mt-6 text-slate-600">No leases found.</p>
      )}
      <div className="mt-6 space-y-4">
        {leases.map((lease) => (
          <article
            className="rounded-xl border border-slate-200 bg-white p-5"
            key={lease.id}
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="font-semibold">
                  {lease.application.property.title}
                </h2>
                <p className="text-sm text-slate-600">
                  ₹{Number(lease.monthlyRent).toLocaleString("en-IN")} / month ·{" "}
                  {new Date(lease.startDate).toLocaleDateString()} to{" "}
                  {new Date(lease.endDate).toLocaleDateString()}
                </p>
              </div>
              {user.role === "LANDLORD" ? (
                <select
                  className="rounded border p-2 text-sm"
                  value={lease.status}
                  onChange={(e) => change(lease.id, e.target.value)}
                >
                  <option>ACTIVE</option>
                  <option>ENDED</option>
                  <option>TERMINATED</option>
                </select>
              ) : (
                <span className="text-sm font-semibold text-blue-800">
                  {lease.status}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
export default MyLeasesPage;
