
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import API_BASE_URL from "../api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState(
    () => localStorage.getItem("rememberedIdentifier") || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    location.state?.notice || ""
  );
  const [showForgotHelp, setShowForgotHelp] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: identifier.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = data.detail;
        const message =
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((item) => item.msg).join(", ")
              : data.message || "Unable to sign in. Check your credentials.";

        throw new Error(message);
      }

      // Respect the Remember me choice for this browser session.
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(data));

      if (data.access_token) {
        storage.setItem("access_token", data.access_token);
      }

      if (rememberMe) {
        localStorage.setItem(
          "rememberedIdentifier",
          identifier.trim()
        );
      } else {
        localStorage.removeItem("rememberedIdentifier");
      }

      navigate("/gadgets");
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the server. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-frame">
        <section className="auth-story">
          <div className="auth-story-top">
            <div className="auth-brand-mark">T</div>
            <span className="auth-brand-name">TechCompare</span>
          </div>

          <div className="auth-story-content">
            <span className="auth-kicker">
              <Sparkles size={15} />
              SMART TECH DISCOVERY
            </span>

            <h1>
              Make better
              <br />
              tech decisions.
            </h1>

            <p>
              Compare products, discover better-fit gadgets,
              and understand why each recommendation matches
              your needs.
            </p>

            <div className="auth-benefits">
              <div>
                <CheckCircle2 size={18} />
                <span>Smart product comparisons</span>
              </div>
              <div>
                <CheckCircle2 size={18} />
                <span>Personalized recommendations</span>
              </div>
              <div>
                <CheckCircle2 size={18} />
                <span>Transparent score breakdown</span>
              </div>
            </div>
          </div>

          <div className="auth-story-bottom">
            <ShieldCheck size={17} />
            <span>Better decisions start with better information.</span>
          </div>

          <div className="auth-orbit auth-orbit-one" />
          <div className="auth-orbit auth-orbit-two" />
        </section>

        <section className="auth-form-panel">
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark">T</span>
            <span className="auth-brand-name">TechCompare</span>
          </div>

          <div className="auth-form-heading">
            <span className="auth-overline">WELCOME BACK</span>
            <h2>Sign in to continue.</h2>
            <p>
              Access your comparisons, recommendations, and account.
            </p>
          </div>

          {notice && (
            <div className="auth-message auth-message-success" role="status">
              <CheckCircle2 size={18} />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div className="auth-message auth-message-error" role="alert">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-identifier">
                Email address or username
              </label>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" size={18} />
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) =>
                    setIdentifier(event.target.value)
                  }
                  placeholder="Enter your email or username"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <LockKeyhole className="auth-input-icon" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <div className="auth-form-options">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="auth-text-button"
                onClick={() =>
                  setShowForgotHelp((previous) => !previous)
                }
              >
                Forgot password?
              </button>
            </div>

            {showForgotHelp && (
              <div className="auth-inline-help" role="status">
                <strong>Password recovery</strong>
                <p>
                  Password reset is not connected to the backend yet.
                  No reset email has been sent. A reset API and email
                  delivery service must be configured to enable it.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?
            <Link to="/register">
              Create an account <ArrowRight size={16} />
            </Link>
          </div>

          <div className="auth-security-note">
            <ShieldCheck size={17} />
            <span>
              Your sign-in is processed through the TechCompare
              authentication system.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;