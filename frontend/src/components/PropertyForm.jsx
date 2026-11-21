import { useEffect, useState } from "react";

const emptyForm = {
  title: "",
  description: "",
  address: "",
  city: "",
  rent: "",
  bedrooms: "",
  bathrooms: "",
  imageUrls: "",
};

function getFormValues(property) {
  if (!property) {
    return emptyForm;
  }

  return {
    title: property.title || "",
    description: property.description || "",
    address: property.address || "",
    city: property.city || "",
    rent: String(property.rent ?? ""),
    bedrooms: String(property.bedrooms ?? ""),
    bathrooms: String(property.bathrooms ?? ""),
    imageUrls: property.images?.map((image) => image.imageUrl).join("\n") || "",
  };
}

function getErrorMessage(error) {
  return (
    error.response?.data?.error?.message ||
    "Unable to save the property. Please try again."
  );
}

function PropertyForm({ initialProperty, onSubmit, submitLabel }) {
  const [formData, setFormData] = useState(() =>
    getFormValues(initialProperty),
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(getFormValues(initialProperty));
  }, [initialProperty]);

  function handleChange(event) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function validateAndBuildPayload() {
    if (formData.title.trim().length < 2) {
      return { error: "Title must contain at least 2 characters." };
    }

    if (formData.address.trim().length < 2 || formData.city.trim().length < 2) {
      return { error: "Address and city are required." };
    }

    const rent = Number(formData.rent);
    const bedrooms = Number(formData.bedrooms);
    const bathrooms = Number(formData.bathrooms);

    if (!Number.isFinite(rent) || rent <= 0) {
      return { error: "Monthly rent must be greater than zero." };
    }

    if (
      !Number.isInteger(bedrooms) ||
      bedrooms < 0 ||
      !Number.isInteger(bathrooms) ||
      bathrooms < 1
    ) {
      return {
        error:
          "Bedrooms must be zero or more, and bathrooms must be at least one.",
      };
    }

    const imageUrls = formData.imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    if (imageUrls.length > 10) {
      return { error: "Add no more than 10 image URLs." };
    }

    for (const imageUrl of imageUrls) {
      try {
        const url = new URL(imageUrl);
        if (!["http:", "https:"].includes(url.protocol)) {
          return { error: "Image URLs must use http or https." };
        }
      } catch (requestError) {
        return { error: "Each image URL must be valid." };
      }
    }

    return {
      value: {
        title: formData.title.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        rent,
        bedrooms,
        bathrooms,
        imageUrls,
      },
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const result = validateAndBuildPayload();

    if (result.error) {
      setError(result.error);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(result.value);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {error && (
        <p
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      <div>
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="title"
        >
          Property title
        </label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="description"
        >
          Description
        </label>
        <textarea
          className="mt-1 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="address"
          >
            Address
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="city"
          >
            City
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="rent"
          >
            Monthly rent
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            id="rent"
            name="rent"
            type="number"
            min="1"
            step="0.01"
            value={formData.rent}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="bedrooms"
          >
            Bedrooms
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            id="bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            step="1"
            value={formData.bedrooms}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="bathrooms"
          >
            Bathrooms
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            id="bathrooms"
            name="bathrooms"
            type="number"
            min="1"
            step="1"
            value={formData.bathrooms}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div>
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="imageUrls"
        >
          Image URLs
        </label>
        <textarea
          className="mt-1 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          id="imageUrls"
          name="imageUrls"
          value={formData.imageUrls}
          onChange={handleChange}
          placeholder="One https:// image URL per line"
        />
        <p className="mt-1 text-xs text-slate-500">
          Optional. Add up to 10 image URLs, one per line.
        </p>
      </div>
      <button
        className="rounded-md bg-blue-800 px-4 py-2 font-medium text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-400"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default PropertyForm;
