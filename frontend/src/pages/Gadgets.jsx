
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  GitCompare,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";

import API_BASE_URL from "../api";
import getGadgetImage from "../utils/gadgetImage";

function formatPrice(price) {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return "Price unavailable";
  }

  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function ProductVisual({ gadget }) {
  const [imageFailed, setImageFailed] = useState(false);

  const imagePath = getGadgetImage(gadget);

  return (
    <div className="product-visual">
      <img
        src={
          imageFailed
            ? "/images/tech-products.jpg"
            : imagePath
        }
        alt={gadget.name}
        className="real-product-image"
        loading="lazy"
        onError={() => {
          setImageFailed(true);
        }}
      />
    </div>
  );
}

function Gadgets() {
  const [gadgets, setGadgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();

  // Read the search and category filters from the URL.
  const searchQueryParam = searchParams.get("search") || "";
  const categoryQueryParam = searchParams.get("category") || "All";

  const [search, setSearch] = useState(searchQueryParam);
  const [category, setCategory] = useState(categoryQueryParam);
  const [sortBy, setSortBy] = useState("rating");

  // Update the filters when navigation changes the URL.
  // This supports both homepage category cards and navbar searches.
  useEffect(() => {
    setSearch(searchQueryParam);
    setCategory(categoryQueryParam);
  }, [searchQueryParam, categoryQueryParam]);

  // Fetch products from the FastAPI backend.
  useEffect(() => {
    let cancelled = false;

    async function loadGadgets() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/gadgets/`);

        if (!response.ok) {
          throw new Error(
            `Failed to load products (${response.status}).`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The catalog returned an unexpected response.");
        }

        if (!cancelled) {
          setGadgets(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load products. Make sure the backend is running."
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
  }, []);

  // Build category options from the actual database products.
  const categories = useMemo(() => {
    const actualCategories = [
      ...new Set(
        gadgets
          .map((gadget) => gadget.category)
          .filter(
            (item) =>
              typeof item === "string" && item.trim().length > 0
          )
      ),
    ].sort((a, b) => a.localeCompare(b));

    return ["All", ...actualCategories];
  }, [gadgets]);

  // Filter products by name, brand and selected category.
  const filteredGadgets = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const filtered = gadgets.filter((gadget) => {
      const searchableText = [
        gadget.name || "",
        gadget.brand || "",
        gadget.category || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(searchText);

      const matchesCategory =
        category === "All" || gadget.category === category;

      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "price-low") {
        return Number(a.price) - Number(b.price);
      }

      if (sortBy === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      if (sortBy === "rating-low") {
        return Number(a.rating || 0) - Number(b.rating || 0);
      }

      return Number(b.rating || 0) - Number(a.rating || 0);
    });
  }, [gadgets, search, category, sortBy]);

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setSortBy("rating");
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-state">
          <div>
            <h2>Loading your catalog...</h2>
            <p>Fetching gadgets from TechCompare.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <section className="page-header">
          <div>
            <span className="eyebrow">PRODUCT CATALOG</span>
            <h1>Explore gadgets.</h1>
            <p>Browse and compare the available products.</p>
          </div>
        </section>

        <div className="error-box" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page tch-catalog-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">THE TECHCOMPARE CATALOG</span>
          <h1>Find your next gadget.</h1>
          <p>
            Explore smartphones, laptops, earphones and smartwatches.
            Compare products using the information available in the catalog.
          </p>
        </div>

        <div className="catalog-count">
          <strong>{filteredGadgets.length}</strong>
          <span>
            {filteredGadgets.length === 1 ? "product" : "products"}
          </span>
        </div>
      </section>

      <section className="catalog-toolbar">
        <label className="catalog-search">
          <Search size={18} aria-hidden="true" />

          <input
            type="search"
            aria-label="Search gadgets"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product, brand or category..."
          />
        </label>

        <label className="catalog-filter-label">
          <span className="catalog-filter-icon">
            <SlidersHorizontal size={15} />
          </span>

          <select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All categories" : item}
              </option>
            ))}
          </select>
        </label>

        <select
          aria-label="Sort products"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="rating">Highest rated</option>
          <option value="rating-low">Lowest rated</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </section>

      <div className="tch-catalog-summary">
        <span>
          Showing <strong>{filteredGadgets.length}</strong>{" "}
          {filteredGadgets.length === 1 ? "result" : "results"}
          {category !== "All" ? ` in ${category}` : ""}
        </span>

        {(search || category !== "All" || sortBy !== "rating") && (
          <button
            type="button"
            className="tch-catalog-reset"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredGadgets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={27} />
          </div>

          <h2>No matching gadgets found.</h2>
          <p>
            Try another search term, choose a different category,
            or clear your filters.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={resetFilters}
          >
            Clear filters
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredGadgets.map((gadget) => (
            <article
              key={gadget.id}
              className="product-card"
            >
              <Link
                to={`/gadgets/${gadget.id}`}
                className="tch-catalog-image-link"
                aria-label={`View ${gadget.name} details`}
              >
                <ProductVisual gadget={gadget} />
              </Link>

              <div className="product-card-body">
                <div className="product-top-row">
                  <span className="category-chip">
                    {gadget.category}
                  </span>

                  <span className="rating-chip">
                    <Star
                      size={13}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                    {Number(gadget.rating || 0).toFixed(1)}
                  </span>
                </div>

                <h2>{gadget.name}</h2>

                <p className="product-brand">
                  {gadget.brand}
                </p>

                <div className="product-price">
                  {formatPrice(gadget.price)}
                </div>

                <div className="product-score-row">
                  <span>Performance</span>
                  <strong>
                    {gadget.performance_score ?? "—"}
                  </strong>
                </div>

                <div className="product-score-row">
                  <span>Battery</span>
                  <strong>
                    {gadget.battery_score ?? "—"}
                  </strong>
                </div>

                <div className="product-score-row">
                  <span>Value</span>
                  <strong>
                    {gadget.value_score ?? "—"}
                  </strong>
                </div>

                <div className="product-actions">
                  <Link
                    to={`/gadgets/${gadget.id}`}
                    className="btn btn-primary"
                  >
                    View details
                    <ArrowRight size={15} />
                  </Link>

                  <Link
                    to={`/compare?first=${gadget.id}`}
                    className="btn btn-outline"
                  >
                    <GitCompare size={15} />
                    Compare
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Gadgets;