import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import { getProperties } from "../services/property.service";

function PropertyListPage() {
  const [filters, setFilters] = useState({
    city: "",
    minRent: "",
    maxRent: "",
    bedrooms: "",
  });
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadProperties(activeFilters = {}) {
    setIsLoading(true);
    setError("");

    try {
      const { properties: results } = await getProperties(activeFilters);
      setProperties(results);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message ||
          "Unable to load properties. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  function handleChange(event) {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    loadProperties(filters);
  }

  function clearFilters() {
    const emptyFilters = { city: "", minRent: "", maxRent: "", bedrooms: "" };
    setFilters(emptyFilters);
    loadProperties(emptyFilters);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Browse rentals
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Available properties
          </h1>
        </div>
      </div>
      <form
        className="mt-7 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={handleSubmit}
      >
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          name="city"
          placeholder="City"
          value={filters.city}
          onChange={handleChange}
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          name="minRent"
          type="number"
          min="0"
          placeholder="Minimum rent"
          value={filters.minRent}
          onChange={handleChange}
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          name="maxRent"
          type="number"
          min="0"
          placeholder="Maximum rent"
          value={filters.maxRent}
          onChange={handleChange}
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          name="bedrooms"
          type="number"
          min="0"
          placeholder="Bedrooms"
          value={filters.bedrooms}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <button
            className="rounded-md bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
            type="submit"
          >
            Apply filters
          </button>
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            type="button"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
      </form>

      {isLoading && (
        <p className="py-12 text-slate-600">Loading properties...</p>
      )}
      {!isLoading && error && (
        <p
          className="mt-6 rounded-md bg-red-50 px-4 py-3 text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      {!isLoading && !error && properties.length === 0 && (
        <p className="py-12 text-slate-600">
          No available properties match your filters.
        </p>
      )}
      {!isLoading && !error && properties.length > 0 && (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PropertyListPage;
