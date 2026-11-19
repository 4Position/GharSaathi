import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getReceivedApplications } from "../services/application.service";
import { createLease } from "../services/lease.service";
function CreateLeasePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [applicationId, setApplicationId] = useState(
    params.get("applicationId") || "",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    getReceivedApplications()
      .then(({ applications: results }) =>
        setApplications(results.filter((item) => item.status === "APPROVED")),
      )
      .catch((e) =>
        setError(
          e.response?.data?.error?.message ||
            "Unable to load approved applications.",
        ),
      );
  }, []);
  const selected = useMemo(
    () =>
      applications.find((item) => String(item.id) === String(applicationId)),
    [applications, applicationId],
  );
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!applicationId || !startDate || !endDate || startDate >= endDate) {
      setError("Choose an approved application and a valid date range.");
      return;
    }
    try {
      await createLease({
        applicationId: Number(applicationId),
        startDate,
        endDate,
      });
      navigate("/leases", { replace: true });
    } catch (e) {
      setError(e.response?.data?.error?.message || "Unable to create lease.");
    }
  };
  return (
    <section className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Create lease</h1>
      {error && (
        <p className="mt-5 rounded bg-red-50 p-3 text-red-700">{error}</p>
      )}
      <form
        className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6"
        onSubmit={submit}
      >
        <select
          className="w-full rounded border p-2"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
        >
          <option value="">Select approved application</option>
          {applications.map((item) => (
            <option value={item.id} key={item.id}>
              {item.property.title} — {item.tenant.name}
            </option>
          ))}
        </select>
        {selected && (
          <p className="text-sm text-slate-600">
            Monthly rent: ₹
            {Number(selected.property.rent).toLocaleString("en-IN")}
          </p>
        )}
        <label className="block text-sm">
          Start date
          <input
            className="mt-1 w-full rounded border p-2"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          End date
          <input
            className="mt-1 w-full rounded border p-2"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button className="rounded bg-blue-800 px-4 py-2 text-white">
          Create active lease
        </button>
      </form>
    </section>
  );
}
export default CreateLeasePage;
