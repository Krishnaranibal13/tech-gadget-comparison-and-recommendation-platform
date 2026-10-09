
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BatteryCharging,
  CheckCircle2,
  ChevronRight,
  Cpu,
  GitCompare,
  Headphones,
  Laptop,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Watch,
  Wallet,
} from "lucide-react";

import API_BASE_URL from "../api";
import getGadgetImage from "../utils/gadgetImage";

const categories = [
  {
    name: "Smartphones",
    category: "Smartphone",
    description: "Cameras, performance and everyday power.",
    icon: Smartphone,
    number: "01",
  },
  {
    name: "Laptops",
    category: "Laptop",
    description: "Find the right machine for work and study.",
    icon: Laptop,
    number: "02",
  },
  {
    name: "Earphones",
    category: "Earphone",
    description: "Sound, comfort and battery life.",
    icon: Headphones,
    number: "03",
  },
  {
    name: "Smartwatches",
    category: "Smartwatch",
    description: "Useful features for life on the move.",
    icon: Watch,
    number: "04",
  },
];

const benefits = [
  {
    icon: GitCompare,
    title: "Compare with clarity",
    description:
      "See products side by side and make sense of the information that matters.",
  },
  {
    icon: Sparkles,
    title: "Recommendations for you",
    description:
      "Use your budget and priorities to discover suitable products.",
  },
  {
    icon: ShieldCheck,
    title: "Decide with confidence",
    description:
      "Review product scores and understand the reasons behind a match.",
  },
];

function formatPrice(price) {
  const value = Number(price);

  if (!Number.isFinite(value)) return "Price unavailable";

  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function averageProductScore(gadget) {
  const fields = [
    "performance_score",
    "battery_score",
    "camera_score",
    "durability_score",
    "value_score",
  ];

  const values = fields
    .map((field) => Number(gadget?.[field]))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!values.length) return null;

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );
}

function HomeProductCard({ gadget }) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageSrc = getGadgetImage(gadget);

  return (
    <article className="tch-product-card">
      <Link
        to={`/gadgets/${gadget.id}`}
        className="tch-product-image-link"
        aria-label={`View ${gadget.name}`}
      >
        <div className="tch-product-image">
          <img
            src={imageFailed ? "/images/tech-products.jpg" : imageSrc}
            alt={gadget.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        </div>
      </Link>

      <div className="tch-product-content">
        <div className="tch-product-meta">
          <span className="tch-category-label">{gadget.category}</span>
          <span className="tch-product-rating">
            <Star size={13} fill="currentColor" />
            {Number(gadget.rating || 0).toFixed(1)}
          </span>
        </div>

        <h3>
          <Link to={`/gadgets/${gadget.id}`}>{gadget.name}</Link>
        </h3>

        <p className="tch-product-brand">{gadget.brand}</p>

        <div className="tch-product-bottom">
          <strong>{formatPrice(gadget.price)}</strong>
          <Link
            to={`/gadgets/${gadget.id}`}
            className="tch-product-open"
            aria-label={`Explore ${gadget.name}`}
          >
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <Link
          to={`/compare?first=${gadget.id}`}
          className="tch-product-compare"
        >
          <GitCompare size={14} />
          Compare product
        </Link>
      </div>
    </article>
  );
}

