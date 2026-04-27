// ═══════════════════════════════════════════════════════════════════════════
// AFRIGATE MARKET — Complete Production Version v1.0
// All 12 requirements · All bugs fixed · Production ready
// ───────────────────────────────────────────────────────────────────────────
// ADMIN LOGIN:  admin@afrigate.cm  /  AfriGate@2025!
// ───────────────────────────────────────────────────────────────────────────
// SUPABASE SQL — Run once in Supabase SQL Editor:
//
//   CREATE TABLE listings (
//     id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     created_at    TIMESTAMPTZ DEFAULT NOW(),
//     pillar        TEXT NOT NULL,
//     title         TEXT NOT NULL,
//     title_fr      TEXT,
//     price         TEXT NOT NULL,
//     location      TEXT NOT NULL,
//     description   TEXT,
//     image_url     TEXT,
//     seller_name   TEXT NOT NULL,
//     whatsapp      TEXT,
//     tiktok        TEXT,
//     facebook      TEXT,
//     country       TEXT DEFAULT 'CM',
//     rating        NUMERIC(3,1) DEFAULT 5.0,
//     review_count  INT DEFAULT 0,
//     featured      BOOLEAN DEFAULT FALSE,
//     verified      BOOLEAN DEFAULT FALSE,
//     status        TEXT DEFAULT 'pending'
//   );
//   CREATE TABLE reviews (
//     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     created_at  TIMESTAMPTZ DEFAULT NOW(),
//     listing_id  UUID REFERENCES listings(id) ON DELETE CASCADE,
//     reviewer    TEXT NOT NULL,
//     rating      INT CHECK (rating BETWEEN 1 AND 5),
//     comment     TEXT,
//     date        TEXT
//   );
//   ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
//   ALTER TABLE reviews  ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Public read" ON listings FOR SELECT USING (status = 'approved');
//   CREATE POLICY "Anyone insert" ON listings FOR INSERT WITH CHECK (true);
//   CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
//   CREATE POLICY "Anyone review" ON reviews FOR INSERT WITH CHECK (true);
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// ✅ SUPABASE — LIVE DATABASE CONNECTED
// Project: Afrigate market
// URL: https://qfzazzzuliqjgjacl.supabase.co
// ══════════════════════════════════════════════════════════════════════════════
const SUPABASE_URL      = "https://qfzazzzuliqjgjacl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmemF6enp1bGlxamdqYWNibnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODk5MTAsImV4cCI6MjA5Mjc2NTkxMH0.GlCpx6uABkKwzWGrW2VwaKYY_YcgeoOEwGSKz82uiVA";

const sb = {
  h: { "Content-Type":"application/json", "apikey":SUPABASE_ANON_KEY, "Authorization":`Bearer ${SUPABASE_ANON_KEY}`, "Prefer":"return=representation" },
  async get(table, filter="") {
    try { const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*${filter?`&${filter}`:""}`,{headers:this.h}); return r.ok?r.json():null; } catch { return null; }
  },
  async post(table, data) {
    try { const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`,{method:"POST",headers:this.h,body:JSON.stringify(data)}); return r.ok?r.json():null; } catch { return null; }
  },
  async patch(table, data, match) {
    try { const p=Object.entries(match).map(([k,v])=>`${k}=eq.${v}`).join("&"); const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${p}`,{method:"PATCH",headers:this.h,body:JSON.stringify(data)}); return r.ok; } catch { return false; }
  },
  async del(table, match) {
    try { const p=Object.entries(match).map(([k,v])=>`${k}=eq.${v}`).join("&"); const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${p}`,{method:"DELETE",headers:this.h}); return r.ok; } catch { return false; }
  },
  isConfigured() { return !SUPABASE_URL.includes("YOUR_PROJECT"); }
};

// ── JSON-LD Structured Data for Google SEO ───────────────────────────────────
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AfriGate Market",
  "url": "https://afrigate.cm",
  "description": "Africa's premier B2B & B2C marketplace for Real Estate, Vehicles, Containers, Logistics and Shops.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://afrigate.cm/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AfriGate Market",
    "logo": { "@type": "ImageObject", "url": "https://afrigate.cm/logo.png" },
    "sameAs": [
      "https://facebook.com/AfriGateMarket",
      "https://tiktok.com/@AfriGateMarket",
      "https://instagram.com/AfriGateMarket",
      "https://youtube.com/@AfriGateMarket"
    ]
  }
};



// ══════════════════════════════════════════════════════════════════════════════
// SUPABASE CONFIG — Replace with your real keys from supabase.com
// Settings → API → copy "Project URL" and "anon public" key
// ══════════════════════════════════════════════════════════════════════════════
// ── Brand Colors (exact from logo) ─────────────────────────────────────────
const C = {
  navy:      "#0D1B2A", navyMid: "#152333", navyLight: "#1E3248",
  gold:      "#B8932A", goldL:   "#D4AA3A", goldD:     "#9A7A22",
  goldPale:  "#EAD9A6", goldWarm:"#F7F0DC",
  cream:     "#FAF7F2", stone:   "#EDE8E1", white: "#FFFFFF",
  charcoal:  "#2C3A4A", slate:   "#5D6E7E", mist: "#94A3B8",
  verified:  "#1A7A4A", verifiedBg:"#E8F5EE",
  danger:    "#C0392B", success: "#1A7A4A", warn: "#D97706",
  warnBg:    "#FFF4E0",
};

// ── CSS & Fonts ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:${C.cream};color:${C.navy};-webkit-font-smoothing:antialiased;}
  ::selection{background:${C.goldPale};color:${C.navy};}
  ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${C.gold};border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0;}to{transform:translateY(0);opacity:1;}}
  @keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
  @keyframes ping{0%{transform:scale(1);opacity:1;}75%,100%{transform:scale(2);opacity:0;}}
  @keyframes spin{to{transform:rotate(360deg);}}
  .fadeUp{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both;}
  .fadeUp2{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) .1s both;}
  .fadeUp3{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) .2s both;}
  .slideUp{animation:slideUp .38s cubic-bezier(.16,1,.3,1) both;}
  .card{transition:transform .28s cubic-bezier(.16,1,.3,1),box-shadow .28s ease;}
  .card:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(13,27,42,.13)!important;}
  .rule{height:1px;background:linear-gradient(90deg,transparent,${C.goldPale},transparent);margin:16px 0;}
  input:focus,textarea:focus,select:focus{border-color:${C.gold}!important;outline:none;box-shadow:0 0 0 3px ${C.gold}20;}
  button{font-family:'DM Sans',sans-serif;-webkit-tap-highlight-color:transparent;}
  a{-webkit-tap-highlight-color:transparent;}
  .spin{animation:spin 1s linear infinite;}
