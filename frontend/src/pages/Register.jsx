
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Sparkles,
} from "lucide-react";
import API_BASE_URL from "../api";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setError("Please confirm that you agree to the terms.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Email is used as the username for compatibility
          // with backends that authenticate by username.
          username: email.trim(),
          email: email.trim(),
          full_name: fullName.trim(),
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
              : data.message || "Unable to create your account.";

        throw new Error(message);
      }

      navigate("/login", {
        state: {
          notice: "Your account was created. Please sign in.",
        },
      });
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
      <div className="auth-frame auth-frame-register">
        <section className="auth-story">
          <div className="auth-story-top">
            <div className="auth-brand-mark">T</div>
            <span className="auth-brand-name">TechCompare</span>
          </div>

          <div className="auth-story-content">
            <span className="auth-kicker">
              <Sparkles size={15} />
              A SMARTER WAY TO CHOOSE
            </span>

            <h1>
              Your next
              <br />
              great choice
              <br />
              starts here.
            </h1>

            <p>
              Create your account to explore gadgets, compare
              features, and find recommendations tailored to you.
            </p>

            <div className="auth-benefits">
              <div>
                <CheckCircle2 size={18} />
                <span>Explore your tech options</span>
              </div>
              <div>
                <CheckCircle2 size={18} />
                <span>Compare important features</span>
              </div>
              <div>
                <CheckCircle2 size={18} />
                <span>Find gadgets for your needs</span>
              </div>
            </div>
          </div>

          <div className="auth-story-bottom">
            <ShieldCheck size={17} />
            <span>A simpler way to make informed tech decisions.</span>
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
            <span className="auth-overline">GET STARTED</span>
            <h2>Create your account.</h2>
            <p>
              Enter your details to join TechCompare.
            </p>
          </div>

          {error && (
            <div className="auth-message auth-message-error" role="alert">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="register-full-name">Full name</label>
              <div className="auth-input-wrap">
                <UserRound className="auth-input-icon" size={18} />
                <input
                  id="register-full-name"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">Email address</label>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" size={18} />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-password">Password</label>
              <div className="auth-input-wrap">
                <LockKeyhole className="auth-input-icon" size={18} />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
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
              <span className="auth-field-hint">
                Use at least 8 characters.
              </span>
            </div>

            <div className="auth-field">
              <label htmlFor="register-confirm-password">
                Confirm password
              </label>
              <div className="auth-input-wrap">
                <LockKeyhole className="auth-input-icon" size={18} />
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <label className="auth-checkbox auth-terms">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(event) =>
                  setAgreeToTerms(event.target.checked)
                }
              />
              <span>
                I agree to use TechCompare responsibly and accept
                the site's terms.
              </span>
            </label>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              <span>
                {loading ? "Creating account..." : "Create account"}
              </span>
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?
            <Link to="/login">
              Sign in <ArrowRight size={16} />
            </Link>
          </div>

          <div className="auth-security-note">
            <ShieldCheck size={17} />
            <span>
              Keep your account credentials private and secure.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;