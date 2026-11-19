import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardPath, useAuth } from "../context/AuthContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(error) {
  return (
    error.response?.data?.error?.message ||
    "Unable to create your account. Please try again."
  );
}

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "TENANT",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (formData.name.trim().length < 2) {
      setError("Full name must contain at least 2 characters.");
      return;
    }

    if (!emailPattern.test(formData.email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      navigate(getDashboardPath(user.role), {
        replace: true,
        state: { message: "Your account has been created successfully." },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg px-6 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose the account type that fits your role.
        </p>

        {error && (
          <p
            className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">
              I am a
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {["TENANT", "LANDLORD"].map((role) => (
                <label
                  className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium ${
                    formData.role === role
                      ? "border-blue-700 bg-blue-50 text-blue-800"
                      : "border-slate-300 text-slate-700"
                  }`}
                  key={role}
                >
                  <input
                    className="sr-only"
                    name="role"
                    type="radio"
                    value={role}
                    checked={formData.role === role}
                    onChange={handleChange}
                  />
                  {role === "TENANT" ? "Tenant" : "Landlord"}
                </label>
              ))}
            </div>
          </fieldset>
          <button
            className="w-full rounded-md bg-blue-800 px-4 py-2 font-medium text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-medium text-blue-800 hover:underline"
            to="/login"
          >
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;
