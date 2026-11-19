import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getDashboardPath, useAuth } from "../context/AuthContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(error) {
  return (
    error.response?.data?.error?.message ||
    "Unable to log in. Please try again."
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
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

    if (!emailPattern.test(formData.email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      const requestedPath = location.state?.from?.pathname;
      const destination = requestedPath || getDashboardPath(user.role);
      navigate(destination, {
        replace: true,
        state: { message: "Welcome back. You are now logged in." },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-md px-6 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Log in to GharSaathi
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your rental home in one place.
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
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            className="w-full rounded-md bg-blue-800 px-4 py-2 font-medium text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to GharSaathi?{" "}
          <Link
            className="font-medium text-blue-800 hover:underline"
            to="/register"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
