import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getReceivedApplications,
  updateApplicationStatus,
} from "../services/application.service";
function ReceivedApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const load = () =>
    getReceivedApplications()
      .then(({ applications: results }) => setApplications(results))
      .catch((e) =>
        setError(
          e.response?.data?.error?.message || "Unable to load applications.",
        ),
      );
  useEffect(() => {
    load();
  }, []);
  const review = async (id, status) => {
    try {
      await updateApplicationStatus(id, status);
      load();
    } catch (e) {
      setError(
        e.response?.data?.error?.message || "Unable to update application.",
      );
    }
  };
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">
        Received applications
      </h1>
      {error && (
        <p className="mt-5 rounded bg-red-50 p-3 text-red-700">{error}</p>
      )}
      {!error && applications.length === 0 && (
        <p className="mt-6 text-slate-600">
          You have not received any applications.
        </p>
      )}
      <div className="mt-6 space-y-4">
        {applications.map((application) => (
          <article
            className="rounded-xl border border-slate-200 bg-white p-5"
            key={application.id}
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {application.property.title}
                </h2>
                <p className="text-sm text-slate-600">
                  Applicant: {application.tenant.name} ·{" "}
                  {application.tenant.email}
                </p>
              </div>
              <span className="text-sm font-semibold text-blue-800">
                {application.status}
              </span>
            </div>
            {application.message && (
              <p className="mt-3 text-slate-600">{application.message}</p>
            )}
            {application.status === "PENDING" && (
              <div className="mt-4 flex gap-3">
                <button
                  className="rounded bg-green-700 px-3 py-2 text-sm text-white"
                  onClick={() => review(application.id, "APPROVED")}
                >
                  Approve
                </button>
                <button
                  className="rounded border border-red-200 px-3 py-2 text-sm text-red-700"
                  onClick={() => review(application.id, "REJECTED")}
                >
                  Reject
                </button>
              </div>
            )}
            {application.status === "APPROVED" && (
              <Link
                className="mt-4 inline-block rounded bg-blue-800 px-3 py-2 text-sm text-white"
                to={`/landlord/leases/new?applicationId=${application.id}`}
              >
                Create lease
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
export default ReceivedApplicationsPage;
