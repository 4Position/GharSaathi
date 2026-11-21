import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-700">
        Rental property management
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Welcome to GharSaathi
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
        A simple place for landlords and tenants to manage rental homes.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:border-slate-400"
          to="/properties"
        >
          Browse properties
        </Link>
        <Link
          className="rounded-md bg-blue-800 px-4 py-2 font-medium text-white hover:bg-blue-900"
          to="/register"
        >
          Create an account
        </Link>
        <Link
          className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:border-slate-400"
          to="/login"
        >
          Log in
        </Link>
      </div>
    </section>
  );
}

export default HomePage;
