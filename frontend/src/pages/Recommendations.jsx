
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BatteryCharging,
  Camera,
  CheckCircle2,
  Cpu,
  Gauge,
  IndianRupee,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

import API_BASE_URL from "../api";
import getGadgetImage from "../utils/gadgetImage";

const DEFAULT_CATEGORIES = [
  "Smartphone",
  "Laptop",
  "Earphone",
  "Smartwatch",
];

const USAGE_OPTIONS = [
  { value: "Gaming", label: "Gaming" },
  { value: "Coding", label: "Coding & development" },
  { value: "Study", label: "Study & productivity" },
  { value: "Photography", label: "Photography" },
  { value: "Everyday", label: "Everyday use" },
];

const PRIORITY_OPTIONS = [
  { value: "High", label: "High priority" },
  { value: "Medium", label: "Medium priority" },
  { value: "Low", label: "Low priority" },
];

function formatPrice(price) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function getErrorMessage(data, fallback) {
  const detail = data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(", ");
  }

  return data?.message || fallback;
}

function ProductImage({ gadget, className = "" }) {
  const [failed, setFailed] = useState(false);

  const imagePath = getGadgetImage(gadget);

  return (
    <div className={`recommendation-product-image ${className}`}>
      <img
        src={failed ? "/images/tech-products.jpg" : imagePath}
        alt={gadget?.name || "Recommended gadget"}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function ScoreBadge({ score }) {
  if (score === undefined || score === null) {
    return null;
  }

  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return null;
  }

  return (
    <div className="recommendation-score">
      <Trophy size={15} />
      <span>{numericScore.toFixed(2)} / 100</span>
    </div>
  );
}

function ReasonsList({ reasons }) {
  if (!Array.isArray(reasons) || reasons.length === 0) {
    return (
      <p className="recommendation-muted">
        This product matches your selected category and budget.
      </p>
    );
  }

  return (
    <ul className="recommendation-reasons">
      {reasons.map((reason, index) => (
        <li key={`${reason}-${index}`}>
          <CheckCircle2 size={15} />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );
}

function ResultProductCard({ gadget, rank }) {
  if (!gadget) return null;

  return (
    <article className="recommendation-product-card">
      <ProductImage gadget={gadget} />

      <div className="recommendation-product-content">
        <div className="recommendation-product-top">
          <span className="category-chip">
            {gadget.category}
          </span>

          {rank && (
            <span className="recommendation-rank">
              #{rank}
            </span>
          )}
        </div>

        <h3>{gadget.name}</h3>

        <p className="recommendation-brand">
          {gadget.brand}
        </p>

        <div className="recommendation-product-price">
          <IndianRupee size={19} />
          <span>
            {Number(gadget.price).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="recommendation-product-meta">
          <span>
            ★ {Number(gadget.rating || 0).toFixed(1)}
          </span>

          <ScoreBadge score={gadget.score} />
        </div>

        {gadget.description && (
          <p className="recommendation-description">
            {gadget.description}
          </p>
        )}

        <ReasonsList reasons={gadget.reasons} />

        <div className="recommendation-card-actions">
          <Link
            to={`/gadgets/${gadget.id}`}
            className="btn btn-primary"
          >
            View details <ArrowRight size={15} />
          </Link>

          <Link
            to={`/compare?first=${gadget.id}`}
            className="btn btn-outline"
          >
            Compare
          </Link>
        </div>
      </div>
    </article>
  );
}

function Recommendations() {
  const [categories, setCategories] = useState(
    DEFAULT_CATEGORIES
  );

  const [category, setCategory] = useState("Smartphone");
  const [budget, setBudget] = useState("80000");
  const [usage, setUsage] = useState("Gaming");

  const [performancePriority, setPerformancePriority] =
    useState("High");
  const [batteryPriority, setBatteryPriority] =
    useState("Medium");
  const [cameraPriority, setCameraPriority] =
    useState("Medium");

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] =
    useState(true);
  const [error, setError] = useState("");

  // Load the actual categories from the database-backed catalog.
  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/gadgets/`
        );

        if (!response.ok) {
          throw new Error("Could not load gadget categories.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected gadget catalog response.");
        }

        const databaseCategories = [
          ...new Set(
            data
              .map((gadget) => gadget.category)
              .filter(
                (value) =>
                  typeof value === "string" &&
                  value.trim().length > 0
              )
          ),
        ];

        if (!cancelled && databaseCategories.length > 0) {
          setCategories(databaseCategories);

          setCategory((current) =>
            databaseCategories.includes(current)
              ? current
              : databaseCategories[0]
          );
        }
      } catch (err) {
        // Keep the default categories available if this request fails.
        if (!cancelled) {
          console.warn(
            "Could not load categories from catalog:",
            err.message
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const recommendations = useMemo(() => {
    if (!results || !Array.isArray(results.recommendations)) {
      return [];
    }

    return results.recommendations;
  }, [results]);

  const topRecommendation = useMemo(() => {
    if (!results) return null;

    return (
      results.top_recommendation ||
      recommendations[0] ||
      null
    );
  }, [results, recommendations]);

  const alternativeRecommendation = useMemo(() => {
    if (!results) return null;

    return (
      results.alternative_recommendation ||
      results.alternative ||
      null
    );
  }, [results]);

  const otherRecommendations = useMemo(() => {
    if (!topRecommendation) {
      return recommendations;
    }

    return recommendations.filter(
      (gadget) => gadget.id !== topRecommendation.id
    );
  }, [recommendations, topRecommendation]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const numericBudget = Number(budget);

    if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
      setError("Enter a valid budget greater than zero.");
      return;
    }

    setLoading(true);
    setResults(null);

    const requestBody = {
      category,
      budget: numericBudget,
      usage,
      performance_priority: performancePriority,
      battery_priority: batteryPriority,
      camera_priority: cameraPriority,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/gadgets/personalized-recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Recommendation request failed (${response.status}).`
          )
        );
      }

      if (!Array.isArray(data.recommendations)) {
        throw new Error(
          "The API response is missing the recommendations list."
        );
      }

      setResults(data);

      if (data.recommendations.length === 0) {
        setError(
          "No gadgets match these preferences. Try increasing your budget."
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Could not calculate recommendations. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setCategory("Smartphone");
    setBudget("80000");
    setUsage("Gaming");
    setPerformancePriority("High");
    setBatteryPriority("Medium");
    setCameraPriority("Medium");
    setResults(null);
    setError("");
  }

  return (
    <div className="page recommendation-page">
      <section className="recommendation-hero">
        <span className="eyebrow">
          <Sparkles size={14} />
          PERSONALIZED DISCOVERY
        </span>

        <h1>
          Find the right tech
          <br />
          for your next move.
        </h1>

        <p>
          Tell us your budget, category, and priorities.
          TechCompare will score matching gadgets and explain
          why each product fits your needs.
        </p>

        <div className="recommendation-hero-points">
          <span>
            <ShieldCheck size={16} />
            Budget-aware results
          </span>
          <span>
            <Gauge size={16} />
            Weighted score
          </span>
          <span>
            <BadgeCheck size={16} />
            Explained matches
          </span>
        </div>
      </section>

      <div className="recommendation-layout">
        <section className="preference-panel">
          <div className="recommendation-panel-heading">
            <span className="recommendation-panel-icon">
              <Search size={19} />
            </span>

            <div>
              <h2>Your preferences</h2>
              <p>Adjust the inputs to calculate your matches.</p>
            </div>
          </div>

          <form
            className="recommendation-form"
            onSubmit={handleSubmit}
          >
            <label>
              Gadget category
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setResults(null);
                  setError("");
                }}
                disabled={loadingCategories}
                required
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Maximum budget (₹)
              <input
                type="number"
                min="1"
                step="1"
                value={budget}
                onChange={(event) => {
                  setBudget(event.target.value);
                  setResults(null);
                  setError("");
                }}
                placeholder="Enter your budget"
                required
              />

              {Number(budget) > 0 && (
                <span className="recommendation-field-hint">
                  Budget: {formatPrice(budget)}
                </span>
              )}
            </label>

            <label>
              Primary usage
              <select
                value={usage}
                onChange={(event) => {
                  setUsage(event.target.value);
                  setResults(null);
                  setError("");
                }}
                required
              >
                {USAGE_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="recommendation-form-divider" />

            <div className="recommendation-priority-heading">
              <h3>What matters most?</h3>
              <p>Choose how strongly each factor should influence your match.</p>
            </div>

            <label>
              <span className="recommendation-priority-label">
                <Cpu size={16} />
                Performance
              </span>

              <select
                value={performancePriority}
                onChange={(event) => {
                  setPerformancePriority(event.target.value);
                  setResults(null);
                }}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="recommendation-priority-label">
                <BatteryCharging size={16} />
                Battery life
              </span>

              <select
                value={batteryPriority}
                onChange={(event) => {
                  setBatteryPriority(event.target.value);
                  setResults(null);
                }}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="recommendation-priority-label">
                <Camera size={16} />
                Camera quality
              </span>

              <select
                value={cameraPriority}
                onChange={(event) => {
                  setCameraPriority(event.target.value);
                  setResults(null);
                }}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {error && (
              <div
                className="auth-message auth-message-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary recommendation-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={17}
                    className="recommendation-spinner"
                  />
                  Calculating matches...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Calculate recommendations
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <button
              type="button"
              className="recommendation-reset"
              onClick={resetForm}
              disabled={loading}
            >
              Reset preferences
            </button>
          </form>
        </section>

        <section className="recommendation-results">
          {!results && !loading && (
            <div className="recommendation-empty">
              <div className="recommendation-empty-icon">
                <Sparkles size={26} />
              </div>

              <span className="eyebrow">YOUR NEXT BEST MATCH</span>

              <h2>Recommendations start here.</h2>

              <p>
                Set your preferences and calculate your results.
                Your top match, score, reasons, and alternatives will
                appear in this space.
              </p>

              <div className="recommendation-empty-steps">
                <div>
                  <span>01</span>
                  <p>Choose a gadget category</p>
                </div>
                <div>
                  <span>02</span>
                  <p>Set budget and priorities</p>
                </div>
                <div>
                  <span>03</span>
                  <p>Compare your best matches</p>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="recommendation-loading" role="status">
              <div className="recommendation-loading-icon">
                <RefreshCw
                  size={25}
                  className="recommendation-spinner"
                />
              </div>

              <h2>Finding your best matches</h2>

              <p>
                Checking the catalog, budget, and preference scores...
              </p>
            </div>
          )}

          {results && !loading && (
            <>
              <div className="recommendation-results-heading">
                <div>
                  <span className="eyebrow">
                    YOUR RESULTS
                  </span>

                  <h2>Matches for you</h2>

                  <p>
                    {results.category || category} · Up to{" "}
                    {formatPrice(results.budget ?? budget)} · {usage}
                  </p>
                </div>

                <span className="recommendation-count">
                  {recommendations.length}{" "}
                  {recommendations.length === 1
                    ? "match"
                    : "matches"}
                </span>
              </div>

              {topRecommendation ? (
                <div className="recommendation-top-section">
                  <div className="recommendation-top-label">
                    <Trophy size={17} />
                    TOP RECOMMENDATION
                  </div>

                  <article className="recommendation-featured-card">
                    <ProductImage
                      gadget={topRecommendation}
                      className="recommendation-featured-image"
                    />

                    <div className="recommendation-featured-content">
                      <div className="recommendation-featured-meta">
                        <span className="category-chip">
                          {topRecommendation.category}
                        </span>

                        <ScoreBadge
                          score={topRecommendation.score}
                        />
                      </div>

                      <h3>{topRecommendation.name}</h3>

                      <p className="recommendation-brand">
                        {topRecommendation.brand}
                      </p>

                      <div className="recommendation-featured-price">
                        {formatPrice(topRecommendation.price)}
                      </div>

                      {topRecommendation.description && (
                        <p className="recommendation-description">
                          {topRecommendation.description}
                        </p>
                      )}

                      <h4 className="recommendation-why-title">
                        Why this matches your needs
                      </h4>

                      <ReasonsList
                        reasons={topRecommendation.reasons}
                      />

                      <div className="recommendation-card-actions">
                        <Link
                          to={`/gadgets/${topRecommendation.id}`}
                          className="btn btn-primary"
                        >
                          Explore gadget
                          <ArrowRight size={16} />
                        </Link>

                        <Link
                          to={`/compare?first=${topRecommendation.id}`}
                          className="btn btn-outline"
                        >
                          Compare
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              ) : (
                <div className="recommendation-no-match">
                  <h3>No products found for these preferences.</h3>
                  <p>
                    Try increasing your budget or selecting another category.
                  </p>
                </div>
              )}

              {alternativeRecommendation && (
                <section className="recommendation-alternative-section">
                  <div className="recommendation-subsection-heading">
                    <div>
                      <span className="eyebrow">
                        ANOTHER OPTION
                      </span>
                      <h3>Alternative pick</h3>
                    </div>
                  </div>

                  <ResultProductCard
                    gadget={alternativeRecommendation}
                  />
                </section>
              )}

              {otherRecommendations.length > 0 && (
                <section className="recommendation-other-section">
                  <div className="recommendation-subsection-heading">
                    <div>
                      <span className="eyebrow">
                        EXPLORE YOUR OPTIONS
                      </span>
                      <h3>Other matching gadgets</h3>
                    </div>
                  </div>

                  <div className="recommendation-list">
                    {otherRecommendations.map((gadget, index) => (
                      <ResultProductCard
                        key={gadget.id}
                        gadget={gadget}
                        rank={index + 2}
                      />
                    ))}
                  </div>
                </section>
              )}

              <p className="recommendation-disclaimer">
                Recommendation scores are calculated by this project's
                scoring model using the gadget data in its database.
                They are comparison aids, not independent laboratory
                benchmark results.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Recommendations;