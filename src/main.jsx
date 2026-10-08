import React, { useState, useEffect, useRef, useId } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  X,
  Menu,
  Lightbulb,
  Sparkles,
  MapPin,
  CalendarDays,
  ChevronDown,
  Check,
  CheckCircle2,
  Leaf,
  Brain,
  Activity,
  Blocks,
  Wallet,
  Users,
  ExternalLink,
  MessageSquare,
  Plus,
  Trash2,
  Upload,
  ShieldCheck,
  LogOut,
  Download,
  LayoutGrid,
  Zap,
  ArrowDown,
  Send,
  Layers,
  LoaderCircle,
} from "lucide-react";
import {
  categories,
  stages,
  steps,
  fieldVisible,
  memberFields,
  validateApplication,
} from "../shared/schema.js";
import { readDraft, saveDraft, clearDraft } from "./drafts.js";
import { api } from "./api.js";
import { SubmissionRecovery } from "./SubmissionRecovery.jsx";
import "./styles.css";
import {
  submissionSections,
  isUpload,
  fieldLabel,
} from "../shared/submissions.js";

const symbols = {
  leaf: Leaf,
  brain: Brain,
  pulse: Activity,
  grid: Blocks,
  wallet: Wallet,
  spark: Sparkles,
};
const Icon = ({ name, ...props }) => {
  const C = symbols[name] || Sparkles;
  return <C {...props} />;
};
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
function Brand() {
  return (
    <a
      className="brand"
      href="#home"
      aria-label="Idea Incubator MGIT × NEC 2026 — Home"
    >
      <span className="brand-logo-frame">
        <img
          src="/mgit-nec-logo.png"
          alt="Idea Incubator MGIT × E-Cell IIT Bombay’s National Entrepreneurship Challenge 2026"
          width="1983"
          height="793"
        />
      </span>
    </a>
  );
}
function Button({ children, primary = false, className = "", ...props }) {
  return (
    <button
      className={`btn ${primary ? "btn-primary" : "btn-ghost"} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
function Tag({ children, className = "" }) {
  return <span className={"tag " + className}>{children}</span>;
}
function ErrorBox({ message }) {
  return message ? (
    <div role="alert" className="error-box">
      {message}
    </div>
  ) : null;
}
function Loading() {
  return (
    <div className="loading">
      <LoaderCircle className="spin" /> Bringing the expo to you…
    </div>
  );
}
function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = [
          ...ref.current.querySelectorAll(
            "button,a[href],input,select,textarea",
          ),
        ].filter((x) => !x.disabled);
        if (!items.length) return;
        const first = items[0],
          last = items.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", key);
      prev?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className={"detail-panel " + (wide ? "wide" : "")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        tabIndex={-1}
      >
        <button
          className="icon-btn close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X />
        </button>
        {children}
      </section>
    </div>
  );
}
function RocketScene() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="art-grid" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <div className="art-glow" />
      <div className="rocket-scene">
        <svg className="hero-rocket" viewBox="0 0 340 500" fill="none">
          <defs>
            <linearGradient
              id="rocket-body"
              x1="111"
              y1="170"
              x2="232"
              y2="180"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#6b7db6" />
              <stop offset=".25" stopColor="#dce9fa" />
              <stop offset=".48" stopColor="#f4f7fb" />
              <stop offset=".72" stopColor="#a3b2df" />
              <stop offset="1" stopColor="#445784" />
            </linearGradient>
            <linearGradient
              id="rocket-nose"
              x1="128"
              y1="90"
              x2="207"
              y2="112"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#bce9fa" />
              <stop offset=".42" stopColor="#7fd4f5" />
              <stop offset="1" stopColor="#4664a6" />
            </linearGradient>
            <linearGradient
              id="rocket-fin"
              x1="75"
              y1="250"
              x2="252"
              y2="330"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#bc7aff" />
              <stop offset=".45" stopColor="#a3b2ff" />
              <stop offset="1" stopColor="#3c477f" />
            </linearGradient>
            <linearGradient
              id="rocket-flame"
              x1="170"
              y1="327"
              x2="170"
              y2="472"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#f4f7fb" />
              <stop offset=".23" stopColor="#7affcf" />
              <stop offset=".6" stopColor="#7fd4f5" stopOpacity=".65" />
              <stop offset="1" stopColor="#bc7aff" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="rocket-nozzle"
              x1="133"
              y1="306"
              x2="209"
              y2="337"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8c9aba" />
              <stop offset=".5" stopColor="#25334d" />
              <stop offset="1" stopColor="#6175a5" />
            </linearGradient>
            <radialGradient id="rocket-window">
              <stop stopColor="#142e48" />
              <stop offset=".68" stopColor="#0c1c34" />
              <stop offset="1" stopColor="#050b17" />
            </radialGradient>
            <filter
              id="exhaust-glow"
              x="-100%"
              y="-40%"
              width="300%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>
          <g className="rocket-exhaust">
            <path
              d="M143 325Q122 383 170 479Q218 383 197 325Z"
              fill="url(#rocket-flame)"
              opacity=".6"
              filter="url(#exhaust-glow)"
            />
            <path
              d="M149 328Q137 391 170 462Q203 391 191 328Z"
              fill="url(#rocket-flame)"
            />
            <path
              d="M160 326Q154 363 170 400Q186 363 180 326Z"
              fill="#edfff8"
              opacity=".85"
            />
          </g>
          <path
            d="M127 222L87 265Q77 278 78 292L78 330L128 296Z"
            fill="url(#rocket-fin)"
            stroke="#c3c5ff"
            strokeOpacity=".4"
          />
          <path
            d="M213 222L253 265Q263 278 262 292L262 330L212 296Z"
            fill="url(#rocket-fin)"
            stroke="#a3b2ff"
            strokeOpacity=".4"
          />
          <path
            d="M143 299H197L205 330Q170 342 135 330Z"
            fill="url(#rocket-nozzle)"
            stroke="#a3b2ff"
            strokeOpacity=".3"
          />
          <path
            d="M170 34C125 80 113 143 115 222C116 261 125 292 139 312Q170 322 201 312C215 292 224 261 225 222C227 143 215 80 170 34Z"
            fill="url(#rocket-body)"
            stroke="#d8e7ff"
            strokeOpacity=".5"
          />
          <path
            d="M170 34C146 59 131 87 123 118Q170 136 217 118C209 87 194 59 170 34Z"
            fill="url(#rocket-nose)"
          />
          <path
            d="M123 118Q170 136 217 118"
            stroke="#d9f3ff"
            strokeOpacity=".7"
            strokeWidth="2"
          />
          <path
            d="M142 126C129 171 127 223 140 270"
            stroke="white"
            strokeOpacity=".5"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="170"
            cy="178"
            r="35"
            fill="#4e628e"
            stroke="#e3edff"
            strokeWidth="3"
          />
          <circle
            cx="170"
            cy="178"
            r="28"
            fill="url(#rocket-window)"
            stroke="#7fd4f5"
            strokeOpacity=".55"
            strokeWidth="2"
          />
          <path
            d="M152 175C153 164 161 157 173 159"
            stroke="#7fd4f5"
            strokeOpacity=".65"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="181" cy="190" r="3" fill="#7affcf" opacity=".8" />
          <path
            d="M124 274Q170 288 216 274L211 291Q170 304 129 291Z"
            fill="#a3b2ff"
            fillOpacity=".65"
          />
          <path
            d="M170 251L160 294L166 336Q170 341 174 336L180 294Z"
            fill="url(#rocket-fin)"
            stroke="#d4d9ff"
            strokeOpacity=".6"
          />
          <path
            d="M161 234H179M164 242H176"
            stroke="#52658d"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="148" cy="279" r="2" fill="#e0ebff" />
          <circle cx="192" cy="279" r="2" fill="#e0ebff" />
        </svg>
      </div>
      <span className="art-star s1">✦</span>
      <span className="art-star s2">+</span>
      <span className="art-star s3">✦</span>
      <div className="float-label label-top">
        <span className="tiny-icon">
          <Zap size={15} />
        </span>
        Built on curiosity.
      </div>
      <div className="float-label label-bottom">
        <span className="dot" /> Powered by possibility.
      </div>
      <div className="art-coordinate">17.3916° N &nbsp; 78.3228° E</div>
    </div>
  );
}
function ProductArt({ startup: s, large = false }) {
  return (
    <div className={`product-art ${s.theme || "sky"} ${large ? "large" : ""}`}>
      {s.images?.[0]?.data ? (
        <img src={s.images[0].data} alt={`${s.name} product`} />
      ) : s.logo?.data ? (
        <div className="startup-logo-art">
          <span className="startup-logo-halo" />
          <img src={s.logo.data} alt={`${s.name} logo`} />
        </div>
      ) : (
        <>
          <div className="product-orbit" />
          <div className="product-shape">
            <Icon name={s.symbol} strokeWidth={1.2} />
          </div>
          <span className="product-wordmark">
            {s.name}
            <span>®</span>
          </span>
          <span className="product-caption">
            {s.category === "Sustainability"
              ? "A LITTLE GREENER. A LOT BETTER."
              : s.category === "AI / ML"
                ? "YOUR MIND. SUPERCHARGED."
                : s.category === "HealthTech"
                  ? "MADE FOR EVERY HEARTBEAT."
                  : "BUILT FOR WHAT’S NEXT."}
          </span>
          <span className="product-cross">+</span>
        </>
      )}
      <Tag className="stall-tag">STALL {s.stall || "TBA"}</Tag>
    </div>
  );
}
function StartupCard({ startup: s, onOpen }) {
  return (
    <button
      className="startup-card"
      onClick={() => onOpen(s)}
      aria-label={"View details for " + s.name}
    >
      <ProductArt startup={s} />
      <div className="card-body">
        <div className="card-meta">
          <span>{s.category || "Expo startup"}</span>
          <span className="stage-dot">
            {s.stage || "Selected for the expo"}
          </span>
        </div>
        <div className="startup-identity">
          <span className="startup-card-logo">
            {s.logo?.data ? (
              <img src={s.logo.data} alt="" />
            ) : (
              <Icon name={s.symbol} />
            )}
          </span>
          <div>
            <h3>{s.name}</h3>
            {s.organization && (
              <span className="startup-organization">{s.organization}</span>
            )}
          </div>
        </div>
        <p>{s.tagline}</p>
        <div className="card-footer">
          <span className="team-avatar">
            {(s.founderName || s.members?.[0]?.name || s.name).slice(0, 1)}
          </span>
          <span className="card-founder">
            {s.founderName || s.members?.[0]?.name || "Meet the team"}
          </span>
          <span className="card-details-link">
            Details <ArrowUpRight size={17} />
          </span>
        </div>
      </div>
    </button>
  );
}
function Home({ startups: suppliedStartups, onOpen, loading }) {
  const startups = suppliedStartups.filter(
    (startup) => startup.status === "Approved" && !startup.isDemo,
  );
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All startups"),
    [filters, setFilters] = useState(false),
    [stage, setStage] = useState(""),
    [product, setProduct] = useState(""),
    [hiring, setHiring] = useState(false);
  const filtered = startups.filter(
    (s) =>
      (category === "All startups" || s.category === category) &&
      (!stage || s.stage === stage) &&
      (!product || s.productStatus === product) &&
      (!hiring || s.hiring) &&
      [
        s.name,
        s.tagline,
        s.founderName,
        s.organization,
        s.problem,
        s.productDescription,
        s.category,
        s.requiredSkills,
        ...(s.requiredRoles || []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <section className="hero container" id="home">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <span className="dot" /> THE NEXT BIG THING STARTS HERE
          </div>
          <h1>
            Ideas meet
            <br />
            <span className="gradient-text">possibility.</span>
          </h1>
          <h2>MGIT Startup & Innovation Expo</h2>
          <p className="hero-description">
            Discover student startups, emerging ideas, prototypes
            <br className="desktop-br" /> and innovations built within the MGIT
            ecosystem.
          </p>
          <div className="hero-actions">
            <a href="#explore" className="btn btn-primary">
              Explore startups <ArrowUpRight size={18} />
            </a>
            <a href="#register" className="btn btn-ghost">
              Register your startup <Plus size={18} />
            </a>
          </div>
          <div className="event-info">
            <span>
              <CalendarDays size={16} /> Date to be announced
            </span>
            <span>
              <MapPin size={16} /> MGIT, Hyderabad
            </span>
          </div>
        </div>
        <RocketScene />
        <div className="hero-bottom">
          <div className="hero-community">
            <div className="avatar-stack">
              <span>A</span>
              <span>R</span>
              <span>S</span>
              <span>K</span>
            </div>
            <p>
              Made of ideas. <strong>Built by students.</strong>
            </p>
          </div>
          <a href="#explore" className="scroll-hint">
            STEP INTO THE EXPO <ArrowDown size={14} />
          </a>
          <span className="hero-edition">THE CAMPUS. THE CATALYST.</span>
        </div>
      </section>
      <div className="ticker">
        <div>
          <span>THINK BIG.</span>
          <Sparkles />
          <span>BUILD SOMETHING REAL.</span>
          <Sparkles />
          <span>FIND YOUR PEOPLE.</span>
          <Sparkles />
          <span>SHAPE WHAT’S NEXT.</span>
          <Sparkles />
          <span>THINK BIG.</span>
          <Sparkles />
        </div>
      </div>
      <section id="explore" className="section container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> THE SHOWCASE
            </div>
            <h2>
              Small beginnings.
              <br />
              <span className="muted">Extraordinary possibilities.</span>
            </h2>
          </div>
          <p>
            Meet the builders. Explore their ideas.
            <br />
            Be part of what comes next.
          </p>
        </div>
        {startups.length > 0 && (
          <>
            <div className="discovery-toolbar">
              <div className="search-box">
                <Search size={19} />
                <input
                  aria-label="Search startups"
                  placeholder="Find a startup, idea, or skill…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <kbd>⌕</kbd>
              </div>
              <button
                className={"filter-button " + (filters ? "active" : "")}
                onClick={() => setFilters(!filters)}
                aria-expanded={filters}
              >
                <SlidersHorizontal size={16} /> Filters{" "}
                {(stage || product || hiring) && <span className="dot" />}
                <ChevronDown size={15} />
              </button>
            </div>
            <div className="category-tabs">
              {["All startups", ...categories].map((c) => (
                <button
                  key={c}
                  className={category === c ? "selected" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c === "All startups" && <LayoutGrid size={13} />} {c}
                </button>
              ))}
            </div>
            {filters && (
              <div className="filter-panel">
                <label>
                  Startup stage
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                  >
                    <option value="">All stages</option>
                    {stages.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Product availability
                  <select
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                  >
                    <option value="">All products</option>
                    {[
                      "Concept only",
                      "In development",
                      "Working prototype",
                      "Live product",
                    ].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={hiring}
                    onChange={(e) => setHiring(e.target.checked)}
                  />{" "}
                  Looking for team members
                </label>
                <button
                  className="text-btn"
                  onClick={() => {
                    setStage("");
                    setProduct("");
                    setHiring(false);
                  }}
                >
                  Reset filters
                </button>
              </div>
            )}
            <div className="results-line">
              <span>
                {filtered.length.toString().padStart(2, "0")} STARTUPS TO
                DISCOVER
              </span>
              {startups.some((s) => s.isDemo) && (
                <span className="demo-label">
                  Preview edition · illustrative demo ventures
                </span>
              )}
            </div>
          </>
        )}
        {loading && !startups.length ? (
          <Loading />
        ) : !startups.length ? (
          <div className="showcase-coming-soon glass">
            <span className="coming-soon-icon">
              <Sparkles size={32} />
            </span>
            <div className="eyebrow">THE NEXT WAVE IS ON ITS WAY</div>
            <h3>Coming soon...</h3>
            <p>
              New ideas. Fresh perspectives. The startups shaping what’s next
              will be revealed here.
            </p>
            <a href="#register" className="btn btn-primary">
              Be part of the showcase <ArrowUpRight size={18} />
            </a>
          </div>
        ) : filtered.length ? (
          <div className="startup-grid">
            {filtered.map((s) => (
              <StartupCard key={s.id} startup={s} onOpen={onOpen} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search />
            <h3>
              {startups.length
                ? "No matches, plenty of possibilities."
                : "The next big idea could be yours."}
            </h3>
            <p>
              {startups.length
                ? "Try a different search or clear your filters."
                : "Approved startups will appear here. Be one of the first to apply."}
            </p>
            <Button
              onClick={() => {
                setQuery("");
                setCategory("All startups");
                setStage("");
                setProduct("");
                setHiring(false);
              }}
            >
              Reset discovery
            </Button>
          </div>
        )}
        <div className="showcase-note">
          <ShieldCheck size={15} /> A space to discover, connect, and give ideas
          a little momentum.
        </div>
      </section>
      <section className="container idea-teaser">
        <div className="idea-visual" aria-hidden="true">
          <div className="bulb-halo" />
          <Lightbulb strokeWidth={1} />
          <span className="idea-spark one">+</span>
          <span className="idea-spark two">✦</span>
        </div>
        <div className="idea-teaser-copy">
          <div className="eyebrow amber-text">NO STARTUP? NO PROBLEM.</div>
          <h2>
            Every big thing
            <br />
            starts with a <span className="amber-text">“what if?”</span>
          </h2>
          <p>
            Got a spark of an idea? Drop it in the Idea Box.
            <br />
            Or take on a rapid-fire challenge and think on your feet.
          </p>
          <a className="btn btn-ghost" href="#ideas">
            Step into the Idea Box <ArrowUpRight size={17} />
          </a>
        </div>
        <span className="teaser-number">01 → ∞</span>
      </section>
      <section id="about" className="section container about-section">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> BUILT HERE. GOING EVERYWHERE.
          </div>
          <h2>
            A campus full of ideas.
            <br />A community that believes.
          </h2>
        </div>
        <div>
          <p>
            The MGIT Startup & Innovation Expo brings student founders, curious
            minds, faculty, and future collaborators together. Explore what’s
            being built, share a fresh perspective, and find your place in the
            next story.
          </p>
          <div className="about-signature">
            <Brand />
            <span>
              An initiative by <strong>Idea Incubator · MGIT</strong>
            </span>
          </div>
        </div>
      </section>
      <section className="container register-banner">
        <div>
          <span className="eyebrow">FROM YOUR NOTEBOOK TO THE SPOTLIGHT</span>
          <h2>Your idea deserves a stall.</h2>
        </div>
        <a href="#register" className="btn btn-primary">
          Register your startup <ArrowUpRight size={18} />
        </a>
      </section>
    </>
  );
}
function FeedbackForm({ startup, onDone }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await api("/feedback", {
            method: "POST",
            body: {
              ...Object.fromEntries(new FormData(e.target)),
              startupId: startup.id,
            },
          });
          onDone();
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="eyebrow">A FRESH PERSPECTIVE GOES A LONG WAY</div>
      <h2>Help {startup.name} grow.</h2>
      <p className="form-intro">
        Your feedback is private. Only the founders and organizers can read it.
      </p>
      <div className="form-grid">
        {[
          ["overall", "Overall feedback"],
          ["problem", "What problem does the startup solve?"],
          ["interesting", "What did you find interesting?"],
          ["suggestions", "Suggestions for improvement"],
          ["questions", "Questions for the founders"],
        ].map(([k, l]) => (
          <label key={k} className="full">
            {l} <span>*</span>
            <textarea name={k} required maxLength={6000} rows={3} />
          </label>
        ))}
        <label>
          Your name <small>optional</small>
          <input name="name" />
        </label>
        <label>
          Department / year <small>optional</small>
          <input name="department" />
        </label>
        <label className="full">
          You’re visiting as <span>*</span>
          <select name="visitorType" required>
            {["Student", "Faculty", "Industry", "Other"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <ErrorBox message={error} />
      <Button primary disabled={busy} type="submit">
        {busy ? "Sending…" : "Send feedback"} <Send size={16} />
      </Button>
    </form>
  );
}
function JoinForm({ startup, onDone }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await api("/join", {
            method: "POST",
            body: {
              ...Object.fromEntries(new FormData(e.target)),
              startupId: startup.id,
            },
          });
          onDone();
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="eyebrow">BUILD SOMETHING TOGETHER</div>
      <h2>Find your place at {startup.name}.</h2>
      <p className="form-intro">
        Introduce yourself. Your details will be shared privately with the team
        and organizers.
      </p>
      <div className="form-grid">
        {[
          ["name", "Your name", "text"],
          ["email", "Email address", "email"],
          ["skills", "Your skills", "text"],
          ["message", "Why would you like to join?", "textarea"],
        ].map(([k, l, t]) => (
          <label className="full" key={k}>
            {l} <span>*</span>
            {t === "textarea" ? (
              <textarea required name={k} rows={4} />
            ) : (
              <input type={t} name={k} required />
            )}
          </label>
        ))}
      </div>
      <ErrorBox message={error} />
      <Button primary disabled={busy}>
        {busy ? "Sending…" : "Send your introduction"}{" "}
        <ArrowUpRight size={16} />
      </Button>
    </form>
  );
}
function StartupDetail({ startup: s, onClose }) {
  const [view, setView] = useState("overview");
  return (
    <Modal title={s.name} onClose={onClose}>
      {view === "sent" ? (
        <div className="success-state">
          <CheckCircle2 />
          <h2>A little momentum, delivered.</h2>
          <p>
            Your response has been saved privately for the founders and
            organizers.
          </p>
          <Button onClick={() => setView("overview")}>Back to startup</Button>
        </div>
      ) : view === "feedback" ? (
        <>
          <button className="back-link" onClick={() => setView("overview")}>
            <ArrowLeft size={15} /> Back to {s.name}
          </button>
          <FeedbackForm startup={s} onDone={() => setView("sent")} />
        </>
      ) : view === "join" ? (
        <>
          <button className="back-link" onClick={() => setView("overview")}>
            <ArrowLeft size={15} /> Back to {s.name}
          </button>
          <JoinForm startup={s} onDone={() => setView("sent")} />
        </>
      ) : (
        <>
          <ProductArt startup={s} large />
          <div className="detail-heading">
            <div className="detail-logo">
              {s.logo?.data ? (
                <img src={s.logo.data} alt={`${s.name} logo`} />
              ) : (
                <Icon name={s.symbol} />
              )}
            </div>
            <div>
              <span className="eyebrow">
                {[s.category, s.stage].filter(Boolean).join(" · ") ||
                  "Selected for the expo"}
              </span>
              <h2>{s.name}</h2>
            </div>
          </div>
          <p className="detail-tagline">{s.tagline}</p>
          <div className="startup-facts">
            {s.organization && (
              <div>
                <span>College / organization</span>
                <strong>{s.organization}</strong>
              </div>
            )}
            {s.teamSize > 0 && (
              <div>
                <span>Team size</span>
                <strong>
                  {s.teamSize} {s.teamSize === 1 ? "member" : "members"}
                </strong>
              </div>
            )}
            <div>
              <span>Expo stall</span>
              <strong>{s.stall || "To be assigned"}</strong>
            </div>
          </div>
          {s.display && (
            <div className="detail-block">
              <h3>At the expo</h3>
              <div className="tag-row">
                {(Array.isArray(s.display) ? s.display : [s.display]).map(
                  (item) => (
                    <Tag key={item}>{item}</Tag>
                  ),
                )}
              </div>
              {s.displayOther && <p>{s.displayOther}</p>}
            </div>
          )}
          {s.isDemo && (
            <p className="demo-label">
              Illustrative demo venture · preview content
            </p>
          )}
          <div className="detail-actions">
            <Button primary onClick={() => setView("feedback")}>
              <MessageSquare size={16} /> Give feedback
            </Button>
            {s.hiring && (
              <Button onClick={() => setView("join")}>
                <Users size={16} /> Interested in joining
              </Button>
            )}
            {s.website && (
              <a
                className="btn btn-ghost"
                href={s.website}
                target="_blank"
                rel="noreferrer"
              >
                Visit startup <ExternalLink size={15} />
              </a>
            )}
          </div>
          {[
            ["The problem", s.problem],
            ["The solution", s.solution],
            ["The product", s.productDescription],
            ["Who it’s for", s.targetUsers],
            ["Business model", s.businessModel],
          ].map(
            ([t, v]) =>
              v && (
                <div className="detail-block" key={t}>
                  <h3>{t}</h3>
                  <p>{v}</p>
                </div>
              ),
          )}
          {(s.productStatus ||
            s.demo ||
            s.prototype ||
            s.video ||
            s.social ||
            s.images?.length) && (
            <div className="detail-block">
              <h3>Product & prototype</h3>
              {s.productStatus && <Tag>{s.productStatus}</Tag>}
              <div className="link-row">
                {[
                  ["demo", "Explore the product"],
                  ["prototype", "View prototype"],
                  ["video", "Watch the demo"],
                  ["social", "Social profile"],
                ].map(
                  ([k, l]) =>
                    s[k] && (
                      <a key={k} href={s[k]} target="_blank" rel="noreferrer">
                        {l} <ArrowUpRight size={14} />
                      </a>
                    ),
                )}
              </div>
              {s.images?.slice(1).map((im, i) => (
                <img
                  key={i}
                  className="detail-product-image"
                  src={im.data}
                  alt={`${s.name} product view ${i + 2}`}
                />
              ))}
            </div>
          )}
          {s.members?.length > 0 && (
            <div className="detail-block">
              <h3>The people behind it</h3>
              {s.members?.map((m, i) => (
                <div className="member-row" key={i}>
                  <span className="member-avatar">{m.name[0]}</span>
                  <div>
                    <strong>{m.name}</strong>
                    <small>
                      {[m.role, m.skills].filter(Boolean).join(" · ")}
                    </small>
                  </div>
                  {m.profile && (
                    <a
                      href={m.profile}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${m.name}'s profile`}
                    >
                      <ArrowUpRight size={17} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          {s.hiring && (
            <div className="detail-hiring">
              <div className="eyebrow">
                <span className="dot" /> ROOM FOR ONE MORE GREAT MIND
              </div>
              <h3>Build the next chapter.</h3>
              <div className="tag-row">
                {s.requiredRoles?.map((r) => (
                  <Tag key={r}>{r}</Tag>
                ))}
              </div>
              <p>{s.opportunity}</p>
              <p>{s.requiredSkills}</p>
              <Button onClick={() => setView("join")}>
                Introduce yourself <ArrowUpRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || "home"),
    [mobile, setMobile] = useState(false),
    [startups, setStartups] = useState([]),
    [loading, setLoading] = useState(true),
    [selected, setSelected] = useState(null);
  const refresh = () =>
    api("/startups")
      .then((data) => setStartups(data))
      .catch(() => {
        // Keep the showcase quiet while unavailable; retry on focus and polling.
        // Previously loaded approved profiles remain visible.
      })
      .finally(() => setLoading(false));
  useEffect(() => {
    refresh();
    const fn = () => {
      const r = location.hash.slice(1) || "home";
      setRoute(r);
      setMobile(false);
      if (["home", "explore", "about"].includes(r))
        setTimeout(
          () =>
            document.getElementById(r)?.scrollIntoView({ behavior: "smooth" }),
          80,
        );
      else window.scrollTo(0, 0);
    };
    const refreshOnFocus = () => {
      if (!document.hidden) refresh();
    };
    const interval = window.setInterval(refreshOnFocus, 30000);
    window.addEventListener("focus", refreshOnFocus);
    window.addEventListener("hashchange", fn);
    return () => {
      window.removeEventListener("hashchange", fn);
      window.removeEventListener("focus", refreshOnFocus);
      window.clearInterval(interval);
    };
  }, []);
  const home = ["home", "explore", "about"].includes(route);
  return (
    <>
      <header className="site-header">
        <div className="nav-container">
          <Brand />
          <nav className={mobile ? "open" : ""} aria-label="Main navigation">
            <a className={route === "home" ? "active" : ""} href="#home">
              Home
            </a>
            <a className={route === "explore" ? "active" : ""} href="#explore">
              Explore startups
            </a>
            <a className={route === "ideas" ? "active" : ""} href="#ideas">
              Idea Box <span className="nav-spark">✦</span>
            </a>
            <a className={route === "about" ? "active" : ""} href="#about">
              About the expo
            </a>
          </nav>
          <a className="btn btn-nav" href="#register">
            Register startup <ArrowUpRight size={16} />
          </a>
          <button
            className="mobile-toggle icon-btn"
            aria-label="Toggle menu"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <SubmissionRecovery />
      <main>
        {home ? (
          <Home startups={startups} onOpen={setSelected} loading={loading} />
        ) : route === "register" ? (
          <Registration />
        ) : route === "ideas" ? (
          <IdeaBox />
        ) : ["organizer", "admin"].includes(route) ? (
          <Organizer refreshPublic={refresh} />
        ) : route === "status" ? (
          <ApplicationStatus />
        ) : (
          <div className="container page-shell">
            <h1>Let’s get you back to the expo.</h1>
            <a href="#home" className="btn btn-primary">
              Go home
            </a>
          </div>
        )}
      </main>
      <footer className="container footer">
        <div className="footer-top">
          <Brand />
          <p>A little curiosity can change everything.</p>
          <a href="#home" className="back-top">
            BACK TO TOP <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Idea Incubator · MGIT. Built for
            possibility.
          </span>
          <div>
            <a href="#status">Application status</a>
            <a href="#admin">
              Admin dashboard <ArrowUpRight size={12} />
            </a>
          </div>
          <span>IMAGINE. BUILD. INSPIRE.</span>
        </div>
      </footer>
      {selected && (
        <StartupDetail startup={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function Field({ field, data, onChange, error }) {
  const [key, label, type, required, options] = field;
  const fieldId = useId();
  const [fileError, setFileError] = useState("");
  const isDocument = type === "documents";
  const multiple = type === "files" || isDocument;
  const upload = async (e) => {
    setFileError("");
    const files = [...e.target.files];
    if (!files.length) return;
    if (files.length > (multiple ? 3 : 1)) {
      setFileError(multiple ? "Choose up to 3 files." : "Choose one logo.");
      return;
    }
    if (
      files.some(
        (f) =>
          ![
            "image/png",
            "image/jpeg",
            "image/webp",
            ...(isDocument ? ["application/pdf"] : []),
          ].includes(f.type) || f.size > 2 * 1024 * 1024,
      )
    ) {
      setFileError(
        isDocument
          ? "Use PDF, PNG, JPEG or WebP files, each under 2 MB."
          : "Use PNG, JPEG or WebP images, each under 2 MB.",
      );
      return;
    }
    const values = await Promise.all(
      files.map(
        (f) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ name: f.name, data: reader.result });
            reader.onerror = () => reject(new Error("File could not be read."));
            reader.readAsDataURL(f);
          }),
      ),
    ).catch((e) => {
      setFileError(e.message);
      return null;
    });
    if (values) onChange(key, type === "file" ? values[0] : values);
  };
  const common = {
    id: fieldId,
    name: key,
    value: data[key] || "",
    onChange: (e) => onChange(key, e.target.value),
    "aria-required": !!required,
    "aria-invalid": !!error,
    "aria-describedby": error ? fieldId + "-error" : undefined,
  };
  if (!fieldVisible(key, data)) return null;
  if (type === "members") {
    const count = Math.min(99, Math.max(0, Number(data.teamSize) - 1)) || 0;
    return (
      <div className="field full team-form">
        <h3>{label}</h3>
        {Array.from({ length: count }, (_, index) => (
          <fieldset className="team-entry" key={index}>
            <legend className="eyebrow">TEAM MEMBER {index + 2}</legend>
            <div className="form-grid">
              {memberFields.map((memberField) => (
                <Field
                  key={memberField[0]}
                  field={memberField}
                  data={data.members?.[index] || {}}
                  onChange={(memberKey, value) =>
                    onChange(
                      "members",
                      Array.from({ length: count }, (_, i) =>
                        i === index
                          ? { ...data.members?.[i], [memberKey]: value }
                          : data.members?.[i] || {},
                      ),
                    )
                  }
                />
              ))}
            </div>
          </fieldset>
        ))}
        {error && (
          <small className="field-error" role="alert">
            {error}
          </small>
        )}
      </div>
    );
  }
  if (type === "boolean")
    return (
      <div className="field full">
        <label className="toggle-field" htmlFor={fieldId}>
          <span>
            {label} {required && <span>*</span>}
          </span>
          <input
            id={fieldId}
            type="checkbox"
            checked={!!data[key]}
            aria-required={!!required}
            aria-invalid={!!error}
            aria-describedby={error ? fieldId + "-error" : undefined}
            onChange={(e) => onChange(key, e.target.checked)}
          />
          <span className="toggle-track" />
        </label>
        {error && (
          <small id={fieldId + "-error"} className="field-error">
            {error}
          </small>
        )}
      </div>
    );
  return (
    <div
      className={
        "field " +
        (["textarea", "file", "files", "documents", "checks"].includes(type)
          ? "full"
          : "")
      }
    >
      <label htmlFor={fieldId}>
        {label} {required ? <span>*</span> : <small>optional</small>}
      </label>
      {type === "textarea" ? (
        <>
          <textarea {...common} rows={4} maxLength={6000} />
          {key === "relevantLinks" && (
            <small>
              Website, social profile, demo or portfolio — one complete https://
              link per line.
            </small>
          )}
        </>
      ) : type === "select" ? (
        <select {...common}>
          <option value="">Select an option</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : type === "checks" ? (
        <div
          className="check-options"
          role="group"
          aria-label={label}
          aria-describedby={error ? fieldId + "-error" : undefined}
        >
          {options.map((o) => (
            <label key={o}>
              <input
                type="checkbox"
                checked={data[key]?.includes(o) || false}
                onChange={(e) =>
                  onChange(
                    key,
                    e.target.checked
                      ? [...(data[key] || []), o]
                      : (data[key] || []).filter((v) => v !== o),
                  )
                }
              />
              {o}
            </label>
          ))}
        </div>
      ) : ["file", "files", "documents"].includes(type) ? (
        <div className="upload-box">
          <Upload size={23} />
          <strong>
            {isDocument ? "Choose supporting documents" : "Choose startup logo"}
          </strong>
          <small>
            {isDocument
              ? "PDF, PNG, JPG or WebP · Up to 2 MB each · Maximum 3 files"
              : "PNG, JPG or WebP · Up to 2 MB"}
          </small>
          <input
            id={fieldId}
            aria-label={label}
            aria-required={!!required}
            aria-invalid={!!error}
            type="file"
            aria-describedby={
              error || fileError ? fieldId + "-error" : undefined
            }
            accept={
              isDocument
                ? "application/pdf,image/png,image/jpeg,image/webp"
                : "image/png,image/jpeg,image/webp"
            }
            multiple={multiple}
            onChange={upload}
          />
          {data[key] && (
            <div className="upload-previews">
              {(multiple ? data[key] : [data[key]]).map((f, i) => (
                <div key={i}>
                  {!isDocument && <img src={f.data} alt={f.name} />}
                  <span>{f.name}</span>
                  <button
                    type="button"
                    className="text-btn"
                    aria-label={"Remove " + f.name}
                    onClick={() => {
                      onChange(
                        key,
                        multiple ? data[key].filter((_, j) => i !== j) : null,
                      );
                      setFileError("");
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <input
          {...common}
          type={type}
          inputMode={key === "teamSize" ? "numeric" : undefined}
          min={type === "number" ? 1 : undefined}
          max={type === "number" ? 100 : undefined}
          maxLength={type === "text" ? 500 : undefined}
        />
      )}{" "}
      {(error || fileError) && (
        <small id={fieldId + "-error"} className="field-error">
          {error || fileError}
        </small>
      )}
    </div>
  );
}
function TeamReview({ members = [] }) {
  return members.map((member, index) => (
    <span className="team-review-member" key={index}>
      <span>
        Member {index + 2}: {member.name}
      </span>
      <span>
        {member.phone} · {member.email}
      </span>
      <span>
        {[member.organization, member.role].filter(Boolean).join(" · ")}
      </span>
    </span>
  ));
}
function Registration() {
  const [data, setData] = useState(null),
    [step, setStep] = useState(0),
    [errors, setErrors] = useState({}),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(true),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState(null);
  useEffect(() => {
    readDraft().then(setData);
  }, []);
  useEffect(() => {
    if (!data || result) return;
    let current = true;
    saveDraft(data)
      .then(() => {
        if (current) setSaved(true);
      })
      .catch(() => {
        if (current) setSaved(false);
      });
    return () => {
      current = false;
    };
  }, [data, result]);
  const change = (k, v) => {
    setData((d) => {
      const updated = { ...d, [k]: v };
      if (
        k === "teamSize" &&
        /^\d+$/.test(v) &&
        Number(v) >= 1 &&
        Number(v) <= 100
      )
        updated.members = Array.from(
          { length: Number(v) - 1 },
          (_, i) => d.members?.[i] || {},
        );
      if (k === "display" && !v.includes("Other")) updated.displayOther = "";
      return updated;
    });
    setErrors((previous) => ({
      ...previous,
      [k]: undefined,
      ...(k === "teamSize" ? { members: undefined } : {}),
    }));
  };
  const next = () => {
    const all = validateApplication(data);
    const keys = steps[step].fields.map((f) => f[0]);
    const current = Object.fromEntries(
      Object.entries(all).filter(([k]) => keys.includes(k)),
    );
    setErrors(current);
    if (!Object.keys(current).length) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 160, behavior: "smooth" });
    }
  };
  const submit = async () => {
    const all = validateApplication(data);
    if (Object.keys(all).length) {
      setErrors(all);
      const first = steps.findIndex((s) => s.fields.some((f) => all[f[0]]));
      setStep(Math.max(0, first));
      setError("Please complete the highlighted fields.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await api("/applications", { method: "POST", body: data });
      setResult(r);
      await clearDraft().catch(() => {});
      try {
        localStorage.setItem("mgit-application", JSON.stringify(r));
      } catch {}
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (!data)
    return (
      <div className="container page-shell">
        <Loading />
      </div>
    );
  if (result)
    return (
      <div className="container page-shell">
        <div className="success-state submission-success">
          <CheckCircle2 />
          <div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>
            You’re one step
            <br />
            closer to the spotlight.
          </h1>
          <p>Your startup registration has been submitted successfully.</p>
          <div className="reference-card">
            <span className="eyebrow">YOUR APPLICATION REFERENCE</span>
            <strong>{result.id}</strong>
            <label>
              Private access code
              <input
                readOnly
                value={result.token}
                onFocus={(e) => e.target.select()}
              />
            </label>
            <small>
              Save both details to check your status and read private feedback
              from another device.
            </small>
          </div>
          <a className="btn btn-primary" href="#status">
            Track your application <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    );
  return (
    <div className="container page-shell">
      <div className="page-heading">
        <div className="eyebrow">
          <span className="eyebrow-line" /> THE NEXT BIG THING COULD BE YOURS
        </div>
        <h1>
          Bring your idea
          <br />
          <span className="gradient-text">to the spotlight.</span>
        </h1>
        <p>Tell us what you’re building. We’ll make room for possibility.</p>
      </div>
      <div className="registration-layout">
        <aside className="step-sidebar">
          <span className="eyebrow">YOUR STARTUP APPLICATION</span>
          {steps.map((s, i) => (
            <button
              key={s.title}
              className={
                "step-item " +
                (i === step ? "current" : "") +
                (i < step ? " complete" : "")
              }
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
            >
              <span>
                {i < step ? (
                  <Check size={15} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <div>
                {s.title}
                {i === step && <small>YOU ARE HERE</small>}
              </div>
            </button>
          ))}
          <div className="draft-note">
            <ShieldCheck size={18} />
            <p>
              {saved
                ? "Your progress is saved on this device. Come back when inspiration strikes."
                : "Device storage is full. Keep this page open until submission."}
            </p>
          </div>
        </aside>
        <section className="registration-card glass">
          <div className="form-step-heading">
            <span className="eyebrow">
              STEP {String(step + 1).padStart(2, "0")} OF{" "}
              {String(steps.length).padStart(2, "0")}
            </span>
            <span className="save-indicator">
              <span className="dot" />
              {saved ? "Draft saved locally" : "Not saved"}
            </span>
          </div>
          <div className="progress-track">
            <div style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
          <h2>{steps[step].title}</h2>
          <p className="form-intro">{steps[step].caption}</p>
          {step === steps.length - 1 ? (
            <div className="review-sections">
              {steps.slice(0, -1).map((s, i) => (
                <div className="review-section" key={s.title}>
                  <div>
                    <h3>{s.title}</h3>
                    <button className="text-btn" onClick={() => setStep(i)}>
                      Edit <ArrowUpRight size={13} />
                    </button>
                  </div>
                  {s.fields
                    .filter(([key]) => fieldVisible(key, data))
                    .map(([k, l, t]) => (
                      <div className="review-row" key={k}>
                        <span>{l}</span>
                        <strong>
                          {t === "members" ? (
                            <TeamReview members={data[k]} />
                          ) : t === "file" ? (
                            data[k]?.name
                          ) : ["files", "documents"].includes(t) ? (
                            data[k]?.map((f) => f.name).join(", ")
                          ) : t === "boolean" ? (
                            data[k] ? (
                              "Yes"
                            ) : (
                              "No"
                            )
                          ) : Array.isArray(data[k]) ? (
                            data[k].join(", ")
                          ) : (
                            data[k] || "—"
                          )}
                        </strong>
                      </div>
                    ))}
                </div>
              ))}
              <p className="privacy-note">
                <ShieldCheck size={17} /> Team contact details, college emails
                and stall requirements stay private. Accepted profiles show your
                startup logo, idea, leader and team names, college, and expo
                display details.
              </p>
            </div>
          ) : (
            <div className="form-grid">
              {steps[step].fields.map((f) => (
                <Field
                  key={f[0]}
                  field={f}
                  data={data}
                  onChange={change}
                  error={errors[f[0]]}
                />
              ))}
            </div>
          )}
          <ErrorBox message={error} />
          <div className="form-bottom">
            <Button
              onClick={() => {
                setStep(Math.max(0, step - 1));
                setErrors({});
              }}
              disabled={step === 0 || busy}
            >
              <ArrowLeft size={16} /> Back
            </Button>
            <span className="required-hint">* Required fields</span>
            {step === steps.length - 1 ? (
              <Button primary disabled={busy} onClick={submit}>
                {busy ? "Submitting…" : "Submit application"}{" "}
                <ArrowUpRight size={17} />
              </Button>
            ) : (
              <Button primary onClick={next}>
                Continue <ArrowRight size={17} />
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function IdeaBox() {
  const [mode, setMode] = useState("idea"),
    [problems, setProblems] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState(null);
  useEffect(() => {
    api("/problems")
      .then(setProblems)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div className="container page-shell idea-page">
      <div className="page-heading">
        <div className="eyebrow amber-text">
          <Lightbulb size={16} /> FOR THE WHAT-IF THINKERS
        </div>
        <h1>
          A small spark.
          <br />
          <span className="gradient-text">An endless possibility.</span>
        </h1>
        <p>
          You don’t need a startup to start something. Just an idea worth
          exploring.
        </p>
      </div>
      {result ? (
        <div className="glass success-state">
          <CheckCircle2 />
          <h2>Your idea is in good company.</h2>
          <p>We’ve saved your submission for the organizers to review.</p>
          <Tag>{result.id}</Tag>
          <Button onClick={() => setResult(null)}>
            Share another idea <Plus size={16} />
          </Button>
        </div>
      ) : (
        <div className="idea-layout">
          <aside>
            <h3>Leave a little inspiration.</h3>
            <p>
              A problem you noticed. A solution you imagined. A better way of
              doing something.
            </p>
            <div className="idea-side-item">
              <span>01</span>
              <div>
                <strong>Spot a real problem</strong>
                <p>Start with something that matters to you.</p>
              </div>
            </div>
            <div className="idea-side-item">
              <span>02</span>
              <div>
                <strong>Imagine a better way</strong>
                <p>It doesn’t have to be perfect. Just yours.</p>
              </div>
            </div>
            <div className="idea-side-item">
              <span>03</span>
              <div>
                <strong>Put it out into the world</strong>
                <p>The NEC team will review your idea.</p>
              </div>
            </div>
            <div className="idea-quote">
              “What if?”<span>Two words. Infinite beginnings.</span>
            </div>
          </aside>
          <section className="glass registration-card">
            <div className="segmented">
              <button
                className={mode === "idea" ? "selected" : ""}
                onClick={() => setMode("idea")}
              >
                <Lightbulb size={17} /> Idea submission
              </button>
              <button
                className={mode === "rapid" ? "selected" : ""}
                onClick={() => setMode("rapid")}
              >
                <Zap size={17} /> Rapid-fire challenge
              </button>
            </div>
            <h2>
              {mode === "idea"
                ? "Tell us your “what if.”"
                : "Think fast. Think differently."}
            </h2>
            <p className="form-intro">
              {mode === "idea"
                ? "Your next big idea starts right here."
                : "Pick an NEC challenge and share your take on it."}
            </p>
            {mode === "rapid" && !problems.length ? (
              <div className="empty-state">
                <Zap />
                <h3>The next challenge is warming up.</h3>
                <p>
                  NEC problem statements haven’t been published yet. Share your
                  own idea while you wait.
                </p>
                <Button onClick={() => setMode("idea")}>
                  Submit your own idea
                </Button>
              </div>
            ) : (
              <form
                key={mode}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setError("");
                  try {
                    setResult(
                      await api("/ideas", {
                        method: "POST",
                        body: {
                          ...Object.fromEntries(new FormData(e.target)),
                          mode,
                        },
                      }),
                    );
                  } catch (e) {
                    setError(e.message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <div className="form-grid">
                  {[
                    ["name", "Your name", "text"],
                    ["email", "Email address", "email"],
                    ["department", "Department", "text"],
                    ["year", "Year", "text"],
                  ].map(([k, l, t]) => (
                    <label key={k}>
                      {l} <span>*</span>
                      <input required name={k} type={t} />
                    </label>
                  ))}
                  {mode === "rapid" ? (
                    <label className="full">
                      Choose a problem statement <span>*</span>
                      <select name="problemId" required defaultValue="">
                        <option value="">Select a challenge</option>
                        {problems.map((p) => (
                          <option value={p.id} key={p.id}>
                            {p.title} — {p.description}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <label className="full">
                      What problem have you noticed? <span>*</span>
                      <textarea name="problem" required rows={3} />
                    </label>
                  )}
                  <label className="full">
                    Your proposed solution <span>*</span>
                    <textarea name="solution" required rows={4} />
                  </label>
                  {(mode === "rapid"
                    ? [["explanation", "A short explanation"]]
                    : [
                        ["targetUsers", "Who is this for?"],
                        ["why", "Why does this idea matter?"],
                        ["skills", "What skills would you need?"],
                        ["members", "Team members (optional)"],
                      ]
                  ).map(([k, l]) => (
                    <label key={k} className="full">
                      {l} {k !== "members" && <span>*</span>}
                      <textarea name={k} required={k !== "members"} rows={2} />
                    </label>
                  ))}
                </div>
                <p className="privacy-note">
                  <ShieldCheck size={16} /> Ideas are shared privately with the
                  organizing team.
                </p>
                <ErrorBox message={error} />
                <Button primary disabled={busy}>
                  {busy ? "Submitting…" : "Send a little possibility"}{" "}
                  <ArrowUpRight size={17} />
                </Button>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
function ApplicationStatus() {
  const [stored] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem("mgit-application")) || {};
      } catch {
        return {};
      }
    }),
    [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="container page-shell status-page">
      <div className="page-heading">
        <div className="eyebrow">YOUR STARTUP JOURNEY</div>
        <h1>
          Good things
          <br />
          <span className="gradient-text">are in the making.</span>
        </h1>
        <p>Track your application and read your private founder inbox.</p>
      </div>
      <form
        className="glass status-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const d = Object.fromEntries(new FormData(e.target));
          try {
            setResult(
              await api(
                "/applications/" + encodeURIComponent(d.id) + "/status",
                { headers: { "x-tracking-token": d.token } },
              ),
            );
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Application reference
          <input
            name="id"
            defaultValue={stored.id}
            placeholder="MGIT-…"
            required
          />
        </label>
        <label>
          Private access code
          <input
            name="token"
            type="password"
            defaultValue={stored.token}
            required
          />
        </label>
        <Button primary disabled={busy}>
          {busy ? "Checking…" : "Check application"} <ArrowRight size={16} />
        </Button>
        <ErrorBox message={error} />
      </form>
      {result && (
        <div className="status-result glass">
          <div className="section-heading">
            <h2>{result.name}</h2>
            <Tag>{result.status}</Tag>
          </div>
          <p>
            {result.stall
              ? `Your stall: ${result.stall}`
              : "Your stall number will appear here once assigned."}
          </p>
          <h3>Private founder inbox</h3>
          {!result.feedback.length && !result.interests.length ? (
            <p>
              No messages yet. Feedback and team introductions will appear here.
            </p>
          ) : (
            <>
              {result.feedback.map((f) => (
                <div className="inbox-item" key={f.id}>
                  <Tag>{f.visitorType} feedback</Tag>
                  {[
                    "overall",
                    "problem",
                    "interesting",
                    "suggestions",
                    "questions",
                  ].map((k) => (
                    <p key={k}>
                      <strong>{k}: </strong>
                      {f[k]}
                    </p>
                  ))}
                </div>
              ))}
              {result.interests.map((i) => (
                <div className="inbox-item" key={i.id}>
                  <h4>{i.name} is interested in joining</h4>
                  <p>{i.skills}</p>
                  <p>{i.message}</p>
                  <a href={"mailto:" + i.email}>{i.email}</a>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Organizer({ refreshPublic }) {
  const [user, setUser] = useState(null),
    [checked, setChecked] = useState(false),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("Applications"),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [stage, setStage] = useState(""),
    [status, setStatus] = useState(""),
    [selected, setSelected] = useState(null),
    [confirmDemo, setConfirmDemo] = useState(false),
    [selectedSubmission, setSelectedSubmission] = useState(null),
    [reviewNotice, setReviewNotice] = useState(""),
    [lastSynced, setLastSynced] = useState(null);
  const load = () =>
    api("/admin")
      .then((fresh) => {
        setData(fresh);
        setLastSynced(new Date());
        setError("");
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    api("/me")
      .then((u) => {
        setUser(u);
        load();
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);
  useEffect(() => {
    if (!user) return;
    const refresh = () => {
      if (!document.hidden) load();
    };
    const timer = setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [user]);
  if (!checked)
    return (
      <div className="page-shell container">
        <Loading />
      </div>
    );
  if (!user)
    return (
      <div className="container page-shell login-page">
        <div className="login-art">
          <div className="eyebrow">BEHIND EVERY GREAT EXPO</div>
          <h1>
            A team that
            <br />
            <span className="gradient-text">makes it happen.</span>
          </h1>
          <p>Welcome to the organizer workspace.</p>
          <ShieldCheck size={88} strokeWidth={0.8} />
        </div>
        <form
          className="glass login-card"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              setUser(
                await api("/login", {
                  method: "POST",
                  body: Object.fromEntries(new FormData(e.target)),
                }),
              );
              load();
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Tag>
            <ShieldCheck size={12} /> ORGANIZER ACCESS
          </Tag>
          <h2>Welcome back.</h2>
          <p>Sign in to manage the next wave of possibilities.</p>
          <label>
            Email address
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>
          <ErrorBox message={error} />
          <Button primary disabled={busy}>
            {busy ? "Signing in…" : "Sign in"} <ArrowRight size={17} />
          </Button>
          <small>Access is reserved for the MGIT organizing team.</small>
        </form>
      </div>
    );
  const tabs = [
    "Applications",
    "Startups",
    "Stall assignments",
    "Feedback",
    "Idea Box",
  ];
  const applications =
    data?.applications.filter(
      (a) =>
        [a.name, a.founderName, a.email, a.organization, a.id]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (!category || a.category === category) &&
        (!stage || a.stage === stage) &&
        (!status || a.status === status),
    ) || [];
  return (
    <div className="container page-shell organizer-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">THE ORGANIZER WORKSPACE</div>
          <h1>Submission dashboard.</h1>
          <p>
            Review every submission, manage decisions and download complete
            records.
          </p>
        </div>
        <Button
          onClick={async () => {
            try {
              await api("/logout", { method: "POST" });
              setUser(null);
              setData(null);
            } catch (e) {
              setError(e.message);
            }
          }}
        >
          <LogOut size={16} /> Sign out
        </Button>
      </div>
      {reviewNotice && (
        <div className="review-notice" role="status">
          <CheckCircle2 size={20} />
          <span>{reviewNotice}</span>
          <a href="#explore">
            View homepage <ArrowUpRight size={16} />
          </a>
        </div>
      )}
      <div className="admin-sync">
        <span>
          {lastSynced
            ? "Last refreshed " + lastSynced.toLocaleTimeString()
            : "Connecting to submissions…"}
        </span>
        <Button onClick={load}>Refresh submissions</Button>
      </div>
      <div className="admin-stats">
        {[
          ["Applications", data?.applications.length || 0],
          [
            "Awaiting review",
            data?.applications.filter((a) =>
              ["Submitted", "Under Review"].includes(a.status),
            ).length || 0,
          ],
          [
            "Approved startups",
            data?.startups.filter((s) => s.status === "Approved" && !s.isDemo)
              .length || 0,
          ],
          [
            "Ideas received",
            (data?.ideas.length || 0) + (data?.rapid.length || 0),
          ],
        ].map(([l, n]) => (
          <div className="glass" key={l}>
            <span>{l}</span>
            <strong>{String(n).padStart(2, "0")}</strong>
          </div>
        ))}
      </div>
      <div className="admin-tabs">
        {tabs.map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
        <a className="export-link" href="/api/admin/export">
          <Download size={15} /> Export CSV
        </a>
      </div>
      <ErrorBox message={error} />
      {!data ? (
        <Loading />
      ) : tab === "Applications" ? (
        <>
          <div className="admin-filters">
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search applications…"
                aria-label="Search applications"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              aria-label="Filter stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              <option value="">All stages</option>
              {stages.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              aria-label="Filter status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {[
                "Draft",
                "Submitted",
                "Under Review",
                "Approved",
                "Rejected",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Startup / reference</th>
                  <th>Team leader</th>
                  <th>Team size</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.name}</strong>
                      <small>{a.id}</small>
                    </td>
                    <td>
                      {a.founderName}
                      <small>{a.email}</small>
                    </td>
                    <td>{a.teamSize || a.members?.length || "—"}</td>
                    <td>
                      <Tag className={"status-" + a.status.replace(" ", "-")}>
                        {a.status}
                      </Tag>
                    </td>
                    <td>{formatDate(a.submittedAt)}</td>
                    <td>
                      <button
                        className="text-btn"
                        onClick={() => setSelected(a)}
                      >
                        Review <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!applications.length && (
              <div className="empty-state">
                <Layers />
                <h3>No applications here yet.</h3>
                <p>New founder submissions will arrive in this workspace.</p>
              </div>
            )}
          </div>
        </>
      ) : tab === "Startups" ? (
        <>
          <div className="results-line">
            <span>PUBLIC SHOWCASE PROFILES</span>
            {data.startups.some((s) => s.isDemo) && (
              <button className="text-btn" onClick={() => setConfirmDemo(true)}>
                Remove demo ventures <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="admin-list">
            {data.startups.map((s) => (
              <div className="glass admin-list-item" key={s.id}>
                <div>
                  <h3>{s.name}</h3>
                  <p>
                    {s.category} · {s.stage} {s.isDemo ? "· Demo venture" : ""}
                  </p>
                </div>
                <Tag>{s.status}</Tag>
              </div>
            ))}
          </div>
        </>
      ) : tab === "Stall assignments" ? (
        <>
          <h2>A place for every possibility.</h2>
          <p className="form-intro">
            Assign a unique stall number through an approved application’s
            review panel.
          </p>
          <div className="admin-list">
            {data.applications
              .filter((a) => a.status === "Approved")
              .map((a) => (
                <div className="glass admin-list-item" key={a.id}>
                  <div>
                    <h3>{a.name}</h3>
                    <p>{a.display}</p>
                  </div>
                  <Tag>
                    STALL{" "}
                    {data.startups.find((s) => s.id === a.id)?.stall ||
                      "UNASSIGNED"}
                  </Tag>
                  <Button onClick={() => setSelected(a)}>
                    Assign stall <ArrowUpRight size={15} />
                  </Button>
                </div>
              ))}
          </div>
          {!data.applications.some((a) => a.status === "Approved") && (
            <div className="empty-state">
              <MapPin />
              <h3>Your expo floor is waiting.</h3>
              <p>Approve an application to assign its stall.</p>
            </div>
          )}
        </>
      ) : tab === "Feedback" ? (
        <>
          <h2>Conversations that move ideas forward.</h2>
          <div className="admin-list">
            {data.feedback.map((f) => (
              <div className="glass feedback-item" key={f.id}>
                <Button
                  onClick={() =>
                    setSelectedSubmission({ kind: "feedback", record: f })
                  }
                >
                  View full details <ArrowUpRight size={16} />
                </Button>
                <Tag>
                  {data.startups.find((s) => s.id === f.startupId)?.name ||
                    f.startupId}
                </Tag>
                <h3>
                  {f.name || "Anonymous visitor"} · {f.visitorType}
                </h3>
                {[
                  "overall",
                  "problem",
                  "interesting",
                  "suggestions",
                  "questions",
                ].map((k) => (
                  <p key={k}>
                    <strong>{k}: </strong>
                    {f[k]}
                  </p>
                ))}
              </div>
            ))}
            {data.interests.map((i) => (
              <div className="glass feedback-item" key={i.id}>
                <Button
                  onClick={() =>
                    setSelectedSubmission({ kind: "interests", record: i })
                  }
                >
                  View full details <ArrowUpRight size={16} />
                </Button>
                <Tag>
                  TEAM INTRODUCTION ·{" "}
                  {data.startups.find((s) => s.id === i.startupId)?.name}
                </Tag>
                <h3>{i.name}</h3>
                <p>
                  {i.email} · {i.skills}
                </p>
                <p>{i.message}</p>
              </div>
            ))}
          </div>
          {!data.feedback.length && !data.interests.length && (
            <div className="empty-state">
              <MessageSquare />
              <h3>A fresh perspective is on its way.</h3>
              <p>Private feedback and team introductions appear here.</p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="idea-admin-grid">
            <section className="glass feedback-item">
              <h3>Publish a rapid-fire challenge</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  try {
                    await api("/admin/problems", {
                      method: "POST",
                      body: Object.fromEntries(new FormData(form)),
                    });
                    form.reset();
                    load();
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                <label>
                  Problem title
                  <input name="title" required />
                </label>
                <label>
                  Problem statement
                  <textarea name="description" rows={3} required />
                </label>
                <Button primary>
                  Publish challenge <Plus size={16} />
                </Button>
              </form>
            </section>
            <section className="glass feedback-item">
              <h3>NEC challenges</h3>
              {data.problems.length ? (
                data.problems.map((p) => (
                  <div className="challenge-item" key={p.id}>
                    <strong>{p.title}</strong>
                    <p>{p.description}</p>
                    <button
                      className="text-btn"
                      onClick={async () => {
                        try {
                          await api("/admin/problems/" + p.id, {
                            method: "PATCH",
                            body: { active: !p.active },
                          });
                          load();
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      {p.active ? "Close submissions" : "Reopen submissions"}
                    </button>
                  </div>
                ))
              ) : (
                <p>No published challenges yet.</p>
              )}
            </section>
          </div>
          <h2>Fresh from the Idea Box</h2>
          <div className="admin-list">
            {[...data.ideas, ...data.rapid].map((i) => (
              <div className="glass feedback-item" key={i.id}>
                <Button
                  onClick={() =>
                    setSelectedSubmission({
                      kind: i.mode === "rapid" ? "rapid" : "ideas",
                      record: i,
                    })
                  }
                >
                  View full details <ArrowUpRight size={16} />
                </Button>
                <Tag>
                  {i.mode === "rapid" ? "Rapid-fire" : "Original idea"} · {i.id}
                </Tag>
                <h3>
                  {i.name} · {i.department}, {i.year}
                </h3>
                <p>{i.email}</p>
                {[
                  "problem",
                  "solution",
                  "targetUsers",
                  "why",
                  "skills",
                  "members",
                  "explanation",
                ].map(
                  (k) =>
                    i[k] && (
                      <p key={k}>
                        <strong>{k}: </strong>
                        {i[k]}
                      </p>
                    ),
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {selectedSubmission && (
        <Modal
          title="Submission details"
          onClose={() => setSelectedSubmission(null)}
          wide
        >
          <h2>{selectedSubmission.record.name || "Submission details"}</h2>
          <SubmissionDownloads
            kind={selectedSubmission.kind}
            id={selectedSubmission.record.id}
          />
          <SubmissionDetails record={selectedSubmission.record} />
        </Modal>
      )}
      {selected && (
        <ApplicationReview
          application={selected}
          stall={data.startups.find((s) => s.id === selected.id)?.stall || ""}
          onClose={() => setSelected(null)}
          onSaved={(status) => {
            setReviewNotice(
              status === "Approved"
                ? "Application accepted. The startup is now live on the homepage."
                : status === "Rejected"
                  ? "Application rejected. This startup is not visible on the homepage."
                  : "Review saved.",
            );
            setSelected(null);
            load();
            refreshPublic();
          }}
        />
      )}
      {confirmDemo && (
        <Modal
          title="Remove demo ventures"
          onClose={() => setConfirmDemo(false)}
        >
          <h2>Make room for real ventures.</h2>
          <p>
            Remove the six illustrative demo profiles from the showcase?
            Submitted applications and real startup profiles are kept.
          </p>
          <div className="detail-actions">
            <Button onClick={() => setConfirmDemo(false)}>Keep demos</Button>
            <Button
              primary
              onClick={async () => {
                try {
                  await api("/admin/demo", { method: "DELETE" });
                  setConfirmDemo(false);
                  load();
                  refreshPublic();
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              Remove demo ventures
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function SubmissionDownloads({ kind, id }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function download(format) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(
        "/api/admin/submissions/" +
          kind +
          "/" +
          encodeURIComponent(id) +
          "/export?format=" +
          format,
      );
      if (!response.ok)
        throw new Error((await response.json()).error || "Download failed.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = kind + "-" + id + "." + format;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="submission-downloads">
      <div className="detail-actions">
        <Button disabled={busy} onClick={() => download("md")}>
          <Download size={17} /> Download MD
        </Button>
        <Button primary disabled={busy} onClick={() => download("pdf")}>
          <Download size={17} /> Download PDF
        </Button>
      </div>
      <ErrorBox message={error} />
    </div>
  );
}
function SubmissionDetails({ record }) {
  const uploads = Object.entries(record).flatMap(([key, value]) =>
    (Array.isArray(value) ? value : [value])
      .filter(isUpload)
      .map((file) => ({ ...file, label: fieldLabel(key) })),
  );
  return (
    <div className="review-sections submission-details">
      {submissionSections(record).map((section) => (
        <section className="review-section" key={section.title}>
          <h3>{section.title}</h3>
          <dl>
            {section.fields.map((field) => (
              <div className="review-row" key={field.key}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      {uploads.length > 0 && (
        <section className="review-section">
          <h3>Uploaded files</h3>
          <div className="submission-uploads">
            {uploads.map((file, index) => (
              <a
                key={index}
                href={file.data}
                download={file.name}
                className="submission-upload"
              >
                {file.data.startsWith("data:image/") && (
                  <img src={file.data} alt={file.label} />
                )}
                <span>
                  {file.label}
                  <strong>{file.name}</strong>
                </span>
                <Download size={18} />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
function ApplicationReview({ application: a, stall, onClose, onSaved }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const formId = useId();
  const accepted = a.status === "Approved";
  return (
    <Modal title={"Review " + a.name} onClose={onClose} wide>
      <div className="application-review-heading">
        {a.logo?.data && <img src={a.logo.data} alt={a.name + " logo"} />}
        <div>
          <div className="eyebrow">APPLICATION {a.id}</div>
          <h2>{a.name}</h2>
          <p>{a.tagline}</p>
        </div>
      </div>
      <section className={"publication-panel " + (accepted ? "published" : "")}>
        <span className="publication-icon">
          {accepted ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
        </span>
        <div>
          <h3>
            {accepted
              ? "Accepted and live on the homepage"
              : "Ready for the showcase?"}
          </h3>
          <p>
            {accepted
              ? "Visitors can explore this startup’s logo, idea, display and team details."
              : "Accept this application to publish its startup profile on the homepage. Contact details and documents stay private."}
          </p>
          <div className="publication-actions">
            {!accepted && (
              <Button
                primary
                type="submit"
                form={formId}
                name="decision"
                value="Approved"
                disabled={busy}
              >
                {" "}
                {busy ? "Saving…" : "Accept & publish"}{" "}
                <CheckCircle2 size={17} />
              </Button>
            )}
            {accepted && (
              <a href="#explore" className="btn btn-primary" onClick={onClose}>
                View homepage <ArrowUpRight size={17} />
              </a>
            )}
            {a.status !== "Rejected" && (
              <Button
                type="submit"
                form={formId}
                name="decision"
                value="Rejected"
                disabled={busy}
              >
                {accepted ? "Remove from homepage" : "Reject application"}
              </Button>
            )}
          </div>
        </div>
      </section>
      <ErrorBox message={error} />
      <SubmissionDownloads kind="applications" id={a.id} />
      <SubmissionDetails record={{ ...a, stall: stall || "Not assigned" }} />
      <form
        id={formId}
        className="review-controls"
        onSubmit={async (e) => {
          e.preventDefault();
          const fields = Object.fromEntries(new FormData(e.currentTarget));
          const decision = e.nativeEvent.submitter?.value || fields.status;
          setBusy(true);
          setError("");
          try {
            await api("/admin/applications/" + a.id, {
              method: "PATCH",
              body: { ...fields, status: decision },
            });
            onSaved(decision);
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <h3>Review & stall assignment</h3>
        <label>
          Application status
          <select name="status" defaultValue={a.status}>
            {["Draft", "Submitted", "Under Review", "Approved", "Rejected"].map(
              (status) => (
                <option key={status} value={status}>
                  {status === "Approved"
                    ? "Accepted — visible on homepage"
                    : status}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          Stall number
          <input
            name="stall"
            defaultValue={stall}
            placeholder="e.g. A-01"
            maxLength={16}
          />
        </label>
        <label>
          Internal notes
          <textarea name="notes" defaultValue={a.notes} rows={4} />
        </label>
        <p className="privacy-note">
          Accepting publishes the startup’s logo, idea, leader and team names,
          college, and display details. Emails, phone numbers, uploaded
          documents, stall requirements and internal notes stay private.
        </p>
        <Button primary disabled={busy} type="submit">
          {busy ? "Saving…" : "Save review"} <Check size={16} />
        </Button>
      </form>
    </Modal>
  );
}

createRoot(document.getElementById("root")).render(<App />);
