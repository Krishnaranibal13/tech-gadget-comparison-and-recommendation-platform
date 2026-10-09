
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  GitCompare,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import API_BASE_URL from "../api";
import getGadgetImage from "../utils/gadgetImage";

const SCORE_FIELDS = [
  {
    key: "camera_score",
    label: "Camera",
    description: "Photo and image quality",
  },
  {
    key: "battery_score",
    label: "Battery",
    description: "Battery and efficiency",
  },
  {
    key: "performance_score",
    label: "Performance",
    description: "Speed and capability",
  },
  {
    key: "durability_score",
    label: "Durability",
    description: "Build and durability score",
  },
  {
    key: "value_score",
    label: "Value for money",
    description: "Value relative to price",
  },
];

function formatPrice(price) {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return "Price unavailable";
  }

  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function getScore(gadget, key) {
  const value = Number(gadget?.[key]);

  return Number.isFinite(value) && gadget?.[key] !== null &&
    gadget?.[key] !== undefined
    ? value
    : null;
}

function getOverallScore(gadget) {
  const values = SCORE_FIELDS
    .map((field) => getScore(gadget, field.key))
    .filter((value) => value !== null);

  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ProductImage({ gadget }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [gadget?.id]);

  if (!gadget) return null;

  return (
    <div className="tc-compare-product-visual">
      <img
        src={
          imageFailed
            ? "/images/tech-products.jpg"
            : getGadgetImage(gadget)
        }
        alt={gadget.name}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}

function ScoreMeter({ value, winner }) {
  if (value === null) {
    return (
      <div className="tc-score-unavailable">
        Not available
      </div>
    );
  }

  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div className="tc-compare-score-meter">
      <div className="tc-compare-score-track">
        <span
          className={winner ? "is-winner" : ""}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <strong className={winner ? "tc-score-winner" : ""}>
        {Number.isInteger(value) ? value : value.toFixed(1)}
      </strong>
    </div>
  );
}

function ProductSelector({
  label,
  gadgets,
  selectedId,
  onChange,
  excludedId,
}) {
  return (
    <label className="tc-compare-selector">
      <span>{label}</span>

      <div className="tc-compare-selector-control">
        <Search size={17} />

        <select
          value={selectedId}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
        >
          {gadgets.map((gadget) => (
            <option
              key={gadget.id}
              value={String(gadget.id)}
              disabled={String(gadget.id) === String(excludedId)}
            >
              {gadget.name} — {gadget.brand} ({formatPrice(gadget.price)})
            </option>
          ))}
        </select>

        <ChevronDown size={16} className="tc-compare-select-chevron" />
      </div>
    </label>
  );
}

