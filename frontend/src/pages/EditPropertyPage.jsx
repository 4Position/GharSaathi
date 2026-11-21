import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PropertyForm from "../components/PropertyForm";
import { getProperty, updateProperty } from "../services/property.service";

function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperty() {
      try {
        const { property: result } = await getProperty(id);
        setProperty(result);
      } catch (requestError) {
        setError(
          requestError.response?.data?.error?.message ||
            "Unable to load this property.",
        );
      }
    }

    loadProperty();
  }, [id]);

  async function handleUpdate(data) {
    await updateProperty(id, data);
    navigate("/landlord/dashboard", {
      replace: true,
      state: { message: "Property updated successfully." },
    });
  }

  if (error)
    return (
      <p
        className="mx-auto mt-8 max-w-3xl rounded-md bg-red-50 px-6 py-4 text-red-700"
        role="alert"
      >
        {error}
      </p>
    );
  if (!property)
    return (
      <p className="mx-auto max-w-3xl px-6 py-12 text-slate-600">
        Loading property...
      </p>
    );

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
        Landlord tools
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Edit property</h1>
      <div className="mt-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <PropertyForm
          initialProperty={property}
          onSubmit={handleUpdate}
          submitLabel="Save changes"
        />
      </div>
    </section>
  );
}

export default EditPropertyPage;
