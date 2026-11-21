import { useNavigate } from "react-router-dom";
import PropertyForm from "../components/PropertyForm";
import { createProperty } from "../services/property.service";

function AddPropertyPage() {
  const navigate = useNavigate();

  async function handleCreate(data) {
    await createProperty(data);
    navigate("/landlord/dashboard", {
      replace: true,
      state: { message: "Property created successfully." },
    });
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
        Landlord tools
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Add property</h1>
      <div className="mt-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <PropertyForm onSubmit={handleCreate} submitLabel="Create property" />
      </div>
    </section>
  );
}

export default AddPropertyPage;
