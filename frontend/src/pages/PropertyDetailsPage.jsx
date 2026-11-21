import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { submitApplication } from "../services/application.service";
import { getProperty } from "../services/property.service";

function formatRent(rent) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(rent));
}

function PropertyDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      setIsLoading(true);
      setError("");

      try {
        const { property: result } = await getProperty(id);
        setProperty(result);
      } catch (requestError) {
        setError(
          requestError.response?.data?.error?.message ||
            "Unable to load this property.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProperty();
  }, [id]);

  if (isLoading)
    return (
      <p className="mx-auto max-w-6xl px-6 py-12 text-slate-600">
        Loading property...
      </p>
    );
  if (error)
    return (
      <p
        className="mx-auto mt-8 max-w-6xl rounded-md bg-red-50 px-6 py-4 text-red-700"
        role="alert"
      >
        {error}
      </p>
    );

  async function apply(event) {
    event.preventDefault();
    try {
      await submitApplication({ propertyId: property.id, message });
      setNotice("Application submitted successfully.");
      setShowForm(false);
    } catch (requestError) {
      setNotice(
        requestError.response?.data?.error?.message ||
          "Unable to submit application.",
      );
    }
  }
  function openApplication() {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: `/properties/${id}` } },
      });
      return;
    }
    if (user.role !== "TENANT") {
      setNotice("Only tenant accounts can submit applications.");
      return;
    }
    setShowForm(true);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link
        className="text-sm font-medium text-blue-800 hover:underline"
        to="/properties"
      >
        ← Back to properties
      </Link>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {property.images.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {property.images.map((image) => (
                <img
                  className="h-64 w-full rounded-xl object-cover"
                  key={image.id}
                  src={image.imageUrl}
                  alt={property.title}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              No property images available
            </div>
          )}
        </div>
        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            {property.title}
          </h1>
          <p className="mt-3 text-slate-600">
            {property.address}, {property.city}
          </p>
          <p className="mt-5 text-2xl font-bold text-blue-800">
            {formatRent(property.rent)}{" "}
            <span className="text-sm font-normal text-slate-500">/ month</span>
          </p>
          <p className="mt-3 text-slate-700">
            {property.bedrooms} bedrooms · {property.bathrooms} bathrooms
          </p>
          <p className="mt-5 whitespace-pre-line text-slate-600">
            {property.description || "No description provided."}
          </p>
          <p className="mt-6 text-sm text-slate-500">
            Listed by {property.landlord.name}
          </p>
          {notice && (
            <p
              className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800"
              role="status"
            >
              {notice}
            </p>
          )}
          {showForm && (
            <form className="mt-4" onSubmit={apply}>
              <textarea
                className="w-full rounded border p-2 text-sm"
                placeholder="Optional message to the landlord"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="mt-2 w-full rounded bg-blue-800 px-3 py-2 text-sm text-white">
                Submit application
              </button>
            </form>
          )}
          {!showForm && (
            <button
              className="mt-6 w-full rounded-md bg-blue-800 px-4 py-2 font-medium text-white hover:bg-blue-900"
              type="button"
              onClick={openApplication}
            >
              Apply now
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}

export default PropertyDetailsPage;