function Home() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [gadgets, setGadgets] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [catalogMessage, setCatalogMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGadgets() {
      try {
        const response = await fetch(`${API_BASE_URL}/gadgets/`);

        if (!response.ok) {
          throw new Error("The gadget catalog is temporarily unavailable.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The catalog response was not in the expected format.");
        }

        if (!cancelled) {
          setGadgets(data);
          setCatalogMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setCatalogMessage(
            error.message ||
              "Start the backend to load products from your catalog."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    }

    loadGadgets();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredProducts = useMemo(() => {
    return [...gadgets]
      .sort((a, b) => {
        const ratingDifference =
          Number(b.rating || 0) - Number(a.rating || 0);

        if (ratingDifference !== 0) return ratingDifference;

        return Number(a.price || 0) - Number(b.price || 0);
      })
      .slice(0, 4);
  }, [gadgets]);

  const previewProduct = featuredProducts[0] || null;
  const previewScore = averageProductScore(previewProduct);

  function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();

    navigate(
      query
        ? `/gadgets?search=${encodeURIComponent(query)}`
        : "/gadgets"
    );
  }

  function handleCategoryClick(category) {
    // Open the catalog with a category hint in the URL.
    navigate(`/gadgets?category=${encodeURIComponent(category)}`);
  }

  return (
    <div className="tch-home">
      <section className="tch-hero">
        <div className="tch-hero-copy">
          <div className="tch-eyebrow">
            <span className="tch-eyebrow-dot" />
            YOUR SMARTER TECH MARKETPLACE
          </div>

          <h1>
            The right tech.
            <br />
            <span>The right reasons.</span>
          </h1>

          <p className="tch-hero-description">
            Explore gadgets, compare the details that matter, and
            discover products that fit your budget and everyday needs.
          </p>

          <form
            className="tch-search"
            role="search"
            onSubmit={handleSearch}
          >
            <Search size={20} className="tch-search-icon" />

            <input
              type="search"
              aria-label="Search products and brands"
              placeholder="Search phones, laptops, brands..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <button type="submit">
              Search <ArrowRight size={17} />
            </button>
          </form>

          <div className="tch-hero-actions">
            <Link to="/gadgets" className="tch-primary-button">
              Explore the catalog
              <ArrowRight size={17} />
            </Link>

            <Link to="/recommend" className="tch-secondary-button">
              <Sparkles size={17} />
              Find my best match
            </Link>
          </div>

          <div className="tch-trust-note">
            <ShieldCheck size={16} />
            <span>Clear comparisons. More informed choices.</span>
          </div>
        </div>

        <div className="tch-hero-visual">
          <div className="tch-hero-glow" />
          <div className="tch-hero-ring tch-hero-ring-one" />
          <div className="tch-hero-ring tch-hero-ring-two" />

          <div className="tch-float-label tch-float-label-top">
            <span className="tch-float-icon">
              <GitCompare size={18} />
            </span>
            <span>
              <strong>Compare smarter</strong>
              <small>Product details, together</small>
            </span>
          </div>

          <div className="tch-showcase">
            <div className="tch-showcase-header">
              <span className="tch-showcase-brand">
                <span className="tch-showcase-logo">T</span>
                TechCompare
              </span>
              <span className="tch-showcase-status">
                <span />
                LIVE CATALOG
              </span>
            </div>

            <div className="tch-showcase-image">
              <img
                src={
                  previewProduct
                    ? getGadgetImage(previewProduct)
                    : "/images/tech-products.jpg"
                }
                alt={
                  previewProduct
                    ? previewProduct.name
                    : "A selection of technology products"
                }
              />
            </div>

            <div className="tch-showcase-product">
              <div>
                <span className="tch-showcase-overline">
                  {previewProduct
                    ? "FEATURED FROM YOUR CATALOG"
                    : "EXPLORE TECHNOLOGY"}
                </span>

                <h2>
                  {previewProduct
                    ? previewProduct.name
                    : "Discover your next device"}
                </h2>

                <p>
                  {previewProduct
                    ? `${previewProduct.brand} · ${previewProduct.category}`
                    : "Compare products and find your fit."}
                </p>
              </div>

              <div className="tch-showcase-score">
                <span>
                  {previewScore === null ? "—" : previewScore}
                </span>
                <small>{previewScore === null ? "SCORE" : "/100"}</small>
              </div>
            </div>

            <div className="tch-showcase-factors">
              <div>
                <Cpu size={16} />
                <span>Performance</span>
              </div>
              <div>
                <BatteryCharging size={16} />
                <span>Battery</span>
              </div>
              <div>
                <Wallet size={16} />
                <span>Value</span>
              </div>
            </div>

            <div className="tch-showcase-footer">
              <BadgeCheck size={16} />
              Scores reflect the data stored for the selected product.
            </div>
          </div>

          <div className="tch-float-label tch-float-label-bottom">
            <span className="tch-float-icon tch-float-icon-blue">
              <Sparkles size={18} />
            </span>
            <span>
              <strong>Recommendations</strong>
              <small>Built around your priorities</small>
            </span>
          </div>
        </div>
      </section>

      <section className="tch-categories">
        <div className="tch-section-heading">
          <div>
            <span className="tch-section-eyebrow">EXPLORE THE CATALOG</span>
            <h2>Find your category.</h2>
            <p>Start with the kind of device you are looking for.</p>
          </div>

          <Link to="/gadgets" className="tch-section-link">
            View all gadgets <ArrowRight size={16} />
          </Link>
        </div>

        <div className="tch-category-grid">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                key={category.category}
                type="button"
                className="tch-category-card"
                onClick={() => handleCategoryClick(category.category)}
              >
                <div className="tch-category-card-top">
                  <span className="tch-category-icon">
                    <Icon size={23} strokeWidth={1.7} />
                  </span>
                  <span className="tch-category-number">
                    {category.number}
                  </span>
                </div>

                <h3>{category.name}</h3>
                <p>{category.description}</p>

                <span className="tch-category-card-link">
                  Explore category <ChevronRight size={16} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="tch-featured">
        <div className="tch-section-heading">
          <div>
            <span className="tch-section-eyebrow">FROM YOUR DATABASE</span>
            <h2>Featured gadgets.</h2>
            <p>
              A selection from the products currently available in your catalog.
            </p>
          </div>

          <Link to="/gadgets" className="tch-section-link">
            Browse all <ArrowRight size={16} />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="tch-featured-grid">
            {[1, 2, 3, 4].map((item) => (
              <div className="tch-product-skeleton" key={item}>
                <div className="tch-skeleton-image" />
                <div className="tch-skeleton-line" />
                <div className="tch-skeleton-line short" />
                <div className="tch-skeleton-line price" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="tch-featured-grid">
            {featuredProducts.map((gadget) => (
              <HomeProductCard key={gadget.id} gadget={gadget} />
            ))}
          </div>
        ) : (
          <div className="tch-catalog-empty">
            <Search size={23} />
            <h3>Products will appear here.</h3>
            <p>
              {catalogMessage ||
                "Add products to the database to show them on the homepage."}
            </p>
            <Link to="/gadgets" className="tch-secondary-button">
              Open catalog <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      <section className="tch-benefits">
        <div className="tch-section-heading">
          <div>
            <span className="tch-section-eyebrow">A BETTER WAY TO DECIDE</span>
            <h2>Know more before you choose.</h2>
            <p>
              Tools that turn product information into a clearer decision.
            </p>
          </div>
        </div>

        <div className="tch-benefit-grid">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <article className="tch-benefit-card" key={benefit.title}>
                <span className="tch-benefit-number">
                  0{index + 1}
                </span>

                <span className="tch-benefit-icon">
                  <Icon size={22} />
                </span>

                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>

                <span className="tch-benefit-line" />
              </article>
            );
          })}
        </div>
      </section>

      <section className="tch-cta">
        <div className="tch-cta-mark">
          <Sparkles size={23} />
        </div>

        <div className="tch-cta-content">
          <span>YOUR NEXT TECH DECISION</span>
          <h2>Choose with more confidence.</h2>
          <p>
            Set your budget, tell us what matters, and explore your best
            available matches.
          </p>
        </div>

        <Link to="/recommend" className="tch-cta-button">
          Get recommendations <ArrowRight size={17} />
        </Link>
      </section>
    </div>
  );
}

export default Home;