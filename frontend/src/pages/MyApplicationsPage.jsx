import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyApplications } from "../services/application.service";
function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getMyApplications()
      .then(({ applications: results }) => setApplications(results))
      .catch((e) =>
        setError(
          e.response?.data?.error?.message || "Unable to load applications.",
        ),
      );
  }, []);
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">My applications</h1>
      {error && (
        <p className="mt-5 rounded bg-red-50 p-3 text-red-700">{error}</p>
      )}
      {!error && applications.length === 0 && (
        <p className="mt-6 text-slate-600">
          You have not submitted any applications.
        </p>
      )}
      <div className="mt-6 space-y-4">
        {applications.map((application) => (
          <article
            className="rounded-xl border border-slate-200 bg-white p-5"
            key={application.id}
          >
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {application.property.title}
                </h2>
                <p className="text-sm text-slate-600">
                  {application.property.city} · Applied{" "}
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="text-sm font-semibold text-blue-800">
                {application.status}
              </span>
            </div>
            {application.message && (
              <p className="mt-3 text-slate-600">{application.message}</p>
            )}
            <Link
              className="mt-4 inline-block text-sm font-medium text-blue-800"
              to={`/properties/${application.propertyId}`}
            >
              View property
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
export default MyApplicationsPage;
