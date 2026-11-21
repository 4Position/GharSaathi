import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import {
  getMyProperties,
  updatePropertyStatus,
} from "../services/property.service";

function LandlordDashboard() {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(location.state?.message || "");

  async function loadProperties() {
    setIsLoading(true);
    setError("");
    try {
      const { properties: results } = await getMyProperties();
      setProperties(results);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message ||
          "Unable to load your properties.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  const counts = useMemo(
    () => ({
      total: properties.length,
      available: properties.filter(
        (property) => property.status === "AVAILABLE",
      ).length,
      unavailable: properties.filter(
        (property) => property.status === "UNAVAILABLE",
      ).length,
      archived: properties.filter((property) => property.status === "ARCHIVED")
        .length,
    }),
    [properties],
  );

  async function handleStatusChange(id, status) {
    setError("");
    try {
      await updatePropertyStatus(id, status);
      setMessage("Property status updated successfully.");
      loadProperties();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message ||
          "Unable to update the property status.",
      );
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
        Landlord dashboard
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Your properties</h1>
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700"
            to="/payments"
          >
            Payments
          </Link>
          <Link
            className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700"
            to="/maintenance"
          >
            Maintenance
          </Link>
          <Link
            className="rounded-md bg-blue-800 px-4 py-2 font-medium text-white hover:bg-blue-900"
            to="/landlord/properties/new"
          >
            Add property
          </Link>
        </div>
      </div>
      {message && (
        <p
          className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          {message}
        </p>
      )}
      {error && (
        <p
          className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(counts).map(([label, count]) => (
          <div
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            key={label}
          >
            <p className="text-sm capitalize text-slate-600">
              {label} properties
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{count}</p>
          </div>
        ))}
      </div>
      {isLoading && (
        <p className="py-12 text-slate-600">Loading your properties...</p>
      )}
      {!isLoading && properties.length === 0 && !error && (
        <p className="py-12 text-slate-600">
          You have not added any properties yet.
        </p>
      )}
      {!isLoading && properties.length > 0 && (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              showStatus
              actions={
                <>
                  <Link
                    className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    to={`/landlord/properties/${property.id}/edit`}
                  >
                    Edit
                  </Link>
                  <select
                    className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                    aria-label={`Change status for ${property.title}`}
                    value={property.status}
                    onChange={(event) =>
                      handleStatusChange(property.id, event.target.value)
                    }
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  {property.status !== "ARCHIVED" && (
                    <button
                      className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                      type="button"
                      onClick={() =>
                        handleStatusChange(property.id, "ARCHIVED")
                      }
                    >
                      Archive
                    </button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default LandlordDashboard;