function Compare() {
  const [searchParams] = useSearchParams();

  const [gadgets, setGadgets] = useState([]);
  const [firstId, setFirstId] = useState("");
  const [secondId, setSecondId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGadgets() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/gadgets/`);

        if (!response.ok) {
          throw new Error(
            `Unable to load the product catalog (${response.status}).`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The catalog response is not in the expected format.");
        }

        if (cancelled) return;

        setGadgets(data);

        if (data.length < 2) {
          setError(
            "Add at least two gadgets to the catalog to compare products."
          );
          return;
        }

        const requestedFirst = searchParams.get("first");
        const requestedSecond =
          searchParams.get("second") ||
          searchParams.get("second_id");

        const firstProduct = data.find(
          (item) => String(item.id) === String(requestedFirst)
        );

        const secondProduct = data.find(
          (item) =>
            String(item.id) === String(requestedSecond) &&
            String(item.id) !== String(firstProduct?.id)
        );

        const initialFirst = firstProduct || data[0];

        const initialSecond =
          secondProduct ||
          data.find(
            (item) =>
              String(item.id) !== String(initialFirst.id) &&
              item.category === initialFirst.category
          ) ||
          data.find(
            (item) => String(item.id) !== String(initialFirst.id)
          );

        setFirstId(String(initialFirst.id));
        setSecondId(String(initialSecond.id));
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Could not connect to the catalog. Check your backend."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGadgets();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const firstProduct = useMemo(
    () => gadgets.find((item) => String(item.id) === String(firstId)),
    [gadgets, firstId]
  );

  const secondProduct = useMemo(
    () => gadgets.find((item) => String(item.id) === String(secondId)),
    [gadgets, secondId]
  );

  const firstOverall = getOverallScore(firstProduct);
  const secondOverall = getOverallScore(secondProduct);

  const winner = useMemo(() => {
    if (firstOverall === null || secondOverall === null) {
      return null;
    }

    if (firstOverall > secondOverall) return "first";
    if (secondOverall > firstOverall) return "second";

    return "tie";
  }, [firstOverall, secondOverall]);

  const firstWins = useMemo(() => {
    if (!firstProduct || !secondProduct) return 0;

    return SCORE_FIELDS.filter((field) => {
      const left = getScore(firstProduct, field.key);
      const right = getScore(secondProduct, field.key);

      return left !== null && right !== null && left > right;
    }).length;
  }, [firstProduct, secondProduct]);

  const secondWins = useMemo(() => {
    if (!firstProduct || !secondProduct) return 0;

    return SCORE_FIELDS.filter((field) => {
      const left = getScore(firstProduct, field.key);
      const right = getScore(secondProduct, field.key);

      return left !== null && right !== null && right > left;
    }).length;
  }, [firstProduct, secondProduct]);

  function changeFirst(nextId) {
    setFirstId(nextId);

    if (nextId === secondId) {
      const replacement = gadgets.find(
        (item) => String(item.id) !== nextId
      );

      if (replacement) {
        setSecondId(String(replacement.id));
      }
    }
  }

  function changeSecond(nextId) {
    setSecondId(nextId);

    if (nextId === firstId) {
      const replacement = gadgets.find(
        (item) => String(item.id) !== nextId
      );

      if (replacement) {
        setFirstId(String(replacement.id));
      }
    }
  }

  function swapProducts() {
    setFirstId(secondId);
    setSecondId(firstId);
  }

  function resetComparison() {
    if (gadgets.length < 2) return;

    setFirstId(String(gadgets[0].id));

    const alternative =
      gadgets.find(
        (item) =>
          String(item.id) !== String(gadgets[0].id) &&
          item.category === gadgets[0].category
      ) ||
      gadgets.find((item) => String(item.id) !== String(gadgets[0].id));

    if (alternative) {
      setSecondId(String(alternative.id));
    }
  }

  if (loading) {
    return (
      <div className="tc-compare-page">
        <div className="tc-compare-status">
          <div className="tc-compare-status-icon">
            <GitCompare size={25} />
          </div>
          <h2>Preparing your comparison</h2>
          <p>Loading products and their available scores...</p>
        </div>
      </div>
    );
  }

  if (error || !firstProduct || !secondProduct) {
    return (
      <div className="tc-compare-page">
        <div className="tc-compare-status">
          <div className="tc-compare-status-icon">
            <GitCompare size={25} />
          </div>
          <h2>Comparison unavailable</h2>
          <p>{error || "Select two products to begin comparing."}</p>
          <Link to="/gadgets" className="tc-compare-button tc-compare-button-primary">
            Explore gadgets <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tc-compare-page">
      <section className="tc-compare-hero">
        <div className="tc-compare-hero-copy">
          <span className="tc-compare-eyebrow">
            <Sparkles size={15} />
            SMART PRODUCT COMPARISON
          </span>

          <h1>
            Two products.
            <br />
            <span>One informed choice.</span>
          </h1>

          <p>
            Compare the features, prices, ratings and project-defined
            scores of two gadgets in one clear view.
          </p>

          <div className="tc-compare-hero-points">
            <span>
              <CheckCircle2 size={15} /> Side-by-side scores
            </span>
            <span>
              <CheckCircle2 size={15} /> Clear differences
            </span>
            <span>
              <CheckCircle2 size={15} /> Budget-aware choices
            </span>
          </div>
        </div>

        <div className="tc-compare-hero-mark">
          <div className="tc-compare-hero-ring tc-compare-hero-ring-one" />
          <div className="tc-compare-hero-ring tc-compare-hero-ring-two" />

          <div className="tc-compare-hero-icon">
            <GitCompare size={39} strokeWidth={1.5} />
          </div>

          <span className="tc-compare-orbit-dot tc-compare-orbit-dot-one" />
          <span className="tc-compare-orbit-dot tc-compare-orbit-dot-two" />
        </div>
      </section>

      <section className="tc-compare-workspace">
        <div className="tc-compare-section-heading">
          <div>
            <span className="tc-compare-section-eyebrow">YOUR SHORTLIST</span>
            <h2>Choose your contenders.</h2>
            <p>Select two products from the catalog to compare them.</p>
          </div>

          <button
            type="button"
            className="tc-compare-reset"
            onClick={resetComparison}
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        <div className="tc-compare-selectors">
          <ProductSelector
            label="Product A"
            gadgets={gadgets}
            selectedId={firstId}
            onChange={changeFirst}
            excludedId={secondId}
          />

          <button
            type="button"
            className="tc-compare-swap"
            onClick={swapProducts}
            aria-label="Swap compared products"
            title="Swap products"
          >
            <ArrowLeftRight size={19} />
          </button>

          <ProductSelector
            label="Product B"
            gadgets={gadgets}
            selectedId={secondId}
            onChange={changeSecond}
            excludedId={firstId}
          />
        </div>

        <div className="tc-compare-products">
          {[firstProduct, secondProduct].map((gadget, index) => {
            const side = index === 0 ? "first" : "second";
            const overall = index === 0 ? firstOverall : secondOverall;
            const won = index === 0 ? firstWins : secondWins;
            const isWinner =
              winner === side ||
              (winner === "tie" && overall !== null);

            return (
              <article
                key={gadget.id}
                className={`tc-compare-product-card ${
                  isWinner ? "is-leading" : ""
                }`}
              >
                <div className="tc-compare-product-card-top">
                  <span className="tc-compare-side-label">
                    PRODUCT {index === 0 ? "A" : "B"}
                  </span>

                  {winner === side && (
                    <span className="tc-compare-winner-chip">
                      <Trophy size={13} />
                      Higher overall score
                    </span>
                  )}

                  {winner === "tie" && (
                    <span className="tc-compare-winner-chip">
                      <BadgeCheck size={13} />
                      Equal score
                    </span>
                  )}
                </div>

                <ProductImage gadget={gadget} />

                <div className="tc-compare-product-info">
                  <span className="tc-compare-category">
                    {gadget.category}
                  </span>

                  <h3>{gadget.name}</h3>
                  <p className="tc-compare-brand">{gadget.brand}</p>

                  <div className="tc-compare-price-rating">
                    <strong>{formatPrice(gadget.price)}</strong>

                    <span>
                      <Star size={14} fill="currentColor" />
                      {Number(gadget.rating || 0).toFixed(1)}
                    </span>
                  </div>

                  <div className="tc-compare-overall">
                    <div>
                      <span>Overall score</span>
                      <p>
                        {overall === null
                          ? "Score unavailable"
                          : "Average of available category scores"}
                      </p>
                    </div>

                    <div className="tc-compare-overall-number">
                      {overall === null ? (
                        <span>—</span>
                      ) : (
                        <>
                          <strong>{overall.toFixed(1)}</strong>
                          <small>/100</small>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="tc-compare-card-footer">
                    <span>
                      <CheckCircle2 size={14} />
                      {won} of {SCORE_FIELDS.length} score categories lead
                    </span>
                  </div>

                  <Link
                    to={`/gadgets/${gadget.id}`}
                    className="tc-compare-view-link"
                  >
                    View product details <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="tc-score-comparison">
        <div className="tc-compare-section-heading">
          <div>
            <span className="tc-compare-section-eyebrow">THE DETAILS</span>
            <h2>Compare every score.</h2>
            <p>
              Higher stored scores are highlighted for each category.
            </p>
          </div>

          <span className="tc-compare-data-badge">
            <ShieldCheck size={15} />
            Catalog data
          </span>
        </div>

        <div className="tc-score-table">
          <div className="tc-score-table-header">
            <div className="tc-score-label-header">Score category</div>
            <div className="tc-score-product-header">
              <span>{firstProduct.name}</span>
              <small>Product A</small>
            </div>
            <div className="tc-score-product-header">
              <span>{secondProduct.name}</span>
              <small>Product B</small>
            </div>
          </div>

          {SCORE_FIELDS.map((field) => {
            const left = getScore(firstProduct, field.key);
            const right = getScore(secondProduct, field.key);

            const leftWins =
              left !== null && right !== null && left > right;
            const rightWins =
              left !== null && right !== null && right > left;

            return (
              <div className="tc-score-row" key={field.key}>
                <div className="tc-score-label">
                  <strong>{field.label}</strong>
                  <small>{field.description}</small>
                </div>

                <div className="tc-score-value tc-score-value-a">
                  <ScoreMeter value={left} winner={leftWins} />
                  {leftWins && (
                    <span className="tc-score-win-label">
                      <Award size={13} /> Higher
                    </span>
                  )}
                </div>

                <div className="tc-score-value tc-score-value-b">
                  <ScoreMeter value={right} winner={rightWins} />
                  {rightWins && (
                    <span className="tc-score-win-label">
                      <Award size={13} /> Higher
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="tc-score-row tc-score-rating-row">
            <div className="tc-score-label">
              <strong>Customer rating</strong>
              <small>Catalog rating out of 5</small>
            </div>

            <div className="tc-score-rating-cell">
              <Star size={15} fill="currentColor" />
              {Number(firstProduct.rating || 0).toFixed(1)} / 5
            </div>

            <div className="tc-score-rating-cell">
              <Star size={15} fill="currentColor" />
              {Number(secondProduct.rating || 0).toFixed(1)} / 5
            </div>
          </div>

          <div className="tc-score-row tc-score-price-row">
            <div className="tc-score-label">
              <strong>Price</strong>
              <small>Listed catalog price</small>
            </div>

            <strong className="tc-score-price">
              {formatPrice(firstProduct.price)}
            </strong>

            <strong className="tc-score-price">
              {formatPrice(secondProduct.price)}
            </strong>
          </div>
        </div>
      </section>

      <section className="tc-compare-verdict">
        <div className="tc-compare-verdict-icon">
          {winner === "tie" ? (
            <BadgeCheck size={27} />
          ) : (
            <Trophy size={27} />
          )}
        </div>

        <div className="tc-compare-verdict-copy">
          <span className="tc-compare-section-eyebrow">
            SCORE-BASED VERDICT
          </span>

          <h2>
            {winner === null
              ? "Not enough score data to determine a leader."
              : winner === "tie"
                ? "Both products have the same overall score."
                : `${winner === "first" ? firstProduct.name : secondProduct.name} leads on overall score.`}
          </h2>

          <p>
            {winner === null
              ? "Compare the available individual scores and product prices below."
              : winner === "tie"
                ? "Use the individual category scores, listed price, and rating to decide which one better fits your requirements."
                : `This product has the higher average across the available camera, battery, performance, durability, and value scores. Consider price and your personal priorities before deciding.`}
          </p>

          {winner !== null && winner !== "tie" && (
            <div className="tc-compare-verdict-chips">
              <span>
                {firstWins > secondWins
                  ? `${firstProduct.name} leads in ${firstWins} categories`
                  : secondWins > firstWins
                    ? `${secondProduct.name} leads in ${secondWins} categories`
                    : "Category scores are mixed"}
              </span>
              <span>
                Difference:{" "}
                {Math.abs(firstOverall - secondOverall).toFixed(1)} points
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="tc-compare-bottom-actions">
        <Link to="/gadgets" className="tc-compare-button tc-compare-button-outline">
          <Search size={16} />
          Browse more gadgets
        </Link>

        <Link to="/recommend" className="tc-compare-button tc-compare-button-primary">
          <Sparkles size={16} />
          Get a personalized recommendation
          <ArrowRight size={16} />
        </Link>
      </div>

      <p className="tc-compare-disclaimer">
        Overall scores are calculated here as the average of available
        project-defined score fields. They are not independent laboratory
        benchmark results or verified customer-review aggregates.
      </p>
    </div>
  );
}

export default Compare;