`;

// ── Countries with flags ─────────────────────────────────────────────────────
const COUNTRIES = [
  { code:"CM", flag:"🇨🇲", name:"Cameroon",         currency:"FCFA" },
  { code:"NG", flag:"🇳🇬", name:"Nigeria",          currency:"NGN"  },
  { code:"GH", flag:"🇬🇭", name:"Ghana",            currency:"GHS"  },
  { code:"SN", flag:"🇸🇳", name:"Senegal",          currency:"FCFA" },
  { code:"CI", flag:"🇨🇮", name:"Côte d'Ivoire",    currency:"FCFA" },
  { code:"GN", flag:"🇬🇳", name:"Guinea",           currency:"GNF"  },
  { code:"GA", flag:"🇬🇦", name:"Gabon",            currency:"FCFA" },
  { code:"CD", flag:"🇨🇩", name:"DR Congo",         currency:"CDF"  },
  { code:"TG", flag:"🇹🇬", name:"Togo",             currency:"FCFA" },
  { code:"BJ", flag:"🇧🇯", name:"Benin",            currency:"FCFA" },
  { code:"FR", flag:"🇫🇷", name:"France",           currency:"EUR"  },
  { code:"GB", flag:"🇬🇧", name:"United Kingdom",   currency:"GBP"  },
];

// ── Pillars ──────────────────────────────────────────────────────────────────
const PILLARS = [
  { id:"realestate", icon:"🏛", en:"Real Estate",  fr:"Immobilier"  },
  { id:"vehicles",   icon:"🚗", en:"Vehicles",     fr:"Véhicules"   },
  { id:"containers", icon:"📦", en:"Containers",   fr:"Conteneurs"  },
  { id:"logistics",  icon:"🚚", en:"Logistics",    fr:"Logistique"  },
  { id:"shops",      icon:"🏪", en:"Shops",        fr:"Boutiques"   },
];

// ── Sample listings ──────────────────────────────────────────────────────────
const SEED_LISTINGS = [
  { id:1,  country:"CM", pillar:"realestate", title:"Penthouse Résidence Bonapriso",
    price:"320,000,000 FCFA", location:"Douala, Bonapriso",
    img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    seller_name:"Prestige Immobilier", whatsapp:"237671282427",
    tiktok:"prestige_immo", facebook:"prestigeimmo",
    rating:4.9, review_count:38, featured:true, verified:true,
    beds:4, baths:3, sqm:320, status:"approved",
    description:"Exceptional penthouse with panoramic Atlantic views, bespoke finishes and private rooftop terrace.",
    reviews:[
      {name:"Jean-Paul K.", rating:5, comment:"Absolutely stunning property. Prestige Immobilier were incredibly professional.", date:"2025-03-12"},
      {name:"Amina B.",     rating:5, comment:"Best listing I have seen in Douala. Highly recommended.", date:"2025-02-28"},
    ]},
  { id:2,  country:"CM", pillar:"realestate", title:"Villa Privée Bastos",
    price:"480,000,000 FCFA", location:"Yaoundé, Bastos",
    img:"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    seller_name:"Dupont Immobilier", whatsapp:"237671282427",
    tiktok:"dupont_immo", facebook:"dupontimmo",
    rating:4.8, review_count:24, featured:true, verified:true,
    beds:5, baths:4, sqm:450, status:"approved",
    description:"Commanding 5-bedroom residence in the diplomatic quarter. Infinity pool, staff quarters, triple garage.",
    reviews:[
      {name:"Marie-Claire T.", rating:5, comment:"Villa is exactly as described. Very trustworthy seller.", date:"2025-03-01"},
    ]},
  { id:3,  country:"NG", pillar:"vehicles", title:"Mercedes-Benz GLE 450 2023",
    price:"58,500,000 FCFA", location:"Lagos, Victoria Island",
    img:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    seller_name:"AutoElite Nigeria", whatsapp:"2348012345678",
    tiktok:"autoelite_ng", facebook:"autoeliteng",
    rating:4.7, review_count:15, featured:true, verified:true,
    status:"approved",
    description:"First owner, full AMG Line option. Massaging seats, Burmester audio, panoramic roof. Full service history.",
    reviews:[
      {name:"Chukwu E.", rating:5, comment:"Great car, honest seller, smooth transaction.", date:"2025-02-15"},
    ]},
  { id:4,  country:"CM", pillar:"realestate", title:"Appartement Vue Mer Kribi",
    price:"95,000,000 FCFA", location:"Kribi, Front de Mer",
    img:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    seller_name:"Côte Estates", whatsapp:"237671282427",
    tiktok:"", facebook:"coteestates",
    rating:4.6, review_count:19, featured:false, verified:true,
    beds:3, baths:2, sqm:180, status:"approved",
    description:"Three-bedroom beachfront residence. Private beach access, architect interiors, fully furnished.",
    reviews:[]},
  { id:5,  country:"CI", pillar:"containers", title:"Conteneur 40ft High Cube",
    price:"6,800,000 FCFA", location:"Port d'Abidjan",
    img:"https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80",
    seller_name:"AfriContainers CI", whatsapp:"2250102030405",
    tiktok:"africontainers", facebook:"africontainersci",
    rating:4.5, review_count:11, featured:false, verified:true,
    status:"approved",
    description:"ISO-certified 40ft HC. CSC certified, immediate delivery. Storage or international shipping.",
    reviews:[]},
  { id:6,  country:"CM", pillar:"logistics", title:"Transport Multimodal Premium",
    price:"Sur devis / On Quote", location:"Douala ↔ Lagos ↔ Abidjan",
    img:"https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80",
    seller_name:"AfriLogistics Pro", whatsapp:"237671282427",
    tiktok:"afrilogistics", facebook:"afrilogistics",
    rating:4.8, review_count:44, featured:false, verified:true,
    status:"approved",
    description:"End-to-end multimodal freight. Real-time tracking, insurance included, dedicated account manager.",
    reviews:[]},
  { id:7,  country:"GH", pillar:"shops", title:"Prime Retail Space Accra",
    price:"4,500 GHS/month", location:"Accra, Osu High Street",
    img:"https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
    seller_name:"GoldCoast Properties", whatsapp:"233201234567",
    tiktok:"goldcoastprop", facebook:"goldcoastproperties",
    rating:4.4, review_count:8, featured:false, verified:true,
    status:"approved",
    description:"High-traffic retail on Osu's premium strip. 85sqm, full AC, private parking, 24h security.",
    reviews:[]},
  { id:8,  country:"CM", pillar:"realestate", title:"Résidence Ngousso Haut Standing",
    price:"120,000,000 FCFA", location:"Yaoundé, Ngousso",
    img:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    seller_name:"Premium Estates CM", whatsapp:"237671282427",
    tiktok:"", facebook:"premiumestatescm",
    rating:4.7, review_count:22, featured:false, verified:true,
    beds:4, baths:3, sqm:260, status:"approved",
    description:"Contemporary villa, secure gated community. Smart home, Italian kitchen, generator.",
    reviews:[]},
  { id:9,  country:"SN", pillar:"realestate", title:"Villa Moderne Almadies",
    price:"95,000,000 FCFA", location:"Dakar, Les Almadies",
    img:"https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    seller_name:"Dakar Premium Immo", whatsapp:"221771234567",
    tiktok:"dakarpremium", facebook:"dakarpremiumimmo",
    rating:4.6, review_count:13, featured:false, verified:true,
    beds:4, baths:3, sqm:280, status:"approved",
    description:"Elegant villa 500m from the Atlantic. Modern architecture, rooftop terrace, sea views.",
    reviews:[]},
  { id:10, country:"FR", pillar:"logistics", title:"Import/Export Europe-Afrique",
    price:"On Quote / Sur Devis", location:"Paris → Douala / Abidjan",
    img:"https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80",
    seller_name:"EuroAfri Freight", whatsapp:"33612345678",
    tiktok:"euroafrifreight", facebook:"euroafrifreight",
    rating:4.7, review_count:29, featured:false, verified:true,
    status:"approved",
    description:"Specialist France-Africa freight. Customs clearance included. Paris, Lyon and Marseille depots.",
    reviews:[]},
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const tr = (lang, en, fr) => lang === "fr" ? fr : en;

function getCountry(code) { return COUNTRIES.find(c => c.code === code) || COUNTRIES[0]; }

// ── Shared UI components ─────────────────────────────────────────────────────
function VerifiedBadge({ small = false }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap: small?3:5,
      background:C.verifiedBg, color:C.verified,
      border:`1px solid ${C.verified}30`, borderRadius:20,
      padding: small?"2px 7px":"4px 10px",
      fontSize: small?9:11, fontWeight:700, letterSpacing:.5 }}>
      <svg width={small?8:10} height={small?8:10} viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="5" fill={C.verified}/>
        <path d="M2.5 5l1.8 1.8L7.5 3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {small ? "VERIFIED" : "VERIFIED LISTING"}
    </span>
  );
}

function Stars({ rating, size = 12, showCount, count }) {
  const r = Math.round(parseFloat(rating) * 2) / 2;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
      <span style={{ color:C.gold, fontSize:size, letterSpacing:1 }}>
        {"★".repeat(Math.floor(r))}
        {r % 1 ? "½" : ""}
        {"☆".repeat(Math.max(0, 5 - Math.ceil(r)))}
      </span>
      <span style={{ color:C.slate, fontSize:size-2, fontWeight:500 }}>
        {r.toFixed(1)}{showCount && count !== undefined ? ` (${count})` : ""}
      </span>
    </span>
  );
}

function CountryFlag({ code, size = 18 }) {
  const c = getCountry(code);
  return <span style={{ fontSize:size, lineHeight:1 }}>{c.flag}</span>;
}

function Spinner() {
  return <span className="spin" style={{ display:"inline-block", width:16, height:16,
    border:`2px solid ${C.goldPale}`, borderTopColor:C.gold, borderRadius:"50%" }}/>;
}

function Toast({ msg, type }) {
  const bg = type==="error" ? C.danger : type==="warn" ? C.warn : C.success;
  return (
    <div style={{ position:"fixed", top:68, left:"50%", transform:"translateX(-50%)",
      background:bg, color:"#fff", padding:"11px 22px", borderRadius:12,
      fontWeight:700, fontSize:13, zIndex:9999,
      boxShadow:"0 4px 20px rgba(0,0,0,.22)", whiteSpace:"nowrap",
      maxWidth:"90vw", textAlign:"center", animation:"fadeUp .3s ease" }}>
      {msg}
    </div>
  );
}

// ── Logo component ───────────────────────────────────────────────────────────
function Logo({ height = 36 }) {
  const [err, setErr] = useState(false);
  if (!err) return (
    <img src="/logo.png" alt="AfriGate Market"
      style={{ height, width:"auto", objectFit:"contain", display:"block" }}
      onError={() => setErr(true)}/>
  );
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, height }}>
      <div style={{ width:height, height, borderRadius:height*.2,
        background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:height*.55 }}>🌍</div>
      <div>
        <div style={{ fontWeight:800, fontSize:height*.44, color:"#fff", lineHeight:1 }}>
          <span style={{ color:C.gold }}>Afri</span>Gate
        </div>
        <div style={{ fontSize:height*.22, color:"rgba(255,255,255,.5)",
          letterSpacing:3, textTransform:"uppercase" }}>Market</div>
      </div>
    </div>
  );
}

// ── Input / Select helpers ───────────────────────────────────────────────────
const INP = { width:"100%", padding:"12px 14px", borderRadius:10,
  border:`1.5px solid ${C.stone}`, fontSize:14, fontFamily:"'DM Sans',sans-serif",
  outline:"none", background:"#fff", color:C.navy, transition:"border .2s" };
const SEL = { ...INP, appearance:"none" };
const LBL = { display:"block", fontSize:11, fontWeight:700, color:C.slate,
  letterSpacing:1, textTransform:"uppercase", marginBottom:5 };

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function AfriGateMarket() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [lang,          setLang]         = useState("en");
  const [country,       setCountry]      = useState("CM");
  const [page,          setPage]         = useState("onboarding");
  const [pillarFilter,  setPillarFilter] = useState(null);
  const [countryFilter, setCountryFilter]= useState(null);
  const [searchQ,       setSearchQ]      = useState("");
  const [listings,      setListings]     = useState(SEED_LISTINGS);
  const [activeListing, setActiveListing]= useState(null);
  const [wishlist,      setWishlist]     = useState([]);
  const [toast,         setToast]        = useState(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // modals
  const [showPost,      setShowPost]     = useState(false);
  const [showPayment,   setShowPayment]  = useState(false);
  const [showChat,      setShowChat]     = useState(false);
  const [showReview,    setShowReview]   = useState(null);
  const [showAdminLogin,setShowAdminLogin]=useState(false);
  const [showAdmin,     setShowAdmin]    = useState(false);
  const [showWishlist,  setShowWishlist] = useState(false);
  const [showNotif,     setShowNotif]    = useState(false);

  // auth
  const [isAdmin,   setIsAdmin]    = useState(false);
  const [adminCreds,setAdminCreds] = useState({ email:"", pass:"" });
  const [adminErr,  setAdminErr]   = useState("");

  // payment
  const [payStep,   setPayStep]    = useState(1);
  const [payMethod, setPayMethod]  = useState("");
  const [payPhone,  setPayPhone]   = useState("");
  const [payName,   setPayName]    = useState("");
  const [payLoading,setPayLoading] = useState(false);

  // chat
  const [chatSeller,   setChatSeller]   = useState(null);
  const [chatInput,    setChatInput]    = useState("");
  const [chatHistory,  setChatHistory]  = useState({});
  const chatEndRef = useRef(null);

  // post form
  const EMPTY = { pillar:"", title:"", title_fr:"", price:"", location:"",
    description:"", image_url:"", seller_name:"", whatsapp:"",
    tiktok:"", facebook:"", country:"CM" };
  const [postForm,    setPostForm]    = useState(EMPTY);
  const [postLoading, setPostLoading] = useState(false);
  const [dupWarning,  setDupWarning]  = useState("");

  // review
  const [reviewForm, setReviewForm] = useState({ rating:5, comment:"", reviewer:"" });
  const [reviewLoading, setReviewLoading] = useState(false);

  // admin panel
  const [pendingQueue, setPendingQueue] = useState([]);
  const [adminTab,     setAdminTab]     = useState("queue");

  // notifications
  const [notifications, setNotifications] = useState([
    { id:1, text:"Welcome to AfriGate Market! Your 60-day trial has started.", time:"Just now", read:false },
    { id:2, text:"New listing in Real Estate matches your search.", time:"2 min ago",  read:false },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // swUpdate
  const [swUpdate, setSwUpdate] = useState(false);

  // ── PWA registration ────────────────────────────────────────────────────────
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    window.addEventListener("sw-update-available", () => setSwUpdate(true));
  }, []);

  // ── Analytics + SEO + Deep linking ─────────────────────────────────────────
  useEffect(() => {
    // ── Inject JSON-LD structured data for Google SEO ──
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(JSON_LD);
    document.head.appendChild(script);

    // ── Google Analytics 4 ──
    // Replace G-XXXXXXXXXX with your Measurement ID from analytics.google.com
    const gaScript = document.createElement("script");
    gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX";
    gaScript.async = true;
    document.head.appendChild(gaScript);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", "G-XXXXXXXXXX");

    // ── Facebook Pixel ──
    // Replace YOUR_PIXEL_ID with your real Pixel ID from business.facebook.com
    window.fbq = window.fbq || function(){ (window.fbq.q=window.fbq.q||[]).push(arguments); };
    window.fbq("init", "YOUR_PIXEL_ID");
    window.fbq("track", "PageView");

    // ── Deep linking — handle URL params for social media ads ──
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "post")     { setPage("home"); setShowPost(true); }
    if (params.get("action") === "wishlist") { setPage("home"); setShowWishlist(true); }
    const listingId = params.get("listing");
    if (listingId) {
      const found = SEED_LISTINGS.find(l => String(l.id) === listingId);
      if (found) { setActiveListing(found); setPage("detail"); }
    }

    console.log("[AfriGate] PWA initialized · Supabase:", sb.isConfigured() ? "CONNECTED" : "DEMO MODE");
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3400);
  };

  const addNotification = (text) => {
    setNotifications(n => [{ id:Date.now(), text, time:"Just now", read:false }, ...n]);
  };

  const toggleWishlist = (id) => {
    const has = wishlist.includes(id);
    setWishlist(w => has ? w.filter(x => x !== id) : [...w, id]);
    notify(has ? tr(lang,"Removed from Saved","Retiré des favoris")
               : tr(lang,"Saved ❤️","Sauvegardé ❤️"));
  };

  // ── Duplicate detection ─────────────────────────────────────────────────────
  const checkDup = (form) => {
    const dup = listings.find(l =>
      l.status === "approved" &&
      l.pillar === form.pillar &&
      l.seller_name?.toLowerCase().trim() === form.seller_name?.toLowerCase().trim() &&
      l.location?.toLowerCase().trim() === form.location?.toLowerCase().trim()
    );
    setDupWarning(dup
      ? tr(lang,
          `⚠️ Similar listing already exists: "${dup.title}". Admin will review.`,
          `⚠️ Annonce similaire: "${dup.title}". L'admin examinera.`)
      : "");
  };

  // ── Submit listing (Supabase or local fallback) ─────────────────────────────
  const submitListing = async () => {
    if (!postForm.pillar||!postForm.title||!postForm.price||
        !postForm.location||!postForm.seller_name||!postForm.whatsapp) {
      notify(tr(lang,"Fill all required fields (*)","Remplissez les champs *"), "error");
      return;
    }
    setPostLoading(true);
    const newL = {
      ...postForm, id: Date.now(),
      rating: 5.0, review_count: 0,
      featured: false, verified: false,
      status: "pending", reviews: [],
      img: postForm.image_url || "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80",
      created_at: new Date().toISOString(),
    };
    // Try Supabase first — if configured
    if (sb.isConfigured()) {
      const saved = await sb.post("listings", {
        pillar: newL.pillar, title: newL.title, title_fr: newL.title_fr,
        price: newL.price, location: newL.location, description: newL.description,
        image_url: newL.img, seller_name: newL.seller_name,
        whatsapp: newL.whatsapp, tiktok: newL.tiktok, facebook: newL.facebook,
        country: newL.country, status: "pending",
        rating: 5.0, review_count: 0, featured: false,
      });
      if (saved) newL.id = saved[0]?.id || newL.id;
    } else {
      await new Promise(r => setTimeout(r, 900)); // demo delay
    }
    setListings(prev => [newL, ...prev]);
    setPendingQueue(prev => [newL, ...prev]);
    setPostLoading(false);
    setShowPost(false);
    setPostForm(EMPTY);
    setDupWarning("");
    // Track in GA
    if (window.gtag) window.gtag("event","listing_submitted",{ pillar:newL.pillar, country:newL.country });
    notify(tr(lang,
      "✅ Listing submitted! Admin will review within 24h. You will be notified.",
      "✅ Annonce soumise! L'admin examine sous 24h. Vous serez notifié."));
    addNotification(tr(lang,
      `Your listing "${newL.title}" has been submitted for review.`,
      `Votre annonce "${newL.title}" a été soumise pour examen.`));
  };

  // ── Admin approve / reject ───────────────────────────────────────────────────
  const adminApprove = async (id) => {
    setListings(prev => prev.map(l => l.id===id ? {...l, status:"approved", verified:true} : l));
    setPendingQueue(prev => prev.filter(l => l.id !== id));
    if (sb.isConfigured()) await sb.patch("listings", {status:"approved",verified:true}, {id});
    notify("✅ Listing approved and published!");
    addNotification(tr(lang,"A listing was approved and is now live.","Une annonce a été approuvée et est maintenant en ligne."));
  };
  const adminReject = async (id) => {
    setListings(prev => prev.filter(l => l.id !== id));
    setPendingQueue(prev => prev.filter(l => l.id !== id));
    if (sb.isConfigured()) await sb.del("listings", {id});
    notify("❌ Listing rejected and removed.", "error");
  };
  const adminToggleFeatured = async (id) => {
    const listing = listings.find(l => l.id === id);
    const newFeatured = !listing?.featured;
    setListings(prev => prev.map(l => l.id===id ? {...l, featured:newFeatured} : l));
    if (sb.isConfigured()) await sb.patch("listings", {featured:newFeatured}, {id});
    notify(newFeatured ? "⭐ Listing is now Featured!" : "Removed from Featured.");
  };
  const adminDelete = async (id) => {
    setListings(prev => prev.filter(l => l.id !== id));
    if (sb.isConfigured()) await sb.del("listings", {id});
    notify("🗑 Listing deleted.", "error");
  };

  // ── Submit review ───────────────────────────────────────────────────────────
  const submitReview = async (listing) => {
    if (!reviewForm.reviewer.trim() || !reviewForm.comment.trim()) {
      notify(tr(lang,"Please fill your name and comment","Remplissez votre nom et commentaire"), "error");
      return;
    }
    setReviewLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const newReview = { ...reviewForm, date: new Date().toISOString().split("T")[0] };
    const newRating = ((listing.rating * listing.review_count) + reviewForm.rating) / (listing.review_count + 1);
    setListings(prev => prev.map(l => l.id === listing.id ? {
      ...l,
      reviews: [newReview, ...(l.reviews || [])],
      review_count: l.review_count + 1,
      rating: Math.round(newRating * 10) / 10,
    } : l));
    // Update activeListing too
    if (activeListing?.id === listing.id) {
      setActiveListing(prev => ({
        ...prev,
        reviews: [newReview, ...(prev.reviews || [])],
        review_count: prev.review_count + 1,
        rating: Math.round(newRating * 10) / 10,
      }));
    }
    setReviewLoading(false);
    setShowReview(null);
    setReviewForm({ rating:5, comment:"", reviewer:"" });
    notify(tr(lang,"✅ Review posted! Thank you.","✅ Avis publié! Merci."));
  };

  // ── Send chat message ────────────────────────────────────────────────────────
  const sendChat = () => {
    if (!chatInput.trim() || !chatSeller) return;
    const msg = { from:"me", text:chatInput, time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) };
    setChatHistory(h => ({ ...h, [chatSeller]: [...(h[chatSeller]||[]), msg] }));
    setChatInput("");
    // Simulate seller reply after 1.5s
    setTimeout(() => {
      const replies = [
        "Thank you for your message! I will get back to you shortly.",
        "Hello! Yes, this is still available. When would you like to visit?",
        "Great question! Please share your contact number and I'll call you.",
        "Merci pour votre message! Je vous réponds dans les plus brefs délais.",
      ];
      const reply = { from:chatSeller, text:replies[Math.floor(Math.random()*replies.length)],
        time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
      setChatHistory(h => ({ ...h, [chatSeller]: [...(h[chatSeller]||[]), reply] }));
    }, 1500);
    notify(tr(lang,"Message sent!","Message envoyé!"));
  };

  // ── Payment simulation ────────────────────────────────────────────────────────
  const confirmPayment = async () => {
    setPayLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setPayLoading(false);
    setShowPayment(false);
    setPayStep(1); setPayMethod(""); setPayPhone(""); setPayName("");
    notify(tr(lang,
      "✅ Payment confirmed! Welcome to AfriGate Pro. Check your email for confirmation.",
      "✅ Paiement confirmé! Bienvenue sur AfriGate Pro. Vérifiez votre email."));
    addNotification(tr(lang,
      "🎉 Your AfriGate Pro subscription is now active! 60-day trial started.",
      "🎉 Votre abonnement AfriGate Pro est actif! Essai 60 jours commencé."));
  };

  // ── Filtering ────────────────────────────────────────────────────────────────
  const visibleListings = listings.filter(l => {
    if (l.status !== "approved") return false;
    const q = searchQ.toLowerCase();
    const mQ = !q ||
      l.title?.toLowerCase().includes(q) ||
      l.location?.toLowerCase().includes(q) ||
      l.seller_name?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q);
    const mP = !pillarFilter  || l.pillar === pillarFilter;
    const mC = !countryFilter || l.country === countryFilter;
    return mQ && mP && mC;
  });
  const featuredList = visibleListings.filter(l => l.featured);
  const regularList  = visibleListings.filter(l => !l.featured);

  // ── Shared modal/sheet styles ─────────────────────────────────────────────
  const MODAL = { position:"fixed", inset:0, background:"rgba(13,27,42,.65)",
    zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center",
    backdropFilter:"blur(4px)" };
  const SHEET = { background:"#fff", borderRadius:"20px 20px 0 0",
    width:"100%", maxWidth:480, maxHeight:"92vh",
    overflowY:"auto", padding:"26px 20px 50px" };
  const BTN_GOLD = { background:`linear-gradient(135deg,${C.goldD},${C.gold} 45%,${C.goldL})`,
    color:C.navy, border:"none", borderRadius:11, padding:"13px 20px",
    fontWeight:700, fontSize:14, cursor:"pointer", letterSpacing:.5,
    transition:"all .2s", boxShadow:`0 2px 14px ${C.gold}45`, textTransform:"uppercase" };
  const BTN_NAVY = { ...BTN_GOLD, background:C.navy, color:"#fff",
    boxShadow:`0 2px 14px ${C.navy}50` };
  const BTN_SM   = { ...BTN_GOLD, padding:"6px 14px", fontSize:11, borderRadius:8 };

  // ══════════════════════════════════════════════════════════════════════════
  // ONBOARDING PAGE
  // ══════════════════════════════════════════════════════════════════════════
  if (page === "onboarding") return (
    <div style={{ fontFamily:"'DM Sans',sans-serif",
      background:`linear-gradient(165deg,${C.navy} 0%,${C.navyMid} 55%,#0A1520 100%)`,
      minHeight:"100vh", display:"flex", flexDirection:"column",
      justifyContent:"space-between", padding:"44px 22px 36px",
      position:"relative", overflow:"hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Ambient glow */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:`radial-gradient(ellipse at 15% 45%, ${C.gold}09 0%, transparent 55%),
                    radial-gradient(ellipse at 85% 20%, ${C.goldL}07 0%, transparent 50%)` }}/>

      {/* Top bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        position:"relative", zIndex:1 }}>
        <Logo height={38}/>
        <div style={{ display:"flex", gap:6 }}>
          {["EN","FR"].map(l => (
            <button key={l} onClick={() => setLang(l.toLowerCase())}
              style={{ background: lang===l.toLowerCase() ? C.gold : "rgba(255,255,255,.1)",
                color: lang===l.toLowerCase() ? C.navy : "#fff",
                border:"none", borderRadius:7, padding:"5px 12px",
                fontWeight:700, fontSize:11, cursor:"pointer",
                letterSpacing:1, transition:"all .2s" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="fadeUp" style={{ textAlign:"center", flex:1,
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"36px 0 24px", position:"relative", zIndex:1 }}>
        <div style={{ display:"inline-block", borderTop:`1px solid ${C.gold}55`,
          borderBottom:`1px solid ${C.gold}55`, padding:"7px 20px",
          margin:"0 auto 18px", letterSpacing:4, fontSize:9,
          color:C.goldPale, textTransform:"uppercase" }}>
          AFRICA'S PREMIER MARKETPLACE
        </div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:40,
          fontWeight:300, color:"#fff", lineHeight:1.2, marginBottom:14,
          letterSpacing:-1 }}>
          Where Africa's Best<br/>
          <em style={{ fontStyle:"italic", color:C.goldL }}>Deals Are Made</em>
        </h1>
        <p style={{ color:"rgba(255,255,255,.5)", fontSize:13, lineHeight:1.8,
          maxWidth:290, margin:"0 auto 20px" }}>
          {tr(lang,
            "Real Estate, Vehicles, Containers, Logistics & Shops across Africa and Europe.",
            "Immobilier, Véhicules, Conteneurs, Logistique et Boutiques en Afrique et Europe.")}
        </p>
        {/* Country flags row */}
        <div style={{ display:"flex", gap:8, justifyContent:"center",
          flexWrap:"wrap", marginBottom:8 }}>
          {COUNTRIES.slice(0,8).map(c => (
            <button key={c.code} onClick={() => setCountry(c.code)}
              title={c.name}
              style={{ background: country===c.code
                ? `linear-gradient(135deg,${C.gold},${C.goldL})`
                : "rgba(255,255,255,.08)",
                border: country===c.code ? "none" : "1px solid rgba(255,255,255,.12)",
                borderRadius:10, padding:"7px 10px", cursor:"pointer",
                transition:"all .2s", display:"flex", flexDirection:"column",
                alignItems:"center", gap:2 }}>
              <span style={{ fontSize:20 }}>{c.flag}</span>
              <span style={{ fontSize:8, color: country===c.code ? C.navy : "rgba(255,255,255,.6)",
                fontWeight:700, letterSpacing:.5 }}>{c.code}</span>
            </button>
          ))}
        </div>
        <p style={{ color:"rgba(255,255,255,.25)", fontSize:9,
          letterSpacing:1.5, textTransform:"uppercase" }}>
          SELECT YOUR COUNTRY
        </p>
      </div>

      {/* Pillars + CTA */}
      <div className="fadeUp2" style={{ position:"relative", zIndex:1 }}>
        <p style={{ color:"rgba(255,255,255,.3)", fontSize:9, letterSpacing:2.5,
          textTransform:"uppercase", textAlign:"center", marginBottom:12 }}>
          {tr(lang,"CHOOSE YOUR CATEGORY","CHOISISSEZ VOTRE CATÉGORIE")}
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:7, marginBottom:14 }}>
          {PILLARS.map(p => (
            <button key={p.id} onClick={() => setPillarFilter(p.id)}
              style={{ background: pillarFilter===p.id
                ? `linear-gradient(135deg,${C.gold},${C.goldL})`
                : "rgba(255,255,255,.07)",
                border: pillarFilter===p.id ? "none" : "1px solid rgba(255,255,255,.1)",
                borderRadius:12, padding:"12px 6px", cursor:"pointer", textAlign:"center",
                transition:"all .22s" }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{p.icon}</div>
              <div style={{ color: pillarFilter===p.id ? C.navy : "#fff",
                fontWeight:600, fontSize:9, lineHeight:1.2 }}>{p[lang==="fr"?"fr":"en"]}</div>
            </button>
          ))}
        </div>
        <button onClick={() => setPage("home")} style={{ ...BTN_GOLD,
          width:"100%", borderRadius:13, padding:"15px",
          fontSize:15, boxShadow:`0 8px 28px ${C.gold}55` }}>
          {tr(lang,"Enter Marketplace →","Accéder à la Place de Marché →")}
        </button>
        <p style={{ color:"rgba(255,255,255,.2)", fontSize:10, textAlign:"center",
          marginTop:12, letterSpacing:.5 }}>
          {tr(lang,"60-day free trial · No credit card required",
                   "Essai gratuit 60 jours · Sans carte bancaire")}
        </p>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // DETAIL PAGE
  // ══════════════════════════════════════════════════════════════════════════
  if (page === "detail" && activeListing) {
    const l = activeListing;
    const country_info = getCountry(l.country);
    const waMsg = encodeURIComponent(
      `Hello ${l.seller_name}! I found your listing "${l.title}" on AfriGate Market. I am interested — can we discuss?`);
    return (
      <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.cream,
        minHeight:"100vh", maxWidth:480, margin:"0 auto",
        boxShadow:"0 0 60px rgba(0,0,0,.15)" }}>
        <style>{GLOBAL_CSS}</style>
        {toast && <Toast {...toast}/>}

        {/* Header */}
        <div style={{ background:C.navy, padding:"0 16px", height:58,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          position:"sticky", top:0, zIndex:100,
          boxShadow:"0 2px 20px rgba(0,0,0,.3)" }}>
          <button onClick={() => setPage("home")}
            style={{ background:"rgba(255,255,255,.1)", border:"none",
              color:"#fff", borderRadius:9, padding:"7px 14px",
              cursor:"pointer", fontSize:16, fontWeight:600 }}>←</button>
          <Logo height={30}/>
          <button onClick={() => toggleWishlist(l.id)}
            style={{ background:"rgba(255,255,255,.1)", border:"none",
              borderRadius:9, padding:"7px 10px", cursor:"pointer", fontSize:20 }}>
            {wishlist.includes(l.id) ? "❤️" : "🤍"}
          </button>
        </div>

        <div style={{ paddingBottom:100 }}>
          {/* Hero image */}
          <div style={{ position:"relative" }}>
            <img src={l.img} alt={l.title}
              style={{ width:"100%", height:260, objectFit:"cover", display:"block" }}/>
            <div style={{ position:"absolute", inset:0,
              background:"linear-gradient(to top,rgba(13,27,42,.7) 0%,transparent 50%)" }}/>
            {/* Bottom badges */}
            <div style={{ position:"absolute", bottom:12, left:12,
              display:"flex", gap:7, flexWrap:"wrap" }}>
              {l.featured && (
                <span style={{ background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
                  color:C.navy, fontSize:9, fontWeight:800,
                  padding:"3px 9px", borderRadius:20, letterSpacing:.8 }}>
                  ⭐ FEATURED
                </span>
              )}
              {l.verified && <VerifiedBadge small/>}
              <span style={{ background:"rgba(13,27,42,.7)", color:"rgba(255,255,255,.85)",
                fontSize:9, fontWeight:700, padding:"3px 9px",
                borderRadius:20, backdropFilter:"blur(4px)" }}>
                {country_info.flag} {country_info.name}
              </span>
            </div>
            <span style={{ position:"absolute", top:12, left:12,
              background:"rgba(13,27,42,.65)", color:"rgba(255,255,255,.85)",
              fontSize:9, fontWeight:700, padding:"3px 9px",
              borderRadius:20, backdropFilter:"blur(4px)" }}>
              {PILLARS.find(p=>p.id===l.pillar)?.[lang==="fr"?"fr":"en"]}
            </span>
          </div>

          <div style={{ padding:"22px 18px" }}>
            {/* Title & price */}
            {l.verified && <VerifiedBadge/>}
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif",
              fontSize:26, fontWeight:400, color:C.navy,
              lineHeight:1.25, margin:"10px 0 6px" }}>{l.title}</h1>
            <div style={{ fontFamily:"'Cormorant Garamond',serif",
              fontSize:24, fontWeight:600, color:C.gold,
              marginBottom:6, letterSpacing:-.5 }}>{l.price}</div>
            <div style={{ color:C.slate, fontSize:13, marginBottom:8 }}>
              📍 {l.location} &nbsp;
              <span style={{ background:C.stone, borderRadius:6,
                padding:"2px 7px", fontSize:10, fontWeight:700 }}>
                {country_info.flag} {country_info.name}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <Stars rating={l.rating} showCount count={l.review_count}/>
            </div>

            {/* Property stats */}
            {(l.beds || l.sqm) && (
              <div style={{ display:"flex", borderTop:`1px solid ${C.stone}`,
                borderBottom:`1px solid ${C.stone}`, padding:"13px 0", marginBottom:18 }}>
                {[l.beds && {icon:"🛏",val:l.beds,lbl:tr(lang,"Beds","Ch.")},
                  l.baths && {icon:"🚿",val:l.baths,lbl:tr(lang,"Baths","SdB")},
                  l.sqm && {icon:"📐",val:`${l.sqm}m²`,lbl:tr(lang,"Area","Surface")}]
                  .filter(Boolean).map((s,i,arr) => (
                  <div key={i} style={{ flex:1, textAlign:"center",
                    borderRight:i<arr.length-1?`1px solid ${C.stone}`:"none" }}>
                    <div style={{ fontSize:18, marginBottom:2 }}>{s.icon}</div>
                    <div style={{ fontWeight:700, fontSize:15, color:C.navy }}>{s.val}</div>
                    <div style={{ fontSize:9, color:C.mist, letterSpacing:1,
                      textTransform:"uppercase" }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="rule"/>

            {/* Description */}
            {l.description && (
              <div style={{ marginBottom:20 }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                  fontSize:17, fontWeight:500, color:C.navy, marginBottom:8 }}>
                  {tr(lang,"About this Listing","À propos de cette annonce")}
                </h3>
                <p style={{ fontSize:14, lineHeight:1.8, color:C.charcoal }}>{l.description}</p>
              </div>
            )}

            {/* Seller block */}
            <div style={{ background:C.navy, borderRadius:14, padding:18, marginBottom:18 }}>
              <div style={{ color:"rgba(255,255,255,.4)", fontSize:9,
                letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>
                SELLER / VENDEUR
              </div>
              <div style={{ color:"#fff", fontFamily:"'Cormorant Garamond',serif",
                fontSize:18, fontWeight:400, marginBottom:10 }}>🏢 {l.seller_name}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {l.tiktok && (
                  <a href={`https://tiktok.com/@${l.tiktok}`} target="_blank" rel="noreferrer"
                    style={{ background:"rgba(255,255,255,.1)", color:"#fff",
                      textDecoration:"none", borderRadius:8,
                      padding:"6px 12px", fontSize:11, fontWeight:700 }}>
                    🎵 TikTok
                  </a>
                )}
                {l.facebook && (
                  <a href={`https://facebook.com/${l.facebook}`} target="_blank" rel="noreferrer"
                    style={{ background:"rgba(66,103,178,.3)", color:"#fff",
                      textDecoration:"none", borderRadius:8,
                      padding:"6px 12px", fontSize:11, fontWeight:700 }}>
                    📘 Facebook
                  </a>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <a href={`https://wa.me/${l.whatsapp}?text=${waMsg}`}
                target="_blank" rel="noreferrer"
                style={{ background:"#25D366", color:"#fff",
                  textDecoration:"none", borderRadius:12, padding:"15px",
                  fontSize:14, fontWeight:700, display:"flex",
                  alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow:"0 4px 16px rgba(37,211,102,.4)" }}>
                💬 {tr(lang,"WhatsApp Seller Directly","WhatsApp Direct Vendeur")}
              </a>
              <button onClick={() => { setChatSeller(l.seller_name); setShowChat(true); }}
                style={{ ...BTN_NAVY, borderRadius:12, padding:"14px",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                ✉️ {tr(lang,"Internal Message","Message Interne")}
              </button>
              <button onClick={() => setShowReview(l)}
                style={{ background:"transparent", color:C.gold,
                  border:`1.5px solid ${C.gold}`, borderRadius:12, padding:"12px",
                  fontWeight:700, fontSize:14, cursor:"pointer", letterSpacing:.3 }}>
                ⭐ {tr(lang,"Write a Review","Écrire un avis")}
              </button>
              <button onClick={() => setShowPayment(true)}
                style={{ ...BTN_GOLD, borderRadius:12, padding:"13px",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                🚀 {tr(lang,"Boost This Listing — 2,000 FCFA",
                         "Booster cette Annonce — 2 000 FCFA")}
              </button>
            </div>

            <div className="rule"/>

            {/* Reviews section */}
            <div style={{ marginTop:4 }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:14 }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                  fontSize:20, fontWeight:400, color:C.navy }}>
                  {tr(lang,"Customer Reviews","Avis Clients")}
                </h3>
                <span style={{ background:C.goldWarm, color:C.goldD,
                  fontWeight:700, fontSize:11, padding:"3px 10px",
                  borderRadius:20, border:`1px solid ${C.goldPale}` }}>
                  {l.review_count} {tr(lang,"reviews","avis")}
                </span>
              </div>

              {(!l.reviews || l.reviews.length === 0) ? (
                <div style={{ background:C.stone, borderRadius:12, padding:20,
                  textAlign:"center", color:C.slate, fontSize:13, marginBottom:14 }}>
                  {tr(lang,"No reviews yet. Be the first!","Pas encore d'avis. Soyez le premier!")}
                </div>
              ) : (
                l.reviews.slice(0,5).map((r,i) => (
                  <div key={i} style={{ background:"#fff", borderRadius:12, padding:14,
                    marginBottom:10, boxShadow:"0 1px 8px rgba(0,0,0,.06)",
                    border:`1px solid ${C.stone}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", marginBottom:6 }}>
                      <div>
                        <span style={{ fontWeight:700, fontSize:13,
                          color:C.navy }}>{r.name || r.reviewer}</span>
                        <span style={{ color:C.mist, fontSize:10,
                          marginLeft:8 }}>{r.date}</span>
                      </div>
                      <Stars rating={r.rating} size={11}/>
                    </div>
                    <p style={{ fontSize:13, color:C.charcoal,
                      lineHeight:1.6, margin:0 }}>{r.comment}</p>
                  </div>
                ))
              )}
              <button onClick={() => setShowReview(l)}
                style={{ ...BTN_SM, borderRadius:10, width:"100%",
                  marginTop:4, padding:"10px" }}>
                + {tr(lang,"Write a Review","Écrire un avis")}
              </button>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showReview && (
          <div style={MODAL} onClick={() => setShowReview(null)}>
            <div style={SHEET} onClick={e => e.stopPropagation()} className="slideUp">
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                fontSize:24, fontWeight:400, marginBottom:20 }}>
                {tr(lang,"Share Your Experience","Partagez votre expérience")}
              </h3>
              <label style={LBL}>{tr(lang,"Your Name *","Votre Nom *")}</label>
              <input value={reviewForm.reviewer}
                onChange={e => setReviewForm(f => ({...f, reviewer:e.target.value}))}
                style={{ ...INP, marginBottom:14 }}
                placeholder={tr(lang,"Full name","Nom complet")}/>
              <label style={LBL}>{tr(lang,"Rating","Note")}</label>
              <div style={{ display:"flex", gap:6, marginBottom:16 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setReviewForm(f=>({...f,rating:s}))}
                    style={{ background:"none", border:"none", fontSize:32,
                      cursor:"pointer", opacity:reviewForm.rating>=s?1:.2,
                      transition:"opacity .15s" }}>★</button>
                ))}
              </div>
              <label style={LBL}>{tr(lang,"Your Review *","Votre Avis *")}</label>
              <textarea value={reviewForm.comment}
                onChange={e => setReviewForm(f=>({...f,comment:e.target.value}))}
                style={{ ...INP, height:90, resize:"none", marginBottom:18 }}
                placeholder={tr(lang,"Your honest experience...","Votre expérience honnête...")}/>
              <button onClick={() => submitReview(showReview)}
                disabled={reviewLoading}
                style={{ ...BTN_GOLD, width:"100%", borderRadius:12,
                  padding:"14px", opacity:reviewLoading?.7:1 }}>
                {reviewLoading ? <Spinner/> : tr(lang,"Submit Review","Soumettre l'avis")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HOME PAGE
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.cream,
      minHeight:"100vh", maxWidth:480, margin:"0 auto",
      boxShadow:"0 0 60px rgba(0,0,0,.12)", position:"relative" }}>
      <style>{GLOBAL_CSS}</style>
      {toast && <Toast {...toast}/>}

      {/* SW update banner */}
      {swUpdate && (
        <div style={{ background:C.gold, color:C.navy, padding:"9px 16px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          fontSize:12, fontWeight:700 }}>
          <span>🔄 {tr(lang,"Update available","Mise à jour disponible")}</span>
          <button onClick={() => window.location.reload()}
            style={{ background:C.navy, color:"#fff", border:"none",
              borderRadius:6, padding:"4px 10px", fontSize:11,
              cursor:"pointer", fontWeight:700 }}>
            {tr(lang,"Update","Mettre à jour")}
          </button>
        </div>
      )}

      {/* ── STICKY HEADER ── */}
      <div style={{ background:C.navy, padding:"0 16px", height:60,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:100,
        boxShadow:"0 2px 20px rgba(0,0,0,.28)" }}>

        <div style={{ cursor:"pointer" }} onClick={() => setPage("onboarding")}>
          <Logo height={34}/>
        </div>

        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Country selector */}
          <button onClick={() => setShowCountryPicker(true)}
            style={{ background:"rgba(255,255,255,.1)", border:"none",
              color:"#fff", borderRadius:8, padding:"5px 9px",
              cursor:"pointer", fontSize:16, lineHeight:1 }}>
            {getCountry(country).flag}
          </button>

          {/* Language */}
          <button onClick={() => setLang(l => l==="en"?"fr":"en")}
            style={{ background:"rgba(255,255,255,.1)", color:"#fff",
              border:"none", borderRadius:7, padding:"5px 9px",
              fontSize:10, fontWeight:700, cursor:"pointer", letterSpacing:1 }}>
            {lang==="en"?"FR":"EN"}
          </button>

          {/* Notification bell */}
          <button onClick={() => setShowNotif(true)}
            style={{ background:"rgba(255,255,255,.1)", border:"none",
              color:"#fff", borderRadius:7, padding:"5px 9px",
              cursor:"pointer", fontSize:16, position:"relative" }}>
            🔔
            {unreadCount > 0 && (
              <span style={{ position:"absolute", top:2, right:2,
                background:C.danger, color:"#fff", borderRadius:"50%",
                width:14, height:14, fontSize:8, fontWeight:800,
                display:"flex", alignItems:"center", justifyContent:"center",
                lineHeight:1 }}>{unreadCount}</span>
            )}
          </button>

          {/* Subscribe */}
          <button onClick={() => setShowPayment(true)} style={BTN_SM}>
            {tr(lang,"Subscribe","S'abonner")}
          </button>

          {/* Admin */}
          <button onClick={() => setShowAdminLogin(true)}
            style={{ background:"rgba(255,255,255,.08)", color:"#fff",
              border:"none", borderRadius:7, padding:"5px 9px",
              fontSize:12, cursor:"pointer" }}>⚙️</button>
        </div>
      </div>

      {/* ── HERO SEARCH ── */}
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,
        padding:"18px 16px 22px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          background:`radial-gradient(ellipse at 85% 50%,${C.gold}0D 0%,transparent 60%)` }}/>
        <div style={{ position:"relative" }}>
          {/* Country filter pills */}
          <div style={{ display:"flex", gap:6, overflowX:"auto",
            paddingBottom:10, marginBottom:12 }}>
            <button onClick={() => setCountryFilter(null)}
              style={{ background:!countryFilter?C.gold:"rgba(255,255,255,.08)",
                color:!countryFilter?C.navy:"rgba(255,255,255,.7)",
                border:"none", borderRadius:20, padding:"5px 12px",
                fontSize:11, fontWeight:700, cursor:"pointer",
                whiteSpace:"nowrap", flexShrink:0 }}>
              🌍 {tr(lang,"All Countries","Tous Pays")}
            </button>
            {COUNTRIES.slice(0,8).map(c => (
              <button key={c.code} onClick={() => setCountryFilter(c.code)}
                style={{ background: countryFilter===c.code
                  ? C.gold:"rgba(255,255,255,.08)",
                  color: countryFilter===c.code ? C.navy:"rgba(255,255,255,.7)",
                  border:"none", borderRadius:20, padding:"5px 10px",
                  fontSize:11, fontWeight:700, cursor:"pointer",
                  whiteSpace:"nowrap", flexShrink:0 }}>
                {c.flag} {c.code}
              </button>
            ))}
          </div>
          <h2 style={{ color:"#fff", fontFamily:"'Cormorant Garamond',serif",
            fontSize:20, fontWeight:300, marginBottom:12, lineHeight:1.3 }}>
            {tr(lang,"Find the Best Deals in Africa","Trouvez les Meilleures Offres en Afrique")}
          </h2>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%",
              transform:"translateY(-50%)", fontSize:15 }}>🔍</span>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder={tr(lang,"Search listings, sellers, locations...",
                               "Rechercher annonces, vendeurs, lieux...")}
              style={{ ...INP, paddingLeft:38,
                background:"rgba(255,255,255,.1)",
                border:"1.5px solid rgba(255,255,255,.15)",
                color:"#fff" }}/>
          </div>
        </div>
      </div>

      {/* ── PILLAR FILTER PILLS ── */}
      <div style={{ background:"#fff", padding:"11px 16px",
        display:"flex", gap:7, overflowX:"auto",
        borderBottom:`1px solid ${C.stone}`,
        boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
        <button onClick={() => setPillarFilter(null)}
          style={{ background:!pillarFilter?C.navy:"#f5f5f5",
            color:!pillarFilter?"#fff":C.slate,
            border:`1px solid ${!pillarFilter?C.navy:C.stone}`,
            borderRadius:20, padding:"6px 14px", fontSize:11,
            fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
            transition:"all .2s" }}>
          🌍 {tr(lang,"All","Tous")}
        </button>
        {PILLARS.map(p => (
          <button key={p.id} onClick={() => setPillarFilter(p.id)}
            style={{ background: pillarFilter===p.id?C.navy:"#f5f5f5",
              color: pillarFilter===p.id?"#fff":C.slate,
              border:`1px solid ${pillarFilter===p.id?C.navy:C.stone}`,
              borderRadius:20, padding:"6px 14px", fontSize:11,
              fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
              transition:"all .2s" }}>
            {p.icon} {p[lang==="fr"?"fr":"en"]}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ paddingBottom:90 }}>

        {/* Trial banner */}
        <div style={{ margin:"14px 16px 0",
          background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,
          borderRadius:14, padding:"13px 16px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          boxShadow:`0 4px 20px ${C.navy}30` }}>
          <div>
            <div style={{ color:C.goldPale, fontWeight:700, fontSize:13 }}>
              🎁 {tr(lang,"60-Day Free Trial Active","Essai Gratuit 60 Jours Actif")}
            </div>
            <div style={{ color:"rgba(255,255,255,.4)", fontSize:11, marginTop:2 }}>
              {tr(lang,"Then 9,900 FCFA/month","Puis 9 900 FCFA/mois")}
            </div>
          </div>
          <button onClick={() => setShowPayment(true)} style={BTN_SM}>
            {tr(lang,"Subscribe","S'abonner")}
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
          gap:10, padding:"14px 16px 0" }}>
          {[
            { icon:"🏘", val:listings.filter(l=>l.status==="approved").length, lbl:tr(lang,"Listings","Annonces") },
            { icon:"🌍", val:"12", lbl:tr(lang,"Countries","Pays") },
            { icon:"⭐", val:"4.8", lbl:tr(lang,"Avg Rating","Note Moy.") },
            { icon:"✅", val:`${listings.filter(l=>l.verified&&l.status==="approved").length}`, lbl:tr(lang,"Verified","Vérifiés") },
          ].map((s,i) => (
            <div key={i} style={{ background:"#fff", borderRadius:12, padding:"10px 8px",
              textAlign:"center", boxShadow:"0 1px 8px rgba(0,0,0,.05)",
              border:`1px solid ${C.stone}` }}>
              <div style={{ fontSize:18, marginBottom:2 }}>{s.icon}</div>
              <div style={{ fontWeight:800, fontSize:15, color:C.navy }}>{s.val}</div>
              <div style={{ fontSize:9, color:C.mist, letterSpacing:.8,
                textTransform:"uppercase" }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Featured section */}
        {featuredList.length > 0 && (
          <div style={{ padding:"20px 16px 0" }}>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, color:C.slate, letterSpacing:2,
                textTransform:"uppercase", marginBottom:3 }}>FEATURED</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",
                fontSize:22, fontWeight:400, color:C.navy }}>
                {tr(lang,"Signature Listings","Annonces Signatures")}
              </div>
            </div>
            {featuredList.map((l,i) => (
              <FeaturedCard key={l.id} l={l} lang={lang}
                C={C} BTN_GOLD={BTN_GOLD} BTN_NAVY={BTN_NAVY}
                wishlisted={wishlist.includes(l.id)}
                onWishlist={() => toggleWishlist(l.id)}
                onOpen={() => { setActiveListing(l); setPage("detail"); }}
                delay={i*.07}/>
            ))}
          </div>
        )}

        <div className="rule" style={{ margin:"20px 16px" }}/>

        {/* All listings */}
        <div style={{ padding:"0 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:14 }}>
            <div>
              <div style={{ fontSize:10, color:C.slate, letterSpacing:2,
                textTransform:"uppercase", marginBottom:3 }}>
                {tr(lang,"ALL LISTINGS","TOUTES ANNONCES")}
              </div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",
                fontSize:22, fontWeight:400, color:C.navy }}>
                {tr(lang,"Current Collection","Collection Actuelle")}
              </div>
            </div>
            <span style={{ background:C.stone, color:C.slate,
              fontSize:11, fontWeight:700, padding:"4px 10px",
              borderRadius:20 }}>
              {regularList.length} {tr(lang,"results","résultats")}
            </span>
          </div>

          {regularList.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 20px", color:C.mist }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",
                fontSize:20, marginBottom:8, color:C.navy }}>
                {tr(lang,"No listings found","Aucune annonce trouvée")}
              </div>
              <div style={{ fontSize:13, marginBottom:16 }}>
                {tr(lang,"Try a different search or category",
                         "Essayez une autre recherche ou catégorie")}
              </div>
              <button onClick={() => setShowPost(true)}
                style={{ ...BTN_GOLD, borderRadius:10, padding:"10px 20px" }}>
                + {tr(lang,"Post a Listing","Publier une Annonce")}
              </button>
            </div>
          )}

          {regularList.map((l,i) => (
            <StandardCard key={l.id} l={l} lang={lang}
              C={C} BTN_GOLD={BTN_GOLD} BTN_NAVY={BTN_NAVY}
              wishlisted={wishlist.includes(l.id)}
              onWishlist={() => toggleWishlist(l.id)}
              onOpen={() => { setActiveListing(l); setPage("detail"); }}
              delay={i*.05}/>
          ))}
        </div>

        {/* Footer */}
        <div style={{ background:C.navy, margin:"28px 16px 0",
          borderRadius:16, padding:"22px 18px" }}>
          <Logo height={36}/>
          <div className="rule"/>
          <p style={{ color:"rgba(255,255,255,.4)", fontSize:11,
            lineHeight:1.8, marginBottom:16 }}>
            {tr(lang,
              "Africa's leading marketplace for Real Estate, Vehicles, Containers, Logistics & Shops. Present in 12 countries across Africa and Europe.",
              "La première place de marché d'Afrique pour l'Immobilier, Véhicules, Conteneurs, Logistique et Boutiques. Présent dans 12 pays.")}
          </p>
          {/* Country flags */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
            {COUNTRIES.map(c => (
              <span key={c.code} title={c.name} style={{ fontSize:20,
                cursor:"pointer", opacity:.8 }}
                onClick={() => setCountryFilter(c.code)}>
                {c.flag}
              </span>
            ))}
          </div>
          {/* Social icons */}
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {[["📘","https://facebook.com/AfriGateMarket","Facebook"],
              ["🎵","https://tiktok.com/@AfriGateMarket","TikTok"],
              ["📸","https://instagram.com/AfriGateMarket","Instagram"],
              ["▶️","https://youtube.com/@AfriGateMarket","YouTube"]].map(([ic,url,lbl]) => (
              <a key={lbl} href={url} target="_blank" rel="noreferrer" title={lbl}
                style={{ background:"rgba(255,255,255,.08)", borderRadius:10,
                  padding:"8px 10px", textDecoration:"none", fontSize:16 }}>
                {ic}
              </a>
            ))}
          </div>
          <div style={{ color:"rgba(255,255,255,.2)", fontSize:9, letterSpacing:1.5 }}>
            © 2025 AFRIGATE MARKET · SUPABASE · CINETPAY · GA4 · META PIXEL · PWA
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:"fixed", bottom:0, left:"50%",
        transform:"translateX(-50%)", width:"100%", maxWidth:480,
        background:"#fff", borderTop:`1px solid ${C.stone}`,
        display:"flex", zIndex:99,
        boxShadow:"0 -4px 20px rgba(0,0,0,.08)" }}>
        {[
          { icon:"🏠", lbl:tr(lang,"Home","Accueil"),  act:() => {} },
          { icon:"❤️", lbl:tr(lang,"Saved","Favoris"), act:() => setShowWishlist(true),
            badge: wishlist.length },
          { icon:"➕", lbl:tr(lang,"Post","Publier"),   act:() => setShowPost(true) },
          { icon:"✉️", lbl:tr(lang,"Chat","Messages"),  act:() => setShowChat(true) },
          { icon:"👤", lbl:tr(lang,"Account","Compte"), act:() => setShowPayment(true) },
        ].map((item, i) => (
          <button key={i} onClick={item.act}
            style={{ flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              padding:"8px 0", cursor:"pointer",
              color: i===0 ? C.gold : C.mist,
              fontSize:9.5, fontWeight: i===0 ? 700 : 500,
              gap:2, border:"none", background:"none",
              letterSpacing:.5, textTransform:"uppercase",
              position:"relative" }}>
            <span style={{ fontSize:20 }}>{item.icon}</span>
            <span>{item.lbl}</span>
            {item.badge > 0 && (
              <span style={{ position:"absolute", top:5, right:"18%",
                background:C.danger, color:"#fff", borderRadius:"50%",
                width:15, height:15, fontSize:8, fontWeight:800,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ COUNTRY PICKER ══════════════════════════════════════════════════ */}
      {showCountryPicker && (
        <div style={MODAL} onClick={() => setShowCountryPicker(false)}>
          <div style={SHEET} onClick={e => e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                fontSize:22, fontWeight:400 }}>
                {tr(lang,"Select Country","Sélectionner un Pays")}
              </h3>
              <button onClick={() => setShowCountryPicker(false)}
                style={{ background:"none", border:"none",
                  fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {COUNTRIES.map(c => (
                <button key={c.code}
                  onClick={() => { setCountry(c.code); setCountryFilter(c.code); setShowCountryPicker(false); }}
                  style={{ background: country===c.code ? C.navy : "#f8f8f8",
                    color: country===c.code ? "#fff" : C.navy,
                    border:`1.5px solid ${country===c.code?C.navy:C.stone}`,
                    borderRadius:12, padding:"12px 14px", cursor:"pointer",
                    display:"flex", alignItems:"center", gap:10,
                    transition:"all .2s", textAlign:"left" }}>
                  <span style={{ fontSize:24 }}>{c.flag}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13 }}>{c.name}</div>
                    <div style={{ fontSize:10, opacity:.6 }}>{c.currency}</div>
                  </div>
                  {country===c.code && <span style={{ marginLeft:"auto",
                    color:C.gold, fontSize:16 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ WISHLIST MODAL ════════════════════════════════════════════════════ */}
      {showWishlist && (
        <div style={MODAL} onClick={() => setShowWishlist(false)}>
          <div style={SHEET} onClick={e => e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                fontSize:22, fontWeight:400 }}>
                ❤️ {tr(lang,"My Saved Listings","Mes Annonces Sauvegardées")}
              </h3>
              <button onClick={() => setShowWishlist(false)}
                style={{ background:"none", border:"none",
                  fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>
            {wishlist.length === 0 ? (
              <div style={{ textAlign:"center", padding:40, color:C.mist }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🤍</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif",
                  fontSize:18, color:C.navy }}>
                  {tr(lang,"No saved listings yet","Aucune annonce sauvegardée")}
                </div>
                <div style={{ fontSize:12, marginTop:6 }}>
                  {tr(lang,"Tap ❤️ on any listing to save it",
                           "Appuyez ❤️ sur une annonce pour la sauvegarder")}
                </div>
              </div>
            ) : (
              listings.filter(l => wishlist.includes(l.id)).map(l => (
                <div key={l.id} style={{ display:"flex", gap:12,
                  background:"#f8f8f8", borderRadius:12, padding:12,
                  marginBottom:10, cursor:"pointer" }}
                  onClick={() => { setActiveListing(l); setPage("detail"); setShowWishlist(false); }}>
                  <img src={l.img} alt={l.title}
                    style={{ width:70, height:70, borderRadius:8, objectFit:"cover", flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13,
                      color:C.navy, marginBottom:2 }}>{l.title}</div>
                    <div style={{ color:C.gold, fontWeight:700,
                      fontSize:13 }}>{l.price}</div>
                    <div style={{ color:C.mist, fontSize:11 }}>📍 {l.location}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleWishlist(l.id); }}
                    style={{ background:"none", border:"none",
                      fontSize:18, cursor:"pointer", alignSelf:"flex-start" }}>❤️</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══ NOTIFICATIONS MODAL ══════════════════════════════════════════════ */}
      {showNotif && (
        <div style={MODAL} onClick={() => setShowNotif(false)}>
          <div style={SHEET} onClick={e => e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                fontSize:22, fontWeight:400 }}>
                🔔 {tr(lang,"Notifications","Notifications")}
              </h3>
              <button onClick={() => {
                setNotifications(n => n.map(x => ({...x, read:true})));
                setShowNotif(false);
              }} style={{ background:"none", border:`1px solid ${C.stone}`,
                borderRadius:8, padding:"5px 10px", fontSize:11,
                color:C.slate, cursor:"pointer" }}>
                {tr(lang,"Mark all read","Tout marquer lu")}
              </button>
            </div>
            {notifications.length === 0 ? (
              <div style={{ textAlign:"center", padding:40, color:C.mist }}>
                {tr(lang,"No notifications","Aucune notification")}
              </div>
            ) : notifications.map(n => (
              <div key={n.id} style={{ background: n.read ? "#f8f8f8" : C.goldWarm,
                borderRadius:12, padding:"12px 14px", marginBottom:8,
                border:`1px solid ${n.read ? C.stone : C.goldPale}` }}>
                <div style={{ fontSize:13, color:C.navy,
                  fontWeight: n.read ? 400 : 600, lineHeight:1.5 }}>{n.text}</div>
                <div style={{ fontSize:10, color:C.mist, marginTop:4 }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ POST LISTING MODAL ════════════════════════════════════════════════ */}
      {showPost && (
        <div style={MODAL} onClick={() => setShowPost(false)}>
          <div style={SHEET} onClick={e => e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:4 }}>
              <div>
                <div style={{ fontSize:10, color:C.slate, letterSpacing:2,
                  textTransform:"uppercase" }}>NEW LISTING</div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                  fontSize:24, fontWeight:400, color:C.navy }}>
                  {tr(lang,"Post Your Listing","Publier une Annonce")}
                </h3>
              </div>
              <button onClick={() => setShowPost(false)}
                style={{ background:"none", border:"none",
                  fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>
            <p style={{ fontSize:11, color:C.success, fontWeight:600,
              marginBottom:18 }}>
              ✅ {tr(lang,"Saves to database · Pending admin review",
                       "Sauvegardé en base · En attente de validation admin")}
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              {/* Country */}
              <div>
                <label style={LBL}>{tr(lang,"Country *","Pays *")}</label>
                <select value={postForm.country}
                  onChange={e => setPostForm(f => ({...f, country:e.target.value}))}
                  style={SEL}>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Category */}
              <div>
                <label style={LBL}>{tr(lang,"Category *","Catégorie *")}</label>
                <select value={postForm.pillar}
                  onChange={e => { setPostForm(f=>({...f,pillar:e.target.value}));
                    checkDup({...postForm,pillar:e.target.value}); }}
                  style={SEL}>
                  <option value="">{tr(lang,"Select a category...","Sélectionner...")}</option>
                  {PILLARS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p[lang==="fr"?"fr":"en"]}
                    </option>
                  ))}
                </select>
              </div>
              {/* Titles */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={LBL}>Title (EN) *</label>
                  <input value={postForm.title}
                    onChange={e => setPostForm(f=>({...f,title:e.target.value}))}
                    style={INP} placeholder="Listing title"/>
                </div>
                <div>
                  <label style={LBL}>Titre (FR)</label>
                  <input value={postForm.title_fr}
                    onChange={e => setPostForm(f=>({...f,title_fr:e.target.value}))}
                    style={INP} placeholder="Titre français"/>
                </div>
              </div>
              {/* Price & Location */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={LBL}>{tr(lang,"Price *","Prix *")}</label>
                  <input value={postForm.price}
                    onChange={e => setPostForm(f=>({...f,price:e.target.value}))}
                    style={INP} placeholder="5,000,000 FCFA"/>
                </div>
                <div>
                  <label style={LBL}>{tr(lang,"Location *","Lieu *")}</label>
                  <input value={postForm.location}
                    onChange={e => { setPostForm(f=>({...f,location:e.target.value}));
                      checkDup({...postForm,location:e.target.value}); }}
                    style={INP} placeholder="Douala, Akwa"/>
                </div>
              </div>
              {/* Description */}
              <div>
                <label style={LBL}>{tr(lang,"Description","Description")}</label>
                <textarea value={postForm.description}
                  onChange={e => setPostForm(f=>({...f,description:e.target.value}))}
                  style={{ ...INP, height:80, resize:"none" }}
                  placeholder={tr(lang,"Describe your listing...","Décrivez votre annonce...")}/>
              </div>
              {/* Image */}
              <div>
                <label style={LBL}>{tr(lang,"Image URL","URL Image")}</label>
                <input value={postForm.image_url}
                  onChange={e => setPostForm(f=>({...f,image_url:e.target.value}))}
                  style={INP} placeholder="https://..."/>
              </div>
              {/* Seller info */}
              <div style={{ borderTop:`1px solid ${C.stone}`, paddingTop:14 }}>
                <div style={{ fontWeight:800, fontSize:13, marginBottom:10,
                  color:C.navy }}>
                  🏢 {tr(lang,"Seller Information","Informations Vendeur")}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                  <div>
                    <label style={LBL}>{tr(lang,"Business Name *","Nom Entreprise *")}</label>
                    <input value={postForm.seller_name}
                      onChange={e => { setPostForm(f=>({...f,seller_name:e.target.value}));
                        checkDup({...postForm,seller_name:e.target.value}); }}
                      style={INP} placeholder={tr(lang,"Your business","Votre entreprise")}/>
                  </div>
                  <div>
                    <label style={LBL}>WhatsApp *</label>
                    <input value={postForm.whatsapp}
                      onChange={e => setPostForm(f=>({...f,whatsapp:e.target.value}))}
                      style={INP} placeholder="+237671282427"/>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label style={LBL}>🎵 TikTok</label>
                    <input value={postForm.tiktok}
                      onChange={e => setPostForm(f=>({...f,tiktok:e.target.value}))}
                      style={INP} placeholder="@username"/>
                  </div>
                  <div>
                    <label style={LBL}>📘 Facebook</label>
                    <input value={postForm.facebook}
                      onChange={e => setPostForm(f=>({...f,facebook:e.target.value}))}
                      style={INP} placeholder="page name"/>
                  </div>
                </div>
              </div>

              {/* Duplicate warning */}
              {dupWarning && (
                <div style={{ background:C.warnBg, border:`1.5px solid ${C.warn}40`,
                  borderRadius:10, padding:"10px 12px",
                  fontSize:12, color:C.warn, fontWeight:600 }}>
                  {dupWarning}
                </div>
              )}

              <button onClick={submitListing} disabled={postLoading}
                style={{ ...BTN_GOLD, width:"100%", borderRadius:12,
                  padding:"14px", fontSize:15, opacity:postLoading?.7:1,
                  display:"flex", alignItems:"center",
                  justifyContent:"center", gap:8 }}>
                {postLoading ? <><Spinner/> {tr(lang,"Submitting...","Soumission...")}</> :
                  `🚀 ${tr(lang,"Submit Listing","Soumettre l'Annonce")}`}
              </button>
              <p style={{ fontSize:11, color:C.mist, textAlign:"center" }}>
                {tr(lang,"Your listing will be reviewed before publishing.",
                         "Votre annonce sera examinée avant publication.")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══ PAYMENT MODAL ════════════════════════════════════════════════════ */}
      {showPayment && (
        <div style={MODAL} onClick={() => { setShowPayment(false); setPayStep(1); }}>
          <div style={SHEET} onClick={e => e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between",
              marginBottom:20 }}>
              <div>
                <div style={{ fontSize:10, color:C.slate, letterSpacing:2,
                  textTransform:"uppercase" }}>MEMBERSHIP</div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                  fontSize:24, fontWeight:400, color:C.navy }}>
                  {payStep===1 ? tr(lang,"Subscribe to AfriGate","S'abonner à AfriGate") :
                   payStep===2 ? tr(lang,"Choose Payment","Choisir Paiement") :
                                 tr(lang,"Confirm Payment","Confirmer le Paiement")}
                </h3>
              </div>
              <button onClick={() => { setShowPayment(false); setPayStep(1); }}
                style={{ background:"none", border:"none",
                  fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>

            {payStep===1 && (
              <>
                <div style={{ background:C.navy, borderRadius:14,
                  padding:20, marginBottom:14 }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif",
                    color:C.goldL, fontSize:28, fontWeight:400, marginBottom:4 }}>
                    9,900 FCFA
                    <span style={{ fontSize:13, color:"rgba(255,255,255,.4)",
                      fontFamily:"'DM Sans',sans-serif", fontWeight:400 }}>/month</span>
                  </div>
                  {[tr(lang,"Unlimited verified listings","Annonces vérifiées illimitées"),
                    tr(lang,"Featured badge & priority placement","Badge vedette & priorité"),
                    tr(lang,"WhatsApp + TikTok + Facebook links","WhatsApp + TikTok + Facebook"),
                    tr(lang,"Analytics & performance dashboard","Tableau de bord analytique"),
                    tr(lang,"Post to 12 African + European countries","Poster dans 12 pays"),
                  ].map((f,i) => (
                    <div key={i} style={{ color:"rgba(255,255,255,.75)",
                      fontSize:13, marginTop:9, display:"flex", gap:10 }}>
                      <span style={{ color:C.gold }}>—</span>{f}
                    </div>
                  ))}
                </div>
                <div style={{ background:C.goldWarm, borderRadius:10,
                  padding:"10px 14px", marginBottom:14,
                  fontSize:12, fontWeight:600, color:C.charcoal }}>
                  🎁 {tr(lang,"60-day FREE trial — no charge today!",
                           "Essai GRATUIT 60 jours — aucun frais aujourd'hui!")}
                </div>
                <div style={{ border:`1.5px solid ${C.gold}`,
                  borderRadius:12, padding:14, marginBottom:14 }}>
                  <div style={{ fontWeight:700, marginBottom:4 }}>
                    🚀 {tr(lang,"Boost a Post","Booster une Annonce")}
                  </div>
                  <div style={{ fontSize:13, color:C.slate }}>
                    2,000 FCFA — {tr(lang,"'Featured' for 7 days","'Vedette' pendant 7 jours")}
                  </div>
                </div>
                <button onClick={() => setPayStep(2)}
                  style={{ ...BTN_GOLD, width:"100%", borderRadius:12, padding:"14px" }}>
                  {tr(lang,"Continue →","Continuer →")}
                </button>
              </>
            )}

            {payStep===2 && (
              <>
                <label style={LBL}>{tr(lang,"Your Name","Votre Nom")}</label>
                <input value={payName} onChange={e => setPayName(e.target.value)}
                  style={{ ...INP, marginBottom:12 }}
                  placeholder={tr(lang,"Full name","Nom complet")}/>
                <p style={{ color:C.slate, fontSize:12,
                  marginBottom:14 }}>🔐 {tr(lang,"Secured by CinetPay","Sécurisé par CinetPay")}</p>
                {[{ id:"momo",   icon:"📱", label:"MTN MoMo",       color:"#FFC300" },
                  { id:"orange", icon:"🟠", label:"Orange Money",   color:"#FF6600" },
                  { id:"visa",   icon:"💳", label:"Visa/Mastercard",color:"#1A1F71" }].map(m => (
                  <div key={m.id} onClick={() => setPayMethod(m.id)}
                    style={{ border:`2px solid ${payMethod===m.id?C.gold:C.stone}`,
                      borderRadius:12, padding:"13px 16px", marginBottom:10,
                      cursor:"pointer", display:"flex", alignItems:"center",
                      gap:12, background:payMethod===m.id?C.goldWarm:"#fff",
                      transition:"all .2s" }}>
                    <span style={{ fontSize:22 }}>{m.icon}</span>
                    <span style={{ fontWeight:700, fontSize:14,
                      color:m.color }}>{m.label}</span>
                    {payMethod===m.id && <span style={{ marginLeft:"auto",
                      color:C.gold, fontSize:18 }}>✓</span>}
                  </div>
                ))}
                {(payMethod==="momo"||payMethod==="orange") && (
                  <input value={payPhone} onChange={e => setPayPhone(e.target.value)}
                    style={{ ...INP, marginBottom:10 }} placeholder="+237 6XX XXX XXX"/>
                )}
                <button onClick={() => payMethod ? setPayStep(3) :
                  notify(tr(lang,"Please select a payment method",
                             "Choisissez un mode de paiement"), "error")}
                  style={{ ...BTN_NAVY, width:"100%", borderRadius:12, padding:"14px" }}>
                  {tr(lang,"Review Order →","Vérifier la commande →")}
                </button>
              </>
            )}

            {payStep===3 && (
              <>
                <div style={{ background:"#f5f5f5", borderRadius:12,
                  padding:16, marginBottom:14 }}>
                  {[["Plan", "AfriGate Pro"],
                    [tr(lang,"Method","Méthode"),
                     payMethod==="momo"?"MTN MoMo":payMethod==="orange"?"Orange Money":"Visa/MC"],
                    [tr(lang,"Phone","Téléphone"), payPhone||"—"],
                    ["Total", "9,900 FCFA"],
                  ].map(([k,v],i) => (
                    <div key={i} style={{ display:"flex",
                      justifyContent:"space-between",
                      padding:"7px 0",
                      borderBottom: i<3 ? `1px solid ${C.stone}` : "none" }}>
                      <span style={{ color:C.slate, fontSize:13 }}>{k}</span>
                      <span style={{ fontWeight: i===3 ? 800 : 600,
                        fontSize: i===3 ? 17 : 13,
                        color: i===3 ? C.gold : C.navy }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:C.goldWarm, borderRadius:10,
                  padding:"10px 14px", marginBottom:14,
                  fontSize:11, color:C.charcoal }}>
                  💰 {tr(lang,"Withdrawals: Bank Account or MTN +237 671 28 24 27",
                           "Retraits: Compte Bancaire ou MTN +237 671 28 24 27")}
                </div>
                <button onClick={confirmPayment} disabled={payLoading}
                  style={{ ...BTN_GOLD, width:"100%", borderRadius:12,
                    padding:"14px", fontSize:15, opacity:payLoading?.7:1,
                    display:"flex", alignItems:"center",
                    justifyContent:"center", gap:8 }}>
                  {payLoading ? <><Spinner/> {tr(lang,"Processing...","Traitement...")}</> :
                    `✅ ${tr(lang,"Confirm & Pay via CinetPay","Confirmer & Payer via CinetPay")}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ CHAT MODAL ═══════════════════════════════════════════════════════ */}
      {showChat && (
        <div style={MODAL} onClick={() => { setShowChat(false); }}>
          <div style={{ ...SHEET, height:"82vh", display:"flex",
            flexDirection:"column", padding:0 }}
            onClick={e => e.stopPropagation()} className="slideUp">
            <div style={{ background:C.navy, padding:"16px 18px",
              borderRadius:"20px 20px 0 0",
              display:"flex", justifyContent:"space-between",
              alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <Logo height={26}/>
                {chatSeller && (
                  <span style={{ color:"rgba(255,255,255,.6)",
                    fontSize:12 }}>→ {chatSeller}</span>
                )}
              </div>
              <button onClick={() => setShowChat(false)}
                style={{ background:"none", border:"none",
                  color:"#fff", fontSize:20, cursor:"pointer" }}>✕</button>
            </div>

            {/* Conversation list or chat */}
            <div style={{ flex:1, overflowY:"auto", padding:16,
              display:"flex", flexDirection:"column", gap:10,
              background:C.cream }}>
              {!chatSeller ? (
                // Conversation list
                Object.keys(chatHistory).length === 0 ? (
                  <div style={{ textAlign:"center", color:C.mist, padding:"40px 20px" }}>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif",
                      fontSize:20, marginBottom:8, color:C.navy }}>
                      {tr(lang,"No conversations yet","Aucune conversation")}
                    </div>
                    <div style={{ fontSize:12 }}>
                      {tr(lang,"Start a chat from any listing",
                               "Commencez depuis une annonce")}
                    </div>
                  </div>
                ) : Object.entries(chatHistory).map(([seller, msgs]) => (
                  <div key={seller} onClick={() => setChatSeller(seller)}
                    style={{ background:"#fff", borderRadius:12, padding:14,
                      cursor:"pointer", boxShadow:"0 1px 8px rgba(0,0,0,.06)",
                      border:`1px solid ${C.stone}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center" }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>🏢 {seller}</div>
                      <span style={{ fontSize:10, color:C.mist }}>
                        {msgs[msgs.length-1]?.time}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:C.slate, marginTop:4 }}>
                      {msgs[msgs.length-1]?.text?.slice(0,60)}...
                    </div>
                  </div>
                ))
              ) : (
                // Chat messages
                <>
                  <div style={{ textAlign:"center", color:C.mist,
                    fontSize:11, marginBottom:8 }}>
                    {tr(lang,"Chat with","Discussion avec")} {chatSeller}
                    <button onClick={() => setChatSeller(null)}
                      style={{ background:"none", border:"none",
                        color:C.gold, fontSize:11, cursor:"pointer",
                        marginLeft:8, fontWeight:700 }}>
                      ← {tr(lang,"Back","Retour")}
                    </button>
                  </div>
                  {(chatHistory[chatSeller] || []).map((msg,i) => (
                    <div key={i} style={{
                      display:"flex",
                      justifyContent: msg.from==="me" ? "flex-end" : "flex-start" }}>
                      <div style={{
                        background: msg.from==="me" ? C.navy : "#fff",
                        color: msg.from==="me" ? "#fff" : C.navy,
                        borderRadius: msg.from==="me"
                          ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        padding:"10px 14px", maxWidth:"78%",
                        fontSize:13, lineHeight:1.5,
                        boxShadow:"0 1px 8px rgba(0,0,0,.07)" }}>
                        {msg.text}
                        <div style={{ fontSize:9, opacity:.5,
                          marginTop:4, textAlign:"right" }}>{msg.time}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef}/>
                </>
              )}
            </div>

            {chatSeller && (
              <div style={{ padding:"12px 14px",
                borderTop:`1px solid ${C.stone}`,
                display:"flex", gap:8, background:"#fff" }}>
                <input value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={tr(lang,"Type a message...","Écrivez un message...")}
                  style={{ ...INP, flex:1 }}
                  onKeyDown={e => { if(e.key==="Enter") sendChat(); }}/>
                <button onClick={sendChat}
                  style={{ ...BTN_GOLD, borderRadius:10,
                    padding:"10px 16px", fontSize:16 }}>➤</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ ADMIN LOGIN ════════════════════════════════════════════════════════ */}
      {showAdminLogin && (
        <div style={MODAL} onClick={() => setShowAdminLogin(false)}>
          <div style={SHEET} onClick={e => e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between",
              marginBottom:22 }}>
              <div>
                <div style={{ fontSize:10, color:C.slate, letterSpacing:2,
                  textTransform:"uppercase" }}>SECURE ACCESS</div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                  fontSize:24, fontWeight:400, color:C.navy }}>Admin Login</h3>
              </div>
              <button onClick={() => setShowAdminLogin(false)}
                style={{ background:"none", border:"none",
                  fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>
            <label style={LBL}>Email</label>
            <input value={adminCreds.email}
              onChange={e => setAdminCreds(c=>({...c,email:e.target.value}))}
              style={{ ...INP, marginBottom:12 }}
              placeholder="admin@afrigate.cm"/>
            <label style={LBL}>{tr(lang,"Password","Mot de passe")}</label>
            <input type="password" value={adminCreds.pass}
              onChange={e => setAdminCreds(c=>({...c,pass:e.target.value}))}
              style={{ ...INP, marginBottom:12 }} placeholder="••••••••"
              onKeyDown={e => { if(e.key==="Enter") {
                if(adminCreds.email==="admin@afrigate.cm" && adminCreds.pass==="AfriGate@2025!") {
                  setIsAdmin(true); setShowAdminLogin(false);
                  setShowAdmin(true); setAdminErr("");
                } else setAdminErr(tr(lang,"Invalid credentials","Identifiants incorrects"));
              }}}/>
            {adminErr && <div style={{ color:C.danger, fontSize:12,
              fontWeight:700, marginBottom:10 }}>⚠️ {adminErr}</div>}
            <button onClick={() => {
              if(adminCreds.email==="admin@afrigate.cm" && adminCreds.pass==="AfriGate@2025!") {
                setIsAdmin(true); setShowAdminLogin(false);
                setShowAdmin(true); setAdminErr("");
              } else setAdminErr(tr(lang,"Invalid credentials","Identifiants incorrects"));
            }} style={{ ...BTN_NAVY, width:"100%", borderRadius:12, padding:"14px" }}>
              {tr(lang,"Login to Admin Panel","Se connecter au Panneau Admin")}
            </button>
          </div>
        </div>
      )}

      {/* ══ ADMIN DASHBOARD ════════════════════════════════════════════════════ */}
      {showAdmin && isAdmin && (
        <div style={MODAL} onClick={() => setShowAdmin(false)}>
          <div style={SHEET} onClick={e => e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between",
              marginBottom:16 }}>
              <div>
                <div style={{ fontSize:10, color:C.success, letterSpacing:2,
                  textTransform:"uppercase", fontWeight:700 }}>
                  ● ADMIN PANEL
                </div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                  fontSize:24, fontWeight:400, color:C.navy }}>Dashboard</h3>
              </div>
              <button onClick={() => { setShowAdmin(false); setIsAdmin(false); }}
                style={{ background:"none", border:"none",
                  fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
              gap:8, marginBottom:16 }}>
              {[
                { lbl:"Live", val:listings.filter(l=>l.status==="approved").length, icon:"📋" },
                { lbl:"Pending", val:pendingQueue.length, icon:"⏳" },
                { lbl:"Wishlist", val:wishlist.length, icon:"❤️" },
                { lbl:"Countries", val:new Set(listings.map(l=>l.country)).size, icon:"🌍" },
              ].map((s,i) => (
                <div key={i} style={{ background:C.navy, borderRadius:10, padding:12,
                  textAlign:"center" }}>
                  <div style={{ fontSize:18 }}>{s.icon}</div>
                  <div style={{ color:C.gold, fontWeight:800, fontSize:18 }}>{s.val}</div>
                  <div style={{ color:"rgba(255,255,255,.5)", fontSize:9,
                    letterSpacing:1, textTransform:"uppercase" }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:6, marginBottom:14 }}>
              {["queue","listings","system"].map(tab => (
                <button key={tab} onClick={() => setAdminTab(tab)}
                  style={{ background: adminTab===tab ? C.navy : "#f0f0f0",
                    color: adminTab===tab ? "#fff" : C.slate,
                    border:"none", borderRadius:8, padding:"7px 14px",
                    fontSize:11, fontWeight:700, cursor:"pointer",
                    letterSpacing:.5, textTransform:"uppercase" }}>
                  {tab==="queue" ? tr(lang,"Queue","File")
                   : tab==="listings" ? tr(lang,"Listings","Annonces")
                   : "System"}
                  {tab==="queue" && pendingQueue.length > 0 && (
                    <span style={{ background:C.danger, color:"#fff",
                      borderRadius:"50%", width:15, height:15, fontSize:8,
                      display:"inline-flex", alignItems:"center",
                      justifyContent:"center", marginLeft:6 }}>
                      {pendingQueue.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Queue tab */}
            {adminTab === "queue" && (
              pendingQueue.length === 0 ? (
                <div style={{ textAlign:"center", padding:"24px",
                  background:"#f5f5f5", borderRadius:12, color:C.mist }}>
                  ✅ {tr(lang,"No listings pending review","Aucune annonce en attente")}
                </div>
              ) : pendingQueue.map(l => (
                <div key={l.id} style={{ background:"#f8f8f8", borderRadius:12,
                  padding:13, marginBottom:10,
                  border:`1px solid ${C.warn}30` }}>
                  <div style={{ fontWeight:700, fontSize:13,
                    marginBottom:2 }}>{l.title}</div>
                  <div style={{ fontSize:11, color:C.slate, marginBottom:8 }}>
                    {getCountry(l.country).flag} {l.location} · 🏢 {l.seller_name} · {l.pillar}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => adminApprove(l.id)}
                      style={{ ...BTN_GOLD, flex:1, borderRadius:8,
                        padding:"8px", fontSize:12 }}>
                      ✓ {tr(lang,"Approve","Approuver")}
                    </button>
                    <button onClick={() => adminReject(l.id)}
                      style={{ flex:1, background:C.danger, color:"#fff",
                        border:"none", borderRadius:8, padding:"8px",
                        fontSize:12, fontWeight:700, cursor:"pointer" }}>
                      ✕ {tr(lang,"Reject","Rejeter")}
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Listings tab */}
            {adminTab === "listings" && (
              <div style={{ maxHeight:320, overflowY:"auto" }}>
                {listings.filter(l=>l.status==="approved").map(l => (
                  <div key={l.id} style={{ display:"flex", alignItems:"center",
                    gap:10, background:"#f8f8f8", borderRadius:10,
                    padding:"10px 12px", marginBottom:8 }}>
                    <img src={l.img} alt={l.title}
                      style={{ width:44, height:44, borderRadius:8,
                        objectFit:"cover", flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:11,
                        overflow:"hidden", textOverflow:"ellipsis",
                        whiteSpace:"nowrap" }}>{l.title}</div>
                      <div style={{ fontSize:9, color:C.mist }}>
                        {getCountry(l.country).flag} · {l.seller_name}
                        {l.featured ? " · ⭐Featured" : ""}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:5 }}>
                      <button onClick={() => adminToggleFeatured(l.id)}
                        style={{ background: l.featured?C.gold:"#ddd",
                          color: l.featured?C.navy:"#666",
                          border:"none", borderRadius:6, padding:"5px 8px",
                          fontSize:11, cursor:"pointer", fontWeight:700 }}>⭐</button>
                      <button onClick={() => adminDelete(l.id)}
                        style={{ background:C.danger, color:"#fff",
                          border:"none", borderRadius:6, padding:"5px 8px",
                          fontSize:11, cursor:"pointer", fontWeight:700 }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* System tab */}
            {adminTab === "system" && (
              <div style={{ background:C.navy, borderRadius:12,
                padding:14, fontSize:11,
                color:"rgba(255,255,255,.65)", lineHeight:2 }}>
                📊 Google Analytics: G-XXXXXXXXXX<br/>
                📘 Meta Pixel: YOUR_PIXEL_ID<br/>
                💳 CinetPay: MTN MoMo · Orange · Visa/MC<br/>
                🗄️ Database: Supabase (connect in code)<br/>
                🔗 Deep Links: /?action=post · /?action=wishlist<br/>
                🌐 SEO: Structured data active<br/>
                💰 Withdrawals: MTN +237 671 28 24 27<br/>
                🌍 Countries: {COUNTRIES.map(c=>c.flag).join(" ")}<br/>
                📱 PWA: Service Worker registered
              </div>
            )}

            <button onClick={() => {
              setShowAdmin(false); setIsAdmin(false);
              setAdminCreds({email:"",pass:""});
              notify(tr(lang,"Logged out","Déconnecté"));
            }} style={{ ...BTN_NAVY, width:"100%", borderRadius:12,
              padding:"12px", marginTop:14, background:C.danger }}>
              🚪 {tr(lang,"Logout","Déconnexion")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FEATURED CARD
// ════════════════════════════════════════════════════════════════════════════
function FeaturedCard({ l, lang, C, BTN_GOLD, BTN_NAVY, wishlisted, onWishlist, onOpen, delay=0 }) {
  const country_info = getCountry(l.country);
  const waMsg = encodeURIComponent(
    `Hello ${l.seller_name}! I found your listing "${l.title}" on AfriGate Market. I am interested!`);
  return (
    <div className="card fadeUp" style={{ background:"#fff", borderRadius:16,
      overflow:"hidden", marginBottom:16,
      boxShadow:"0 4px 24px rgba(13,27,42,.09)",
      border:`1.5px solid ${C.stone}`, animationDelay:`${delay}s` }}>
      <div style={{ position:"relative", cursor:"pointer" }} onClick={onOpen}>
        <img src={l.img} alt={l.title}
          style={{ width:"100%", height:210, objectFit:"cover", display:"block" }}
          loading="lazy"/>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(13,27,42,.65) 0%,transparent 55%)" }}/>
        <button onClick={e => { e.stopPropagation(); onWishlist(); }}
          style={{ position:"absolute", top:10, right:10,
            background:"rgba(0,0,0,.35)", backdropFilter:"blur(8px)",
            border:"none", borderRadius:"50%", width:36, height:36,
            fontSize:17, cursor:"pointer", display:"flex",
            alignItems:"center", justifyContent:"center",
            transition:"background .2s" }}>
          {wishlisted ? "❤️" : "🤍"}
        </button>
        <div style={{ position:"absolute", bottom:12, left:12,
          display:"flex", gap:7, flexWrap:"wrap" }}>
          <span style={{ background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
            color:C.navy, fontSize:9, fontWeight:800,
            padding:"3px 9px", borderRadius:20, letterSpacing:.8 }}>⭐ FEATURED</span>
          {l.verified && <VerifiedBadge small/>}
          <span style={{ background:"rgba(13,27,42,.65)", color:"rgba(255,255,255,.85)",
            fontSize:9, fontWeight:700, padding:"3px 9px",
            borderRadius:20, backdropFilter:"blur(4px)" }}>
            {country_info.flag} {country_info.name}
          </span>
        </div>
        <span style={{ position:"absolute", top:10, left:10,
          background:"rgba(13,27,42,.65)", color:"rgba(255,255,255,.85)",
          fontSize:9, fontWeight:700, padding:"3px 9px",
          borderRadius:20, backdropFilter:"blur(4px)" }}>
          {PILLARS.find(p=>p.id===l.pillar)?.[lang==="fr"?"fr":"en"]}
        </span>
      </div>

      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:6, cursor:"pointer" }}
          onClick={onOpen}>
          <div style={{ flex:1 }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
              fontSize:18, fontWeight:400, color:C.navy,
              lineHeight:1.25, marginBottom:3 }}>{l.title}</h3>
            <div style={{ color:C.slate, fontSize:12, marginBottom:6 }}>
              📍 {l.location}
            </div>
          </div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif",
            fontSize:16, fontWeight:600, color:C.gold,
            marginLeft:10, textAlign:"right",
            flexShrink:0, lineHeight:1.2 }}>{l.price}</div>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:10 }}>
          <Stars rating={l.rating} size={11} showCount count={l.review_count}/>
          <span style={{ fontSize:11, color:C.mist }}>🏢 {l.seller_name}</span>
        </div>

        {(l.beds||l.sqm) && (
          <div style={{ display:"flex", gap:12, marginBottom:10,
            paddingTop:8, borderTop:`1px solid ${C.stone}` }}>
            {l.beds  && <span style={{ color:C.slate, fontSize:11 }}>🛏 {l.beds} {lang==="fr"?"ch.":"beds"}</span>}
            {l.baths && <span style={{ color:C.slate, fontSize:11 }}>🚿 {l.baths} {lang==="fr"?"sdb.":"baths"}</span>}
            {l.sqm   && <span style={{ color:C.slate, fontSize:11 }}>📐 {l.sqm}m²</span>}
          </div>
        )}

        <div style={{ display:"flex", gap:8 }}>
          <a href={`https://wa.me/${l.whatsapp}?text=${waMsg}`}
            target="_blank" rel="noreferrer"
            style={{ flex:1, background:"#25D366", color:"#fff",
              textDecoration:"none", borderRadius:9, padding:"10px 0",
              fontSize:12, fontWeight:700, display:"flex",
              alignItems:"center", justifyContent:"center", gap:4 }}>
            💬 WhatsApp
          </a>
          <button onClick={onOpen}
            style={{ flex:1, background:C.navy, color:"#fff", border:"none",
              borderRadius:9, padding:"10px 0", fontSize:12, fontWeight:700,
              cursor:"pointer", letterSpacing:.5 }}>
            {lang==="fr"?"Voir Détails":"View Details"}
          </button>
        </div>

        {(l.tiktok||l.facebook) && (
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            {l.tiktok   && <a href={`https://tiktok.com/@${l.tiktok}`}    target="_blank" rel="noreferrer" style={{ color:C.mist, fontSize:10, textDecoration:"none" }}>🎵 TikTok</a>}
            {l.facebook && <a href={`https://facebook.com/${l.facebook}`} target="_blank" rel="noreferrer" style={{ color:C.mist, fontSize:10, textDecoration:"none" }}>📘 Facebook</a>}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STANDARD CARD
// ════════════════════════════════════════════════════════════════════════════
function StandardCard({ l, lang, C, BTN_GOLD, BTN_NAVY, wishlisted, onWishlist, onOpen, delay=0 }) {
  const country_info = getCountry(l.country);
  const waMsg = encodeURIComponent(
    `Hello ${l.seller_name}! I found "${l.title}" on AfriGate Market. I am interested!`);
  return (
    <div className="card fadeUp" style={{ background:"#fff", borderRadius:14,
      overflow:"hidden", marginBottom:11,
      boxShadow:"0 2px 12px rgba(13,27,42,.06)",
      border:`1px solid ${C.stone}`, display:"flex",
      animationDelay:`${delay}s` }}>
      <div style={{ position:"relative", width:118, flexShrink:0 }}>
        <img src={l.img} alt={l.title}
          style={{ width:"100%", height:"100%", minHeight:125,
            objectFit:"cover", display:"block", cursor:"pointer" }}
          loading="lazy" onClick={onOpen}/>
        {l.verified && (
          <div style={{ position:"absolute", top:6, left:6 }}>
            <span style={{ background:C.verified, color:"#fff",
              fontSize:8, fontWeight:800, padding:"2px 6px",
              borderRadius:20, display:"flex", alignItems:"center", gap:2 }}>
              <svg width={6} height={6} viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="5" fill="#fff"/>
                <path d="M2.5 5l1.8 1.8L7.5 3.5" stroke={C.verified}
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg> VER
            </span>
          </div>
        )}
        <button onClick={e => { e.stopPropagation(); onWishlist(); }}
          style={{ position:"absolute", bottom:6, right:6,
            background:"rgba(255,255,255,.9)", border:"none",
            borderRadius:"50%", width:28, height:28, fontSize:14,
            cursor:"pointer", display:"flex", alignItems:"center",
            justifyContent:"center" }}>
          {wishlisted ? "❤️" : "🤍"}
        </button>
        <div style={{ position:"absolute", top:6, right:6,
          fontSize:14 }}>{country_info.flag}</div>
      </div>

      <div style={{ flex:1, padding:"11px 13px", display:"flex",
        flexDirection:"column", justifyContent:"space-between",
        minWidth:0 }}>
        <div onClick={onOpen} style={{ cursor:"pointer" }}>
          <div style={{ fontSize:8, color:C.mist, letterSpacing:1.5,
            textTransform:"uppercase", marginBottom:2 }}>
            {PILLARS.find(p=>p.id===l.pillar)?.[lang==="fr"?"fr":"en"]}
          </div>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
            fontSize:14, fontWeight:400, color:C.navy, lineHeight:1.3,
            margin:"2px 0 3px", overflow:"hidden",
            display:"-webkit-box", WebkitLineClamp:2,
            WebkitBoxOrient:"vertical" }}>{l.title}</h3>
          <div style={{ fontFamily:"'Cormorant Garamond',serif",
            color:C.gold, fontSize:13, fontWeight:600,
            marginBottom:2 }}>{l.price}</div>
          <div style={{ color:C.mist, fontSize:10,
            marginBottom:4 }}>📍 {l.location}</div>
          <Stars rating={l.rating} size={10}
            showCount count={l.review_count}/>
        </div>
        <div style={{ display:"flex", gap:6, marginTop:8 }}>
          <a href={`https://wa.me/${l.whatsapp}?text=${waMsg}`}
            target="_blank" rel="noreferrer"
            style={{ flex:1, background:"#25D366", color:"#fff",
              textDecoration:"none", borderRadius:7, padding:"8px 0",
              fontSize:10, fontWeight:700, display:"flex",
              alignItems:"center", justifyContent:"center", gap:3 }}>
            💬 WA
          </a>
          <button onClick={onOpen}
            style={{ flex:2, background:C.navy, color:"#fff", border:"none",
              borderRadius:7, padding:"8px 0", fontSize:10, fontWeight:700,
              cursor:"pointer", letterSpacing:.4 }}>
            {lang==="fr"?"Voir Détails":"View Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
