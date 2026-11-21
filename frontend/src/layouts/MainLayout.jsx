import { Link, Outlet, useNavigate } from "react-router-dom";
import { getDashboardPath, useAuth } from "../context/AuthContext";

function MainLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link className="text-xl font-bold text-blue-800" to="/">
            GharSaathi
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                className="text-sm font-medium text-slate-700 hover:text-blue-800"
                to={getDashboardPath(user.role)}
              >
                Dashboard
              </Link>
              <Link
                className="text-sm font-medium text-slate-700 hover:text-blue-800"
                to="/properties"
              >
                Browse properties
              </Link>
              {user.role === "LANDLORD" && (
                <Link
                  className="text-sm font-medium text-slate-700 hover:text-blue-800"
                  to="/landlord/properties/new"
                >
                  Add property
                </Link>
              )}
              {user.role === "LANDLORD" && (
                <Link
                  className="text-sm font-medium text-slate-700 hover:text-blue-800"
                  to="/landlord/applications"
                >
                  Applications
                </Link>
              )}
              {user.role === "TENANT" && (
                <Link
                  className="text-sm font-medium text-slate-700 hover:text-blue-800"
                  to="/applications"
                >
                  My applications
                </Link>
              )}
              <Link
                className="text-sm font-medium text-slate-700 hover:text-blue-800"
                to="/leases"
              >
                My leases
              </Link>
              <Link
                className="text-sm font-medium text-slate-700 hover:text-blue-800"
                to="/payments"
              >
                My payments
              </Link>
              <Link
                className="text-sm font-medium text-slate-700 hover:text-blue-800"
                to="/maintenance"
              >
                Maintenance
              </Link>
              <button
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          ) : (
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link
                className="text-slate-700 hover:text-blue-800"
                to="/properties"
              >
                Browse properties
              </Link>
              <Link className="text-slate-700 hover:text-blue-800" to="/login">
                Log in
              </Link>
              <Link
                className="rounded-md bg-blue-800 px-3 py-1.5 text-white hover:bg-blue-900"
                to="/register"
              >
                Create account
              </Link>
            </nav>
          )}
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
