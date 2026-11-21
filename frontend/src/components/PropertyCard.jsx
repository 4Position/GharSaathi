import { Link } from "react-router-dom";

function formatRent(rent) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(rent));
}

function PropertyCard({ property, showStatus = false, actions }) {
  const imageUrl = property.images?.[0]?.imageUrl;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {imageUrl ? (
        <img
          className="h-48 w-full object-cover"
          src={imageUrl}
          alt={property.title}
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-slate-100 text-sm text-slate-500">
          No property image
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {property.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {property.city} · {property.address}
            </p>
          </div>
          {showStatus && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {property.status}
            </span>
          )}
        </div>
        <p className="mt-4 text-lg font-bold text-blue-800">
          {formatRent(property.rent)}{" "}
          <span className="text-sm font-normal text-slate-500">/ month</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {property.bedrooms} bedrooms · {property.bathrooms} bathrooms
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
            to={`/properties/${property.id}`}
          >
            View details
          </Link>
          {actions}
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;
