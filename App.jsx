// ═══════════════════════════════════════════════════════════════════════════
// AFRIGATE MARKET — v2.0 · Amazon/Jumia Professional Standard
// Based on original code — ALL upgrades applied fresh:
// ✅ New category: Construction & Matériaux (Agrégats/Cement/Tôle/Hardware)
// ✅ Bulk pricing: per Truckload / per Bag / per m² / per Sheet
// ✅ Brand: Gold #D4AF37 · Navy #0A1128 (strict)
// ✅ Smart autocomplete search bar
// ✅ Shipment Tracking timeline (Logistics)
// ✅ Favorites → Supabase favorites table
// ✅ View counter (👁 eye icon, Supabase increment)
// ✅ Report Listing button (Play Store safety)
// ✅ Verified Identity + Verified Business badges
// ✅ "Typically replies in <1hr" fast-reply tag
// ✅ WhatsApp pre-filled professional message
// ✅ 60-Day Free Trial banner (CLAIM wording)
// ✅ Full FR/EN for all new fields
// ✅ Push notification placeholder
// ───────────────────────────────────────────────────────────────────────────
// ADMIN: admin@afrigate.cm / AfriGate@2025!
// ───────────────────────────────────────────────────────────────────────────
// SUPABASE — Run these in SQL Editor (one-time):
//
//   ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;
//   ALTER TABLE listings ADD COLUMN IF NOT EXISTS sub_category TEXT;
//   ALTER TABLE listings ADD COLUMN IF NOT EXISTS price_unit TEXT;
//   ALTER TABLE listings ADD COLUMN IF NOT EXISTS verified_identity BOOLEAN DEFAULT FALSE;
//   ALTER TABLE listings ADD COLUMN IF NOT EXISTS verified_business BOOLEAN DEFAULT FALSE;
//   ALTER TABLE listings ADD COLUMN IF NOT EXISTS fast_reply BOOLEAN DEFAULT FALSE;
//   ALTER TABLE listings ADD COLUMN IF NOT EXISTS tracking_stage TEXT;
//
//   CREATE TABLE IF NOT EXISTS favorites (
//     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     created_at  TIMESTAMPTZ DEFAULT NOW(),
//     user_id     TEXT NOT NULL,
//     listing_id  TEXT NOT NULL,
//     UNIQUE(user_id, listing_id)
//   );
//   CREATE TABLE IF NOT EXISTS reports (
//     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     created_at  TIMESTAMPTZ DEFAULT NOW(),
//     listing_id  TEXT NOT NULL,
//     reason      TEXT NOT NULL,
//     details     TEXT
//   );
//   ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
//   ALTER TABLE reports   ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Anyone favorites" ON favorites FOR ALL USING (true) WITH CHECK (true);
//   CREATE POLICY "Anyone report"    ON reports   FOR INSERT WITH CHECK (true);
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════════
// SUPABASE
// ══════════════════════════════════════════════════════════════════════════
const SUPABASE_URL      = "https://qfzazzzuliqjgjacl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmemF6enp1bGlxamdqYWNibnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODk5MTAsImV4cCI6MjA5Mjc2NTkxMH0.GlCpx6uABkKwzWGrW2VwaKYY_YcgeoOEwGSKz82uiVA";

const sb = {
  h: {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Prefer": "return=representation"
  },
  async get(table, filter = "") {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*${filter ? `&${filter}` : ""}`, { headers: this.h });
      return r.ok ? r.json() : null;
    } catch { return null; }
  },
  async post(table, data) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: this.h, body: JSON.stringify(data) });
      return r.ok ? r.json() : null;
    } catch { return null; }
  },
  async patch(table, data, match) {
    try {
      const p = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join("&");
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${p}`, { method: "PATCH", headers: this.h, body: JSON.stringify(data) });
      return r.ok;
    } catch { return false; }
  },
  async del(table, match) {
    try {
      const p = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join("&");
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${p}`, { method: "DELETE", headers: this.h });
      return r.ok;
    } catch { return false; }
  },
  isConfigured() { return !SUPABASE_URL.includes("YOUR_PROJECT"); }
};

// ── JSON-LD SEO ──────────────────────────────────────────────────────────────
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AfriGate Market",
  "url": "https://afrigate-market-iess.vercel.app",
  "description": "Africa's premier B2B & B2C marketplace for Real Estate, Vehicles, Construction Materials, Containers, Logistics and Shops.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://afrigate-market-iess.vercel.app/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AfriGate Market",
    "logo": { "@type": "ImageObject", "url": "https://afrigate-market-iess.vercel.app/logo.png" },
    "sameAs": [
      "https://facebook.com/AfriGateMarket",
      "https://tiktok.com/@AfriGateMarket",
      "https://instagram.com/AfriGateMarket",
      "https://youtube.com/@AfriGateMarket"
    ]
  }
};

// ══════════════════════════════════════════════════════════════════════════
// BRAND COLORS v2.0 — Gold #D4AF37 · Navy #0A1128
// ══════════════════════════════════════════════════════════════════════════
const C = {
  navy:      "#0A1128",
  navyMid:   "#111d3c",
  navyLight: "#1a2d52",
  gold:      "#D4AF37",
  goldL:     "#f0cc5a",
  goldD:     "#b8962e",
  goldPale:  "#f5e8a8",
  goldWarm:  "#fdf6d8",
  cream:     "#FAF7F2",
  stone:     "#EDE8E1",
  white:     "#FFFFFF",
  charcoal:  "#2C3A4A",
  slate:     "#5D6E7E",
  mist:      "#94A3B8",
  verified:  "#1A7A4A",
  verifiedBg:"#E8F5EE",
  danger:    "#C0392B",
  success:   "#1A7A4A",
  warn:      "#D97706",
  warnBg:    "#FFF4E0",
};

// ── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:${C.cream};color:${C.navy};-webkit-font-smoothing:antialiased;}
  ::selection{background:${C.goldPale};color:${C.navy};}
  ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${C.gold};border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0;}to{transform:translateY(0);opacity:1;}}
  @keyframes spin{to{transform:rotate(360deg);}}
  .fadeUp{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both;}
  .fadeUp2{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) .1s both;}
  .fadeUp3{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) .2s both;}
  .slideUp{animation:slideUp .38s cubic-bezier(.16,1,.3,1) both;}
  .card{transition:transform .28s cubic-bezier(.16,1,.3,1),box-shadow .28s ease;}
  .card:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(10,17,40,.13)!important;}
  .rule{height:1px;background:linear-gradient(90deg,transparent,${C.goldPale},transparent);margin:16px 0;}
  input:focus,textarea:focus,select:focus{border-color:${C.gold}!important;outline:none;box-shadow:0 0 0 3px ${C.gold}25;}
  button{font-family:'DM Sans',sans-serif;-webkit-tap-highlight-color:transparent;}
  a{-webkit-tap-highlight-color:transparent;}
  .spin{animation:spin 1s linear infinite;}
  .ac-item:hover{background:${C.goldWarm}!important;}
`;

// ── Countries ────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code:"CM", flag:"🇨🇲", name:"Cameroon",       currency:"FCFA" },
  { code:"NG", flag:"🇳🇬", name:"Nigeria",        currency:"NGN"  },
  { code:"GH", flag:"🇬🇭", name:"Ghana",          currency:"GHS"  },
  { code:"SN", flag:"🇸🇳", name:"Senegal",        currency:"FCFA" },
  { code:"CI", flag:"🇨🇮", name:"Côte d'Ivoire",  currency:"FCFA" },
  { code:"GN", flag:"🇬🇳", name:"Guinea",         currency:"GNF"  },
  { code:"GA", flag:"🇬🇦", name:"Gabon",          currency:"FCFA" },
  { code:"CD", flag:"🇨🇩", name:"DR Congo",       currency:"CDF"  },
  { code:"TG", flag:"🇹🇬", name:"Togo",           currency:"FCFA" },
  { code:"BJ", flag:"🇧🇯", name:"Benin",          currency:"FCFA" },
  { code:"FR", flag:"🇫🇷", name:"France",         currency:"EUR"  },
  { code:"GB", flag:"🇬🇧", name:"United Kingdom", currency:"GBP"  },
];

// ── All pillars (categories) ──────────────────────────────────────────────────
const PILLARS = [
  { id:"realestate",   icon:"🏛",  en:"Real Estate",             fr:"Immobilier"            },
  { id:"vehicles",     icon:"🚗",  en:"Vehicles",                fr:"Véhicules"             },
  { id:"construction", icon:"🧱",  en:"Construction & Hardware", fr:"Construction & Matériaux" },
  { id:"containers",   icon:"📦",  en:"Containers",              fr:"Conteneurs"            },
  { id:"logistics",    icon:"🚚",  en:"Logistics",               fr:"Logistique"            },
  { id:"shops",        icon:"🏪",  en:"Shops",                   fr:"Boutiques"             },
  { id:"food",         icon:"🐟",  en:"Food & Market",           fr:"Alimentation"          },
  { id:"electronics",  icon:"📱",  en:"Electronics",             fr:"Électronique"          },
  { id:"fashion",      icon:"👗",  en:"Fashion",                 fr:"Mode"                  },
  { id:"health",       icon:"🏥",  en:"Health",                  fr:"Santé"                 },
  { id:"services",     icon:"💈",  en:"Services",                fr:"Services"              },
];

// ── Construction sub-categories with bulk pricing units ──────────────────────
const CONSTRUCTION_SUBS = [
  {
    id:"aggregates", icon:"⛏",
    en:"Aggregates (Sand / Rocks)", fr:"Agrégats (Sable / Pierres)",
    units:[
      { id:"truckload", en:"per Truckload (Camion)", fr:"par Camion" },
      { id:"m3",        en:"per m³",                fr:"par m³"      },
      { id:"ton",       en:"per Tonne",             fr:"par Tonne"   },
    ]
  },
  {
    id:"heavy", icon:"🏗",
    en:"Heavy Materials (Cement / Blocks)", fr:"Matériaux Lourds (Ciment / Blocs)",
    units:[
      { id:"bag",    en:"per Bag (50 kg)",       fr:"par Sac (50 kg)"      },
      { id:"pallet", en:"per Pallet (50 bags)",  fr:"par Palette (50 sacs)" },
      { id:"truck",  en:"per Truckload",         fr:"par Camion"            },
    ]
  },
  {
    id:"roofing", icon:"🏠",
    en:"Roofing (Tôle / Wood / Tiles)", fr:"Couverture (Tôle / Bois / Tuiles)",
    units:[
      { id:"sheet",  en:"per Sheet",   fr:"par Feuille" },
      { id:"m2",     en:"per m²",      fr:"par m²"      },
      { id:"bundle", en:"per Bundle",  fr:"par Botte"   },
    ]
  },
  {
    id:"hardware", icon:"🔨",
    en:"Hardware & Tools", fr:"Quincaillerie & Outils",
    units:[
      { id:"unit", en:"per Unit",  fr:"à l'unité" },
      { id:"box",  en:"per Box",   fr:"par Boîte" },
      { id:"set",  en:"per Set",   fr:"par Jeu"   },
    ]
  },
];

// ── Autocomplete suggestions ──────────────────────────────────────────────────
const SEARCH_SUGGESTIONS = [
  "Real Estate","Immobilier","Villa","Appartement",
  "Vehicles","Véhicules","Mercedes","Toyota","Land Cruiser",
  "Construction","Cement","Ciment","Dangote","Sand","Sable",
  "Iron Rod","Fer à béton","Tôle","Hardware","Quincaillerie",
  "Containers","Conteneurs","Logistics","Logistique",
  "Douala","Yaoundé","Lagos","Abidjan","Dakar",
  "Shops","Boutiques","Electronics","Fashion","Health","Food",
];

// ── Logistics tracking stages ─────────────────────────────────────────────────
const TRACKING_STAGES = [
  { id:"received",  en:"Order Received", fr:"Commande Reçue", icon:"📋" },
  { id:"port",      en:"At Port",        fr:"Au Port",        icon:"⚓" },
  { id:"transit",   en:"In Transit",     fr:"En Transit",     icon:"🚢" },
  { id:"delivered", en:"Delivered",      fr:"Livré",          icon:"✅" },
];

// ── Seed listings ─────────────────────────────────────────────────────────────
const SEED_LISTINGS = [
  // REAL ESTATE
  { id:1,  country:"CM", pillar:"realestate", title:"Penthouse Résidence Bonapriso",
    price:"320,000,000 FCFA", location:"Douala, Bonapriso",
    img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    seller_name:"Prestige Immobilier", whatsapp:"237671282427",
    tiktok:"prestige_immo", facebook:"prestigeimmo",
    rating:4.9, review_count:38, featured:true, verified:true,
    verified_identity:true, verified_business:true, fast_reply:true,
    beds:4, baths:3, sqm:320, status:"approved", view_count:284,
    description:"Exceptional penthouse with panoramic Atlantic views, bespoke finishes and private rooftop terrace.",
    reviews:[
      { name:"Jean-Paul K.", rating:5, comment:"Absolutely stunning property. Prestige Immobilier were incredibly professional.", date:"2025-03-12" },
      { name:"Amina B.",     rating:5, comment:"Best listing I have seen in Douala. Highly recommended.", date:"2025-02-28" },
    ]},
  { id:2,  country:"CM", pillar:"realestate", title:"Villa Privée Bastos",
    price:"480,000,000 FCFA", location:"Yaoundé, Bastos",
    img:"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    seller_name:"Dupont Immobilier", whatsapp:"237671282427",
    tiktok:"dupont_immo", facebook:"dupontimmo",
    rating:4.8, review_count:24, featured:true, verified:true,
    verified_business:true, fast_reply:true,
    beds:5, baths:4, sqm:450, status:"approved", view_count:197,
    description:"Commanding 5-bedroom residence in the diplomatic quarter. Infinity pool, staff quarters, triple garage.",
    reviews:[{ name:"Marie-Claire T.", rating:5, comment:"Villa is exactly as described. Very trustworthy seller.", date:"2025-03-01" }]},
  { id:4,  country:"CM", pillar:"realestate", title:"Appartement Vue Mer Kribi",
    price:"95,000,000 FCFA", location:"Kribi, Front de Mer",
    img:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    seller_name:"Côte Estates", whatsapp:"237671282427",
    tiktok:"", facebook:"coteestates",
    rating:4.6, review_count:19, featured:false, verified:true,
    beds:3, baths:2, sqm:180, status:"approved", view_count:143,
    description:"Three-bedroom beachfront residence. Private beach access, architect interiors, fully furnished.",
    reviews:[]},
  { id:8,  country:"CM", pillar:"realestate", title:"Résidence Ngousso Haut Standing",
    price:"120,000,000 FCFA", location:"Yaoundé, Ngousso",
    img:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    seller_name:"Premium Estates CM", whatsapp:"237671282427",
    tiktok:"", facebook:"premiumestatescm",
    rating:4.7, review_count:22, featured:false, verified:true,
    beds:4, baths:3, sqm:260, status:"approved", view_count:115,
    description:"Contemporary villa, secure gated community. Smart home, Italian kitchen, generator.",
    reviews:[]},
  { id:9,  country:"SN", pillar:"realestate", title:"Villa Moderne Almadies",
    price:"95,000,000 FCFA", location:"Dakar, Les Almadies",
    img:"https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    seller_name:"Dakar Premium Immo", whatsapp:"221771234567",
    tiktok:"dakarpremium", facebook:"dakarpremiumimmo",
    rating:4.6, review_count:13, featured:false, verified:true,
    beds:4, baths:3, sqm:280, status:"approved", view_count:89,
    description:"Elegant villa 500m from the Atlantic. Modern architecture, rooftop terrace, sea views.",
    reviews:[]},

  // VEHICLES
  { id:3,  country:"NG", pillar:"vehicles", title:"Mercedes-Benz GLE 450 2023",
    price:"58,500,000 FCFA", location:"Lagos, Victoria Island",
    img:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    seller_name:"AutoElite Nigeria", whatsapp:"2348012345678",
    tiktok:"autoelite_ng", facebook:"autoeliteng",
    rating:4.7, review_count:15, featured:true, verified:true,
    verified_identity:true, fast_reply:true,
    status:"approved", view_count:332,
    description:"First owner, full AMG Line option. Massaging seats, Burmester audio, panoramic roof. Full service history.",
    reviews:[{ name:"Chukwu E.", rating:5, comment:"Great car, honest seller, smooth transaction.", date:"2025-02-15" }]},
  { id:40, country:"CM", pillar:"vehicles", title:"Toyota Land Cruiser 200 V8",
    price:"45,000,000 FCFA", location:"Douala, Akwa",
    img:"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    seller_name:"CM Auto Premium", whatsapp:"237671282427",
    tiktok:"cmauto", facebook:"cmautopremium",
    rating:4.8, review_count:22, featured:false, verified:true,
    status:"approved", view_count:209,
    description:"Toyota Land Cruiser V8 2021. Full option, leather seats, sunroof. Perfect condition.",
    reviews:[]},

  // CONSTRUCTION & MATERIALS (NEW)
  { id:100, country:"CM", pillar:"construction", sub_category:"heavy",
    title:"Ciment Dangote — Stock Grossiste Douala",
    price_unit:"bag", price:"6,500 FCFA/sac",
    location:"Douala, Port — Zone Industrielle",
    img:"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    seller_name:"MatBuild CM Pro", whatsapp:"237671282427",
    tiktok:"matbuildcm", facebook:"matbuildcm",
    rating:4.9, review_count:67, featured:true, verified:true,
    verified_business:true, fast_reply:true,
    status:"approved", view_count:412,
    description:"Ciment Dangote 42.5R en stock permanent. Prix de gros à partir de 500 sacs. Livraison chantier disponible dans Douala et Yaoundé.",
    reviews:[
      { name:"Entrepreneur Bekolo", rating:5, comment:"Stock disponible, livraison rapide. Meilleur prix de Douala!", date:"2025-03-15" },
      { name:"Architecte Moukouri", rating:5, comment:"Qualité constante sur 3 commandes. Très fiable.", date:"2025-03-08" },
    ]},
  { id:101, country:"CM", pillar:"construction", sub_category:"aggregates",
    title:"Sable de Rivière — Camion 10 Tonnes",
    price_unit:"truckload", price:"85,000 FCFA/camion",
    location:"Douala, Dibamba — Carrière",
    img:"https://images.unsplash.com/photo-1558618047-f7c5bce0d0bd?w=800&q=80",
    seller_name:"Carrière Wouri CM", whatsapp:"237671282427",
    tiktok:"carrierewouri", facebook:"carrierewouri",
    rating:4.7, review_count:44, featured:true, verified:true,
    verified_business:true,
    status:"approved", view_count:278,
    description:"Sable lavé de rivière, idéal pour construction. Camion benne 10T, livraison dans Douala sous 24h. Gravier et latérite aussi disponibles.",
    reviews:[{ name:"Maçon Tchouanang", rating:5, comment:"Sable propre, bien lavé. Jamais de problème de qualité.", date:"2025-03-10" }]},
  { id:102, country:"CM", pillar:"construction", sub_category:"roofing",
    title:"Tôle Galvanisée 0.5mm — Stock Direct Usine",
    price_unit:"sheet", price:"12,500 FCFA/feuille",
    location:"Douala, Bassa — Zone Industrielle",
    img:"https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",
    seller_name:"AcierToit CM", whatsapp:"237671282427",
    tiktok:"aciertoit", facebook:"aciertoitcm",
    rating:4.8, review_count:33, featured:false, verified:true,
    verified_business:true, fast_reply:true,
    status:"approved", view_count:188,
    description:"Tôles galvanisées calibre 0.5mm et 0.6mm. Longueurs 2m, 3m et 4m. Prix départ usine. Livraison nationale.",
    reviews:[{ name:"Sylvain K.", rating:5, comment:"Qualité excellente, prix honnête. Je recommande!", date:"2025-02-28" }]},
  { id:103, country:"NG", pillar:"construction", sub_category:"heavy",
    title:"Dangote Cement — Wholesale Lagos Port",
    price_unit:"bag", price:"8,200 NGN/bag",
    location:"Lagos, Apapa Port",
    img:"https://images.unsplash.com/photo-1590418606746-018840f9ced6?w=800&q=80",
    seller_name:"BuildMart Nigeria", whatsapp:"2348012345678",
    tiktok:"buildmartng", facebook:"buildmartng",
    rating:4.8, review_count:52, featured:true, verified:true,
    verified_business:true,
    status:"approved", view_count:355,
    description:"Dangote 3X Cement in bulk. Minimum 200 bags. Construction grade. Factory direct pricing. Lagos Metro delivery.",
    reviews:[{ name:"Engr. Adesanya", rating:5, comment:"Best cement price in Lagos. Always reliable stock.", date:"2025-03-12" }]},
  { id:104, country:"CM", pillar:"construction", sub_category:"hardware",
    title:"Quincaillerie Bâtiment — Stock Complet",
    price_unit:"unit", price:"À partir de 500 FCFA",
    location:"Douala, Marché Sandaga",
    img:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    seller_name:"Hardware Pro CM", whatsapp:"237671282427",
    tiktok:"hardwareprocm", facebook:"hardwareprocm",
    rating:4.6, review_count:28, featured:false, verified:true,
    status:"approved", view_count:164,
    description:"Clous, vis, marteaux, foreuses, niveaux à bulle, règles en aluminium. Outillage professionnel et grande consommation.",
    reviews:[]},

  // CONTAINERS
  { id:5,  country:"CI", pillar:"containers", title:"Conteneur 40ft High Cube",
    price:"6,800,000 FCFA", location:"Port d'Abidjan",
    img:"https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80",
    seller_name:"AfriContainers CI", whatsapp:"2250102030405",
    tiktok:"africontainers", facebook:"africontainersci",
    rating:4.5, review_count:11, featured:false, verified:true,
    status:"approved", view_count:98,
    description:"ISO-certified 40ft HC. CSC certified, immediate delivery. Storage or international shipping.",
    reviews:[]},
  { id:44, country:"CM", pillar:"containers", title:"Conteneur 20ft Standard",
    price:"3,500,000 FCFA", location:"Port de Douala",
    img:"https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&q=80",
    seller_name:"Douala Container Hub", whatsapp:"237671282427",
    tiktok:"doualacontainer", facebook:"doualacontainerhub",
    rating:4.6, review_count:19, featured:false, verified:true,
    status:"approved", view_count:87,
    description:"20ft standard dry container. Wind and watertight. Available immediately.",
    reviews:[]},

  // LOGISTICS
  { id:6,  country:"CM", pillar:"logistics", title:"Transport Multimodal Premium",
    price:"Sur devis / On Quote", location:"Douala ↔ Lagos ↔ Abidjan",
    img:"https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80",
    seller_name:"AfriLogistics Pro", whatsapp:"237671282427",
    tiktok:"afrilogistics", facebook:"afrilogistics",
    rating:4.8, review_count:44, featured:true, verified:true,
    verified_business:true, fast_reply:true,
    status:"approved", view_count:221, tracking_stage:"transit",
    description:"End-to-end multimodal freight. Real-time tracking, insurance included, dedicated account manager.",
    reviews:[]},
  { id:10, country:"FR", pillar:"logistics", title:"Import/Export Europe-Afrique",
    price:"On Quote / Sur Devis", location:"Paris → Douala / Abidjan",
    img:"https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80",
    seller_name:"EuroAfri Freight", whatsapp:"33612345678",
    tiktok:"euroafrifreight", facebook:"euroafrifreight",
    rating:4.7, review_count:29, featured:false, verified:true,
    status:"approved", view_count:176, tracking_stage:"port",
    description:"Specialist France-Africa freight. Customs clearance included. Paris, Lyon and Marseille depots.",
    reviews:[]},

  // SHOPS
  { id:7, country:"GH", pillar:"shops", title:"Prime Retail Space Accra",
    price:"4,500 GHS/month", location:"Accra, Osu High Street",
    img:"https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
    seller_name:"GoldCoast Properties", whatsapp:"233201234567",
    tiktok:"goldcoastprop", facebook:"goldcoastproperties",
    rating:4.4, review_count:8, featured:false, verified:true,
    status:"approved", view_count:74,
    description:"High-traffic retail on Osu's premium strip. 85sqm, full AC, private parking, 24h security.",
    reviews:[]},

  // FOOD
  { id:11, country:"CM", pillar:"food", title:"Youpwe Fresh Fish Market",
    price:"500 FCFA/kg", location:"Douala, Youpwe",
    img:"https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
    seller_name:"Youpwe Fish Traders", whatsapp:"237671282427",
    tiktok:"youpwefish", facebook:"youpwefish",
    rating:4.8, review_count:52, featured:true, verified:true, fast_reply:true,
    status:"approved", view_count:319,
    description:"Fresh fish, shrimp, crab and seafood daily. Direct from the Atlantic. Wholesale and retail available.",
    reviews:[{ name:"Mama Ngo", rating:5, comment:"Best fresh fish in Douala! Very fresh every morning.", date:"2025-03-10" }]},

  // ELECTRONICS
  { id:20, country:"CM", pillar:"electronics", title:"iPhone 15 Pro Max 256GB",
    price:"750,000 FCFA", location:"Douala, Akwa",
    img:"https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80",
    seller_name:"TechZone Cameroon", whatsapp:"237671282427",
    tiktok:"techzonecm", facebook:"techzonecm",
    rating:4.9, review_count:34, featured:true, verified:true,
    verified_identity:true, fast_reply:true,
    status:"approved", view_count:445,
    description:"Brand new sealed iPhone 15 Pro Max. All colors available. 1 year warranty included.",
    reviews:[{ name:"Kevin T.", rating:5, comment:"Genuine product, very fast delivery!", date:"2025-03-15" }]},

  // FASHION
  { id:25, country:"CM", pillar:"fashion", title:"Boutique Mode Africaine Premium",
    price:"15,000 FCFA", location:"Yaoundé, Centre Ville",
    img:"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    seller_name:"AfriStyle Fashion", whatsapp:"237671282427",
    tiktok:"afristyle", facebook:"afristylecm",
    rating:4.7, review_count:28, featured:false, verified:true,
    status:"approved", view_count:122,
    description:"Latest African fashion: dashiki, kente, ankara. Men, women and children. Custom tailoring available.",
    reviews:[]},

  // HEALTH
  { id:30, country:"CM", pillar:"health", title:"Clinique Dentaire Sourire d'Afrique",
    price:"10,000 FCFA / consultation", location:"Douala, Bonanjo",
    img:"https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80",
    seller_name:"Dr. Mbarga Jean-Paul", whatsapp:"237671282427",
    tiktok:"", facebook:"souriredafrique",
    rating:4.9, review_count:67, featured:false, verified:true,
    verified_identity:true,
    status:"approved", view_count:258,
    description:"Complete dental care: cleaning, fillings, extractions, whitening. Modern equipment. Bilingual EN/FR.",
    reviews:[{ name:"Sophie M.", rating:5, comment:"Excellent dentist! Very professional and painless.", date:"2025-02-20" }]},

  // SERVICES
  { id:35, country:"CM", pillar:"services", title:"Salon de Coiffure VIP Douala",
    price:"5,000 FCFA", location:"Douala, Bonapriso",
    img:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    seller_name:"Beauty Palace CM", whatsapp:"237671282427",
    tiktok:"beautypacecm", facebook:"beautypalacecm",
    rating:4.6, review_count:41, featured:false, verified:true, fast_reply:true,
    status:"approved", view_count:95,
    description:"Professional hair salon: braiding, weaving, relaxing, coloring. Nail care also available.",
    reviews:[]},
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const tr = (lang, en, fr) => lang === "fr" ? fr : en;
function getCountry(code) { return COUNTRIES.find(c => c.code === code) || COUNTRIES[0]; }
function getSubCat(id)    { return CONSTRUCTION_SUBS.find(s => s.id === id); }

// ── Shared input styles ───────────────────────────────────────────────────────
const INP = { width:"100%", padding:"12px 14px", borderRadius:10,
  border:`1.5px solid ${C.stone}`, fontSize:14, fontFamily:"'DM Sans',sans-serif",
  outline:"none", background:"#fff", color:C.navy, transition:"border .2s" };
const SEL = { ...INP, appearance:"none" };
const LBL = { display:"block", fontSize:11, fontWeight:700, color:C.slate,
  letterSpacing:1, textTransform:"uppercase", marginBottom:5 };

// ══════════════════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ══════════════════════════════════════════════════════════════════════════
function VerifiedBadge({ small=false, type="listing" }) {
  const labels = { identity:"VERIFIED IDENTITY", business:"VERIFIED BUSINESS", listing: small?"VERIFIED":"VERIFIED LISTING" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:small?3:5,
      background:C.verifiedBg, color:C.verified, border:`1px solid ${C.verified}30`,
      borderRadius:20, padding:small?"2px 7px":"4px 10px",
      fontSize:small?9:11, fontWeight:700, letterSpacing:.5 }}>
      <svg width={small?8:10} height={small?8:10} viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="5" fill={C.verified}/>
        <path d="M2.5 5l1.8 1.8L7.5 3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {labels[type] || labels.listing}
    </span>
  );
}

function Stars({ rating, size=12, showCount, count }) {
  const r = Math.round(parseFloat(rating) * 2) / 2;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
      <span style={{ color:C.gold, fontSize:size, letterSpacing:1 }}>
        {"★".repeat(Math.floor(r))}{r%1?"½":""}{"☆".repeat(Math.max(0,5-Math.ceil(r)))}
      </span>
      <span style={{ color:C.slate, fontSize:size-2, fontWeight:500 }}>
        {r.toFixed(1)}{showCount&&count!==undefined?` (${count})`:""}
      </span>
    </span>
  );
}

function Spinner() {
  return <span className="spin" style={{ display:"inline-block", width:16, height:16,
    border:`2px solid ${C.goldPale}`, borderTopColor:C.gold, borderRadius:"50%" }}/>;
}

function Toast({ msg, type }) {
  const bg = type==="error"?C.danger:type==="warn"?C.warn:C.success;
  return (
    <div style={{ position:"fixed", top:68, left:"50%", transform:"translateX(-50%)",
      background:bg, color:"#fff", padding:"11px 22px", borderRadius:12,
      fontWeight:700, fontSize:13, zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,.22)",
      whiteSpace:"nowrap", maxWidth:"90vw", textAlign:"center", animation:"fadeUp .3s ease" }}>
      {msg}
    </div>
  );
}

function Logo({ height=36 }) {
  const [err, setErr] = useState(false);
  if (!err) return (
    <img src="/logo.png" alt="AfriGate Market"
      style={{ height, width:"auto", objectFit:"contain", display:"block",
        filter:"drop-shadow(0 0 6px rgba(212,175,55,.3))" }}
      onError={() => setErr(true)}/>
  );
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, height }}>
      <div style={{ width:height, height, borderRadius:height*.2,
        background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontWeight:900, fontSize:height*.45, color:C.navy }}>AG</div>
      <div>
        <div style={{ fontWeight:800, fontSize:height*.44, color:"#fff", lineHeight:1 }}>
          <span style={{ color:C.gold }}>Afri</span>Gate
        </div>
        <div style={{ fontSize:height*.22, color:"rgba(255,255,255,.5)", letterSpacing:3, textTransform:"uppercase" }}>Market</div>
      </div>
    </div>
  );
}

function FastReplyBadge({ lang }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3,
      background:"rgba(26,122,74,.1)", color:C.verified,
      border:"1px solid rgba(26,122,74,.25)", borderRadius:20,
      padding:"2px 8px", fontSize:9, fontWeight:700 }}>
      ⚡ {tr(lang,"Typically replies in <1hr","Répond généralement en <1h")}
    </span>
  );
}

function ViewCount({ count }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, color:C.mist, fontSize:10 }}>
      👁 {count||0}
    </span>
  );
}

function PriceUnitBadge({ priceUnit, subCategory, lang }) {
  if (!priceUnit||!subCategory) return null;
  const sub  = getSubCat(subCategory);
  const unit = sub?.units?.find(u=>u.id===priceUnit);
  if (!unit) return null;
  return (
    <span style={{ display:"inline-flex", alignItems:"center",
      background:"rgba(139,69,19,.1)", color:"#8B4513",
      border:"1px solid rgba(139,69,19,.22)", borderRadius:20,
      padding:"2px 8px", fontSize:9, fontWeight:700 }}>
      📦 {lang==="fr"?unit.fr:unit.en}
    </span>
  );
}

// ── Shipment Tracking Timeline ────────────────────────────────────────────────
function ShipmentTracker({ stage, lang }) {
  const idx    = TRACKING_STAGES.findIndex(s=>s.id===stage);
  const active = idx>=0?idx:0;
  return (
    <div style={{ background:C.navy, borderRadius:14, padding:"16px 14px", marginBottom:16 }}>
      <div style={{ color:"rgba(255,255,255,.4)", fontSize:9, letterSpacing:2,
        textTransform:"uppercase", marginBottom:12 }}>
        {tr(lang,"SHIPMENT TRACKING","SUIVI D'EXPÉDITION")}
      </div>
      <div style={{ display:"flex", alignItems:"flex-start" }}>
        {TRACKING_STAGES.map((s,i)=>(
          <div key={s.id} style={{ flex:1, display:"flex", flexDirection:"column",
            alignItems:"center", position:"relative" }}>
            {i<TRACKING_STAGES.length-1 && (
              <div style={{ position:"absolute", top:13, left:"50%", right:"-50%",
                height:3, background:i<active?C.gold:"rgba(255,255,255,.15)", zIndex:0 }}/>
            )}
            <div style={{ width:28, height:28, borderRadius:"50%", zIndex:1,
              background:i<=active?C.gold:"rgba(255,255,255,.1)",
              color:i<=active?C.navy:"rgba(255,255,255,.4)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, fontWeight:700, flexShrink:0,
              border:i===active?`3px solid ${C.goldL}`:"3px solid transparent",
              boxShadow:i===active?`0 0 12px ${C.gold}80`:"none" }}>
              {i<=active?s.icon:"○"}
            </div>
            <div style={{ fontSize:8, color:i<=active?"rgba(255,255,255,.8)":"rgba(255,255,255,.3)",
              textAlign:"center", marginTop:5, lineHeight:1.3, fontWeight:i===active?700:400 }}>
              {lang==="fr"?s.fr:s.en}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Smart Autocomplete Search ─────────────────────────────────────────────────
function SmartSearch({ value, onChange, lang, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [focused,     setFocused]     = useState(false);

  useEffect(() => {
    if (!value.trim()||value.length<2) { setSuggestions([]); return; }
    const q = value.toLowerCase();
    setSuggestions(SEARCH_SUGGESTIONS.filter(s=>s.toLowerCase().includes(q)).slice(0,6));
  }, [value]);

  return (
    <div style={{ position:"relative" }}>
      <span style={{ position:"absolute", left:12, top:"50%",
        transform:"translateY(-50%)", fontSize:15, zIndex:2 }}>🔍</span>
      <input value={value}
        onChange={e=>onChange(e.target.value)}
        onFocus={()=>setFocused(true)}
        onBlur={()=>setTimeout(()=>setFocused(false),180)}
        placeholder={placeholder}
        style={{ width:"100%", padding:"12px 14px 12px 38px", borderRadius:10,
          border:"1.5px solid rgba(255,255,255,.15)",
          background:"rgba(255,255,255,.1)", color:"#fff",
          fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none" }}/>
      {focused&&suggestions.length>0 && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0,
          background:"#fff", borderRadius:10, overflow:"hidden", zIndex:200,
          boxShadow:"0 8px 32px rgba(10,17,40,.18)", border:`1px solid ${C.stone}` }}>
          {suggestions.map((s,i)=>(
            <div key={i} className="ac-item"
              onMouseDown={()=>{ onChange(s); setSuggestions([]); }}
              style={{ padding:"10px 14px", fontSize:13, cursor:"pointer", color:C.navy,
                borderBottom:i<suggestions.length-1?`1px solid ${C.stone}`:"none",
                display:"flex", alignItems:"center", gap:8 }}>
              🔍 {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function AfriGateMarket() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [lang,          setLang]          = useState("en");
  const [country,       setCountry]       = useState("CM");
  const [page,          setPage]          = useState("onboarding");
  const [pillarFilter,  setPillarFilter]  = useState(null);
  const [countryFilter, setCountryFilter] = useState(null);
  const [searchQ,       setSearchQ]       = useState("");
  const [listings,      setListings]      = useState(SEED_LISTINGS);
  const [activeListing, setActiveListing] = useState(null);
  const [wishlist,      setWishlist]      = useState([]);
  const [toast,         setToast]         = useState(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // modals
  const [showPost,       setShowPost]       = useState(false);
  const [showPayment,    setShowPayment]    = useState(false);
  const [showChat,       setShowChat]       = useState(false);
  const [showReview,     setShowReview]     = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdmin,      setShowAdmin]      = useState(false);
  const [showWishlist,   setShowWishlist]   = useState(false);
  const [showNotif,      setShowNotif]      = useState(false);
  const [showReport,     setShowReport]     = useState(null);

  // auth
  const [isAdmin,    setIsAdmin]    = useState(false);
  const [adminCreds, setAdminCreds] = useState({ email:"", pass:"" });
  const [adminErr,   setAdminErr]   = useState("");

  // payment
  const [payStep,    setPayStep]    = useState(1);
  const [payMethod,  setPayMethod]  = useState("");
  const [payPhone,   setPayPhone]   = useState("");
  const [payName,    setPayName]    = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // chat
  const [chatSeller,  setChatSeller]  = useState(null);
  const [chatInput,   setChatInput]   = useState("");
  const [chatHistory, setChatHistory] = useState({});
  const chatEndRef = useRef(null);

  // post form
  const EMPTY = { pillar:"", sub_category:"", price_unit:"", title:"", title_fr:"",
    price:"", location:"", description:"", image_url:"", seller_name:"",
    whatsapp:"", tiktok:"", facebook:"", country:"CM" };
  const [postForm,    setPostForm]    = useState(EMPTY);
  const [postLoading, setPostLoading] = useState(false);
  const [dupWarning,  setDupWarning]  = useState("");

  // review
  const [reviewForm,    setReviewForm]    = useState({ rating:5, comment:"", reviewer:"" });
  const [reviewLoading, setReviewLoading] = useState(false);

  // report
  const [reportForm,    setReportForm]    = useState({ reason:"", details:"" });
  const [reportLoading, setReportLoading] = useState(false);

  // admin
  const [pendingQueue, setPendingQueue] = useState([]);
  const [adminTab,     setAdminTab]     = useState("queue");

  // notifications
  const [notifications, setNotifications] = useState([
    { id:1, text:"Welcome to AfriGate Market! CLAIM YOUR 60-DAY FREE TRIAL now.", time:"Just now", read:false },
    { id:2, text:"NEW: Construction & Materials category is live — Cement, Sand, Tôle & Hardware!", time:"1 min ago", read:false },
  ]);
  const unreadCount = notifications.filter(n=>!n.read).length;

  const [swUpdate, setSwUpdate] = useState(false);

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(()=>{});
    }
    window.addEventListener("sw-update-available", ()=>setSwUpdate(true));

    // JSON-LD
    const s = document.createElement("script");
    s.type = "application/ld+json"; s.text = JSON.stringify(JSON_LD);
    document.head.appendChild(s);

    // GA4
    const ga = document.createElement("script");
    ga.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"; ga.async=true;
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer||[];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config","G-XXXXXXXXXX");

    // FB Pixel
    window.fbq = window.fbq||function(){ (window.fbq.q=window.fbq.q||[]).push(arguments); };
    window.fbq("init","YOUR_PIXEL_ID"); window.fbq("track","PageView");

    // Deep linking
    const params = new URLSearchParams(window.location.search);
    if (params.get("action")==="post")     { setPage("home"); setShowPost(true); }
    if (params.get("action")==="wishlist") { setPage("home"); setShowWishlist(true); }
    if (params.get("pillar"))              { setPage("home"); setPillarFilter(params.get("pillar")); }
    const lid = params.get("listing");
    if (lid) { const f=SEED_LISTINGS.find(l=>String(l.id)===lid); if(f){setActiveListing(f);setPage("detail");} }

    console.log("[AfriGate v2.0] Supabase:", sb.isConfigured()?"CONNECTED":"DEMO MODE");
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const notify = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3400); };
  const addNotification = (text) => setNotifications(n=>[{id:Date.now(),text,time:"Just now",read:false},...n]);

  // ── Favorites (Supabase) ──────────────────────────────────────────────────
  const toggleWishlist = async (id) => {
    const has = wishlist.includes(id);
    setWishlist(w=>has?w.filter(x=>x!==id):[...w,id]);
    notify(has?tr(lang,"Removed from Saved","Retiré des favoris"):tr(lang,"Saved ❤️","Sauvegardé ❤️"));
    if (sb.isConfigured()) {
      if (has) await sb.del("favorites",{user_id:"anonymous",listing_id:String(id)});
      else     await sb.post("favorites",{user_id:"anonymous",listing_id:String(id)});
    }
  };

  // ── View counter ──────────────────────────────────────────────────────────
  const openDetail = useCallback((l) => {
    setActiveListing(l);
    setPage("detail");
    // Increment locally
    const newCount = (l.view_count||0)+1;
    setListings(prev=>prev.map(x=>x.id===l.id?{...x,view_count:newCount}:x));
    setActiveListing({...l,view_count:newCount});
    // Increment in Supabase
    if (sb.isConfigured()) sb.patch("listings",{view_count:newCount},{id:l.id});
    if (window.gtag) window.gtag("event","view_listing",{pillar:l.pillar,listing_id:l.id});
  }, []);

  // ── Duplicate check ───────────────────────────────────────────────────────
  const checkDup = (form) => {
    const dup = listings.find(l=>l.status==="approved"&&l.pillar===form.pillar&&
      l.seller_name?.toLowerCase().trim()===form.seller_name?.toLowerCase().trim()&&
      l.location?.toLowerCase().trim()===form.location?.toLowerCase().trim());
    setDupWarning(dup?tr(lang,
      `⚠️ Similar listing exists: "${dup.title}". Admin will review.`,
      `⚠️ Annonce similaire: "${dup.title}". L'admin examinera.`):"");
  };

  // ── Submit listing ────────────────────────────────────────────────────────
  const submitListing = async () => {
    if (!postForm.pillar||!postForm.title||!postForm.price||
        !postForm.location||!postForm.seller_name||!postForm.whatsapp) {
      notify(tr(lang,"Fill all required fields (*)","Remplissez les champs *"),"error"); return;
    }
    setPostLoading(true);
    const newL = { ...postForm, id:Date.now(), rating:5.0, review_count:0,
      featured:false, verified:false, verified_identity:false, verified_business:false,
      fast_reply:false, status:"pending", reviews:[], view_count:0,
      img:postForm.image_url||"https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80",
      created_at:new Date().toISOString() };
    if (sb.isConfigured()) {
      const saved = await sb.post("listings",{
        pillar:newL.pillar, sub_category:newL.sub_category, price_unit:newL.price_unit,
        title:newL.title, title_fr:newL.title_fr, price:newL.price, location:newL.location,
        description:newL.description, image_url:newL.img, seller_name:newL.seller_name,
        whatsapp:newL.whatsapp, tiktok:newL.tiktok, facebook:newL.facebook,
        country:newL.country, status:"pending", rating:5.0, review_count:0,
        featured:false, view_count:0 });
      if (saved) newL.id = saved[0]?.id||newL.id;
    } else {
      await new Promise(r=>setTimeout(r,900));
    }
    setListings(prev=>[newL,...prev]);
    setPendingQueue(prev=>[newL,...prev]);
    setPostLoading(false); setShowPost(false); setPostForm(EMPTY); setDupWarning("");
    if (window.gtag) window.gtag("event","listing_submitted",{pillar:newL.pillar,country:newL.country});
    notify(tr(lang,"✅ Listing submitted! Admin reviews within 24h.","✅ Annonce soumise! Admin examine sous 24h."));
    addNotification(tr(lang,`Your listing "${newL.title}" is under review.`,`Votre annonce "${newL.title}" est en examen.`));
  };

  // ── Report listing ────────────────────────────────────────────────────────
  const submitReport = async () => {
    if (!reportForm.reason) { notify(tr(lang,"Select a reason","Choisissez un motif"),"error"); return; }
    setReportLoading(true);
    await new Promise(r=>setTimeout(r,800));
    if (sb.isConfigured()) await sb.post("reports",{listing_id:String(showReport.id),reason:reportForm.reason,details:reportForm.details});
    setReportLoading(false); setShowReport(null); setReportForm({reason:"",details:""});
    notify(tr(lang,"✅ Report submitted. We review within 24h.","✅ Signalement envoyé. Nous examinons sous 24h."));
  };

  // ── Admin ─────────────────────────────────────────────────────────────────
  const adminApprove = async (id) => {
    setListings(prev=>prev.map(l=>l.id===id?{...l,status:"approved",verified:true}:l));
    setPendingQueue(prev=>prev.filter(l=>l.id!==id));
    if (sb.isConfigured()) await sb.patch("listings",{status:"approved",verified:true},{id});
    notify("✅ Listing approved and published!");
    addNotification(tr(lang,"A listing was approved and is now live.","Une annonce a été approuvée."));
  };
  const adminReject = async (id) => {
    setListings(prev=>prev.filter(l=>l.id!==id));
    setPendingQueue(prev=>prev.filter(l=>l.id!==id));
    if (sb.isConfigured()) await sb.del("listings",{id});
    notify("❌ Listing rejected.","error");
  };
  const adminToggleFeatured = async (id) => {
    const l = listings.find(x=>x.id===id);
    const nf = !l?.featured;
    setListings(prev=>prev.map(x=>x.id===id?{...x,featured:nf}:x));
    if (sb.isConfigured()) await sb.patch("listings",{featured:nf},{id});
    notify(nf?"⭐ Now Featured!":"Removed from Featured.");
  };
  const adminDelete = async (id) => {
    setListings(prev=>prev.filter(l=>l.id!==id));
    if (sb.isConfigured()) await sb.del("listings",{id});
    notify("🗑 Deleted.","error");
  };

  // ── Review ────────────────────────────────────────────────────────────────
  const submitReview = async (listing) => {
    if (!reviewForm.reviewer.trim()||!reviewForm.comment.trim()) {
      notify(tr(lang,"Please fill your name and comment","Remplissez votre nom et commentaire"),"error"); return;
    }
    setReviewLoading(true);
    await new Promise(r=>setTimeout(r,900));
    const newReview = {...reviewForm,date:new Date().toISOString().split("T")[0]};
    const newRating = ((listing.rating*listing.review_count)+reviewForm.rating)/(listing.review_count+1);
    setListings(prev=>prev.map(l=>l.id===listing.id?{...l,
      reviews:[newReview,...(l.reviews||[])],
      review_count:l.review_count+1,
      rating:Math.round(newRating*10)/10}:l));
    if (activeListing?.id===listing.id) setActiveListing(prev=>({...prev,
      reviews:[newReview,...(prev.reviews||[])],
      review_count:prev.review_count+1,
      rating:Math.round(newRating*10)/10}));
    setReviewLoading(false); setShowReview(null); setReviewForm({rating:5,comment:"",reviewer:""});
    notify(tr(lang,"✅ Review posted! Thank you.","✅ Avis publié! Merci."));
  };

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendChat = () => {
    if (!chatInput.trim()||!chatSeller) return;
    const msg = {from:"me",text:chatInput,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})};
    setChatHistory(h=>({...h,[chatSeller]:[...(h[chatSeller]||[]),msg]}));
    setChatInput("");
    setTimeout(()=>{
      const replies=[
        tr(lang,"Thank you! I will get back to you shortly.","Merci! Je vous réponds bientôt."),
        tr(lang,"Yes, still available. When would you like to visit?","Oui, disponible. Quand voulez-vous visiter?"),
        tr(lang,"Please share your number and I will call you.","Partagez votre numéro, je vous appelle."),
      ];
      const reply={from:chatSeller,text:replies[Math.floor(Math.random()*replies.length)],
        time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})};
      setChatHistory(h=>({...h,[chatSeller]:[...(h[chatSeller]||[]),reply]}));
    },1500);
    notify(tr(lang,"Message sent!","Message envoyé!"));
    // Web Push notification placeholder
    if (window.Notification&&Notification.permission==="granted") {
      new Notification("AfriGate Market",{body:tr(lang,"New inquiry received!","Nouvelle demande reçue!")});
    }
  };

  // ── Payment ───────────────────────────────────────────────────────────────
  const confirmPayment = async () => {
    setPayLoading(true);
    await new Promise(r=>setTimeout(r,2000));
    setPayLoading(false); setShowPayment(false);
    setPayStep(1); setPayMethod(""); setPayPhone(""); setPayName("");
    notify(tr(lang,"✅ Welcome to AfriGate Pro! Check your email.","✅ Bienvenue sur AfriGate Pro! Vérifiez votre email."));
    addNotification(tr(lang,"🎉 AfriGate Pro active! 60-day trial started.","🎉 AfriGate Pro actif! Essai 60 jours démarré."));
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const visibleListings = listings.filter(l=>{
    if (l.status!=="approved") return false;
    const q=searchQ.toLowerCase();
    const mQ=!q||l.title?.toLowerCase().includes(q)||l.location?.toLowerCase().includes(q)||
      l.seller_name?.toLowerCase().includes(q)||l.description?.toLowerCase().includes(q)||
      l.pillar?.toLowerCase().includes(q)||l.sub_category?.toLowerCase().includes(q);
    const mP=!pillarFilter||l.pillar===pillarFilter;
    const mC=!countryFilter||l.country===countryFilter;
    return mQ&&mP&&mC;
  });
  const featuredList = visibleListings.filter(l=>l.featured);
  const regularList  = visibleListings.filter(l=>!l.featured);

  // ── Shared styles ─────────────────────────────────────────────────────────
  const MODAL = { position:"fixed", inset:0, background:"rgba(10,17,40,.7)",
    zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center",
    backdropFilter:"blur(4px)" };
  const SHEET = { background:"#fff", borderRadius:"20px 20px 0 0",
    width:"100%", maxWidth:480, maxHeight:"92vh", overflowY:"auto", padding:"26px 20px 50px" };
  const BTN_GOLD = { background:`linear-gradient(135deg,${C.goldD},${C.gold} 45%,${C.goldL})`,
    color:C.navy, border:"none", borderRadius:11, padding:"13px 20px",
    fontWeight:700, fontSize:14, cursor:"pointer", letterSpacing:.5,
    transition:"all .2s", boxShadow:`0 2px 14px ${C.gold}45`, textTransform:"uppercase" };
  const BTN_NAVY = { ...BTN_GOLD, background:C.navy, color:"#fff", boxShadow:`0 2px 14px ${C.navy}50` };
  const BTN_SM   = { ...BTN_GOLD, padding:"6px 14px", fontSize:11, borderRadius:8 };

  // ══════════════════════════════════════════════════════════════════════════
  // ONBOARDING PAGE
  // ══════════════════════════════════════════════════════════════════════════
  if (page==="onboarding") return (
    <div style={{ fontFamily:"'DM Sans',sans-serif",
      background:`linear-gradient(165deg,${C.navy} 0%,${C.navyMid} 55%,#060d20 100%)`,
      minHeight:"100vh", display:"flex", flexDirection:"column",
      justifyContent:"space-between", padding:"44px 22px 36px",
      position:"relative", overflow:"hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Trust handshake BG */}
      <div style={{ position:"absolute", inset:0,
        backgroundImage:"url(https://images.unsplash.com/photo-1521791055366-0d553872952f?w=900&q=50)",
        backgroundSize:"cover", backgroundPosition:"center",
        filter:"grayscale(100%) brightness(0.15)", zIndex:0 }}/>
      <div style={{ position:"absolute", inset:0, zIndex:0,
        background:`radial-gradient(ellipse at 15% 45%,${C.gold}10 0%,transparent 55%),
                    radial-gradient(ellipse at 85% 20%,${C.goldL}07 0%,transparent 50%),
                    linear-gradient(165deg,${C.navy}cc,${C.navyMid}aa,#060d20ee)` }}/>

      {/* Top bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative", zIndex:1 }}>
        <Logo height={38}/>
        <div style={{ display:"flex", gap:6 }}>
          {["EN","FR"].map(l=>(
            <button key={l} onClick={()=>setLang(l.toLowerCase())}
              style={{ background:lang===l.toLowerCase()?C.gold:"rgba(255,255,255,.1)",
                color:lang===l.toLowerCase()?C.navy:"#fff",
                border:"none", borderRadius:7, padding:"5px 12px",
                fontWeight:700, fontSize:11, cursor:"pointer", letterSpacing:1, transition:"all .2s" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="fadeUp" style={{ textAlign:"center", flex:1,
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"36px 0 24px", position:"relative", zIndex:1 }}>
        <div style={{ display:"inline-block", borderTop:`1px solid ${C.gold}55`,
          borderBottom:`1px solid ${C.gold}55`, padding:"7px 20px",
          margin:"0 auto 18px", letterSpacing:4, fontSize:9, color:C.goldPale, textTransform:"uppercase" }}>
          AFRICA'S PREMIER MARKETPLACE
        </div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:40,
          fontWeight:300, color:"#fff", lineHeight:1.2, marginBottom:14, letterSpacing:-1 }}>
          Where Africa's Best<br/>
          <em style={{ fontStyle:"italic", color:C.goldL }}>Deals Are Made</em>
        </h1>
        <p style={{ color:"rgba(255,255,255,.5)", fontSize:13, lineHeight:1.8,
          maxWidth:290, margin:"0 auto 20px" }}>
          {tr(lang,
            "Real Estate · Vehicles · Construction · Containers · Logistics & More.",
            "Immobilier · Véhicules · Construction · Conteneurs · Logistique & Plus.")}
        </p>
        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:8 }}>
          {COUNTRIES.slice(0,8).map(c=>(
            <button key={c.code} onClick={()=>setCountry(c.code)} title={c.name}
              style={{ background:country===c.code?`linear-gradient(135deg,${C.gold},${C.goldL})`:"rgba(255,255,255,.08)",
                border:country===c.code?"none":"1px solid rgba(255,255,255,.12)",
                borderRadius:10, padding:"7px 10px", cursor:"pointer", transition:"all .2s",
                display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <span style={{ fontSize:20 }}>{c.flag}</span>
              <span style={{ fontSize:8, color:country===c.code?C.navy:"rgba(255,255,255,.6)", fontWeight:700 }}>{c.code}</span>
            </button>
          ))}
        </div>
        <p style={{ color:"rgba(255,255,255,.25)", fontSize:9, letterSpacing:1.5, textTransform:"uppercase" }}>SELECT YOUR COUNTRY</p>
      </div>

      {/* Pillars + CTA */}
      <div className="fadeUp2" style={{ position:"relative", zIndex:1 }}>
        <p style={{ color:"rgba(255,255,255,.3)", fontSize:9, letterSpacing:2.5,
          textTransform:"uppercase", textAlign:"center", marginBottom:12 }}>
          {tr(lang,"CHOOSE YOUR CATEGORY","CHOISISSEZ VOTRE CATÉGORIE")}
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, marginBottom:14 }}>
          {PILLARS.slice(0,10).map(p=>(
            <button key={p.id} onClick={()=>setPillarFilter(p.id)}
              style={{ background:pillarFilter===p.id?`linear-gradient(135deg,${C.gold},${C.goldL})`:"rgba(255,255,255,.07)",
                border:pillarFilter===p.id?"none":"1px solid rgba(255,255,255,.1)",
                borderRadius:12, padding:"10px 4px", cursor:"pointer", textAlign:"center", transition:"all .22s" }}>
              <div style={{ fontSize:18, marginBottom:3 }}>{p.icon}</div>
              <div style={{ color:pillarFilter===p.id?C.navy:"#fff", fontWeight:600, fontSize:8, lineHeight:1.2 }}>{p[lang==="fr"?"fr":"en"]}</div>
            </button>
          ))}
        </div>
        <button onClick={()=>setPage("home")} style={{ ...BTN_GOLD, width:"100%",
          borderRadius:13, padding:"15px", fontSize:15, boxShadow:`0 8px 28px ${C.gold}55` }}>
          {tr(lang,"CLAIM 60-DAY FREE TRIAL →","RÉCLAMER L'ESSAI GRATUIT 60 JOURS →")}
        </button>
        <p style={{ color:"rgba(255,255,255,.2)", fontSize:10, textAlign:"center", marginTop:12 }}>
          {tr(lang,"No credit card required · Cancel anytime","Sans carte bancaire · Annulez à tout moment")}
        </p>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // DETAIL PAGE
  // ══════════════════════════════════════════════════════════════════════════
  if (page==="detail"&&activeListing) {
    const l = activeListing;
    const countryInfo    = getCountry(l.country);
    const isLogistics    = l.pillar==="logistics";
    const isConstruction = l.pillar==="construction";
    const subCat         = getSubCat(l.sub_category);
    // Professional pre-filled WhatsApp message
    const waMsg = encodeURIComponent(`Hello, I'm interested in *${l.title}* on AfriGate Market. Is it still available?`);

    return (
      <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.cream,
        minHeight:"100vh", maxWidth:480, margin:"0 auto", boxShadow:"0 0 60px rgba(0,0,0,.15)" }}>
        <style>{GLOBAL_CSS}</style>
        {toast&&<Toast {...toast}/>}

        {/* Header */}
        <div style={{ background:C.navy, padding:"0 16px", height:58,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(0,0,0,.3)" }}>
          <button onClick={()=>setPage("home")}
            style={{ background:"rgba(255,255,255,.1)", border:"none", color:"#fff",
              borderRadius:9, padding:"7px 14px", cursor:"pointer", fontSize:16, fontWeight:600 }}>←</button>
          <Logo height={30}/>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={()=>setShowReport(l)}
              style={{ background:"rgba(255,255,255,.08)", border:"none",
                color:"rgba(255,255,255,.5)", borderRadius:8, padding:"6px 10px",
                cursor:"pointer", fontSize:11, fontWeight:600 }}>
              ⚑ {tr(lang,"Report","Signaler")}
            </button>
            <button onClick={()=>toggleWishlist(l.id)}
              style={{ background:"rgba(255,255,255,.1)", border:"none",
                borderRadius:9, padding:"7px 10px", cursor:"pointer", fontSize:20 }}>
              {wishlist.includes(l.id)?"❤️":"🤍"}
            </button>
          </div>
        </div>

        <div style={{ paddingBottom:100 }}>
          {/* Hero image */}
          <div style={{ position:"relative" }}>
            <img src={l.img} alt={l.title}
              style={{ width:"100%", height:260, objectFit:"cover", display:"block" }}/>
            <div style={{ position:"absolute", inset:0,
              background:"linear-gradient(to top,rgba(10,17,40,.75) 0%,transparent 50%)" }}/>
            <div style={{ position:"absolute", bottom:12, left:12, display:"flex", gap:6, flexWrap:"wrap" }}>
              {l.featured&&<span style={{ background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
                color:C.navy, fontSize:9, fontWeight:800, padding:"3px 9px", borderRadius:20 }}>⭐ FEATURED</span>}
              {l.verified&&<VerifiedBadge small/>}
              <span style={{ background:"rgba(10,17,40,.7)", color:"rgba(255,255,255,.85)",
                fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:20, backdropFilter:"blur(4px)" }}>
                {countryInfo.flag} {countryInfo.name}
              </span>
            </div>
            <div style={{ position:"absolute", top:12, left:12, display:"flex", gap:5 }}>
              <span style={{ background:"rgba(10,17,40,.65)", color:"rgba(255,255,255,.85)",
                fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:20, backdropFilter:"blur(4px)" }}>
                {PILLARS.find(p=>p.id===l.pillar)?.[lang==="fr"?"fr":"en"]}
              </span>
              {isConstruction&&subCat&&(
                <span style={{ background:"rgba(139,69,19,.8)", color:"#fff",
                  fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:20 }}>
                  {subCat.icon} {lang==="fr"?subCat.fr:subCat.en}
                </span>
              )}
            </div>
            <div style={{ position:"absolute", top:12, right:12,
              background:"rgba(10,17,40,.6)", borderRadius:20, padding:"3px 9px",
              backdropFilter:"blur(4px)" }}>
              <ViewCount count={l.view_count}/>
            </div>
          </div>

          <div style={{ padding:"22px 18px" }}>
            {/* Trust badges row */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
              {l.verified          && <VerifiedBadge/>}
              {l.verified_identity && <VerifiedBadge type="identity"/>}
              {l.verified_business && <VerifiedBadge type="business"/>}
              {l.fast_reply        && <FastReplyBadge lang={lang}/>}
              {isConstruction&&l.price_unit && <PriceUnitBadge priceUnit={l.price_unit} subCategory={l.sub_category} lang={lang}/>}
            </div>

            <h1 style={{ fontFamily:"'Cormorant Garamond',serif",
              fontSize:26, fontWeight:400, color:C.navy, lineHeight:1.25, margin:"8px 0 6px" }}>{l.title}</h1>
            <div style={{ fontFamily:"'Cormorant Garamond',serif",
              fontSize:24, fontWeight:600, color:C.gold, marginBottom:6 }}>{l.price}</div>
            <div style={{ color:C.slate, fontSize:13, marginBottom:8 }}>
              📍 {l.location} &nbsp;
              <span style={{ background:C.stone, borderRadius:6, padding:"2px 7px", fontSize:10, fontWeight:700 }}>
                {countryInfo.flag} {countryInfo.name}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <Stars rating={l.rating} showCount count={l.review_count}/>
              <ViewCount count={l.view_count}/>
            </div>

            {/* Property stats */}
            {(l.beds||l.sqm)&&(
              <div style={{ display:"flex", borderTop:`1px solid ${C.stone}`,
                borderBottom:`1px solid ${C.stone}`, padding:"13px 0", marginBottom:18 }}>
                {[l.beds&&{icon:"🛏",val:l.beds,lbl:tr(lang,"Beds","Ch.")},
                  l.baths&&{icon:"🚿",val:l.baths,lbl:tr(lang,"Baths","SdB")},
                  l.sqm&&{icon:"📐",val:`${l.sqm}m²`,lbl:tr(lang,"Area","Surface")}]
                  .filter(Boolean).map((s,i,arr)=>(
                  <div key={i} style={{ flex:1, textAlign:"center",
                    borderRight:i<arr.length-1?`1px solid ${C.stone}`:"none" }}>
                    <div style={{ fontSize:18, marginBottom:2 }}>{s.icon}</div>
                    <div style={{ fontWeight:700, fontSize:15, color:C.navy }}>{s.val}</div>
                    <div style={{ fontSize:9, color:C.mist, letterSpacing:1, textTransform:"uppercase" }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Construction bulk pricing panel */}
            {isConstruction&&subCat&&(
              <div style={{ background:"rgba(139,69,19,.07)", border:"1px solid rgba(139,69,19,.18)",
                borderRadius:12, padding:14, marginBottom:16 }}>
                <div style={{ fontWeight:700, fontSize:13, color:"#8B4513", marginBottom:8 }}>
                  {subCat.icon} {lang==="fr"?subCat.fr:subCat.en} — {tr(lang,"Pricing Options","Options de Prix")}
                </div>
                {subCat.units?.map(u=>(
                  <div key={u.id} style={{ display:"flex", alignItems:"center", gap:8,
                    marginBottom:5, fontSize:12, color:C.charcoal }}>
                    <span style={{ color:C.gold }}>▸</span>
                    {lang==="fr"?u.fr:u.en}
                    {u.id===l.price_unit&&(
                      <span style={{ background:C.gold, color:C.navy, fontSize:9,
                        fontWeight:700, borderRadius:10, padding:"1px 7px" }}>
                        {tr(lang,"THIS LISTING","CETTE ANNONCE")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Logistics tracker */}
            {isLogistics&&l.tracking_stage&&(
              <ShipmentTracker stage={l.tracking_stage} lang={lang}/>
            )}

            <div className="rule"/>

            {/* Description */}
            {l.description&&(
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
              <div style={{ color:"rgba(255,255,255,.4)", fontSize:9, letterSpacing:2,
                textTransform:"uppercase", marginBottom:6 }}>SELLER / VENDEUR</div>
              <div style={{ color:"#fff", fontFamily:"'Cormorant Garamond',serif",
                fontSize:18, fontWeight:400, marginBottom:8 }}>🏢 {l.seller_name}</div>
              {l.fast_reply&&<div style={{ marginBottom:10 }}><FastReplyBadge lang={lang}/></div>}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {l.tiktok&&<a href={`https://tiktok.com/@${l.tiktok}`} target="_blank" rel="noreferrer"
                  style={{ background:"rgba(255,255,255,.1)", color:"#fff",
                    textDecoration:"none", borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700 }}>
                  🎵 TikTok</a>}
                {l.facebook&&<a href={`https://facebook.com/${l.facebook}`} target="_blank" rel="noreferrer"
                  style={{ background:"rgba(66,103,178,.3)", color:"#fff",
                    textDecoration:"none", borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700 }}>
                  📘 Facebook</a>}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <a href={`https://wa.me/${l.whatsapp}?text=${waMsg}`}
                target="_blank" rel="noreferrer"
                style={{ background:"#25D366", color:"#fff", textDecoration:"none",
                  borderRadius:12, padding:"15px", fontSize:14, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow:"0 4px 16px rgba(37,211,102,.4)" }}>
                💬 {tr(lang,"WhatsApp Seller","WhatsApp Vendeur")}
              </a>
              <button onClick={()=>{ setChatSeller(l.seller_name); setShowChat(true); }}
                style={{ ...BTN_NAVY, borderRadius:12, padding:"14px",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                ✉️ {tr(lang,"Internal Message","Message Interne")}
              </button>
              <button onClick={()=>setShowReview(l)}
                style={{ background:"transparent", color:C.gold,
                  border:`1.5px solid ${C.gold}`, borderRadius:12, padding:"12px",
                  fontWeight:700, fontSize:14, cursor:"pointer" }}>
                ⭐ {tr(lang,"Write a Review","Écrire un avis")}
              </button>
              <button onClick={()=>setShowPayment(true)}
                style={{ ...BTN_GOLD, borderRadius:12, padding:"13px",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                🚀 {tr(lang,"Boost This Listing — 2,000 FCFA","Booster cette Annonce — 2 000 FCFA")}
              </button>
              <button onClick={()=>setShowReport(l)}
                style={{ background:"transparent", color:C.mist,
                  border:`1px solid ${C.stone}`, borderRadius:12, padding:"10px",
                  fontWeight:600, fontSize:12, cursor:"pointer" }}>
                ⚑ {tr(lang,"Report this Listing","Signaler cette annonce")}
              </button>
            </div>

            <div className="rule"/>

            {/* Reviews */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:400, color:C.navy }}>
                  {tr(lang,"Customer Reviews","Avis Clients")}
                </h3>
                <span style={{ background:C.goldWarm, color:C.goldD, fontWeight:700,
                  fontSize:11, padding:"3px 10px", borderRadius:20, border:`1px solid ${C.goldPale}` }}>
                  {l.review_count} {tr(lang,"reviews","avis")}
                </span>
              </div>
              {(!l.reviews||l.reviews.length===0)?(
                <div style={{ background:C.stone, borderRadius:12, padding:20,
                  textAlign:"center", color:C.slate, fontSize:13, marginBottom:14 }}>
                  {tr(lang,"No reviews yet. Be the first!","Pas encore d'avis. Soyez le premier!")}
                </div>
              ):l.reviews.slice(0,5).map((r,i)=>(
                <div key={i} style={{ background:"#fff", borderRadius:12, padding:14, marginBottom:10,
                  boxShadow:"0 1px 8px rgba(0,0,0,.06)", border:`1px solid ${C.stone}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div>
                      <span style={{ fontWeight:700, fontSize:13, color:C.navy }}>{r.name||r.reviewer}</span>
                      <span style={{ color:C.mist, fontSize:10, marginLeft:8 }}>{r.date}</span>
                    </div>
                    <Stars rating={r.rating} size={11}/>
                  </div>
                  <p style={{ fontSize:13, color:C.charcoal, lineHeight:1.6, margin:0 }}>{r.comment}</p>
                </div>
              ))}
              <button onClick={()=>setShowReview(l)}
                style={{ ...BTN_SM, borderRadius:10, width:"100%", marginTop:4, padding:"10px" }}>
                + {tr(lang,"Write a Review","Écrire un avis")}
              </button>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showReview&&(
          <div style={MODAL} onClick={()=>setShowReview(null)}>
            <div style={SHEET} onClick={e=>e.stopPropagation()} className="slideUp">
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:400, marginBottom:20 }}>
                {tr(lang,"Share Your Experience","Partagez votre expérience")}
              </h3>
              <label style={LBL}>{tr(lang,"Your Name *","Votre Nom *")}</label>
              <input value={reviewForm.reviewer}
                onChange={e=>setReviewForm(f=>({...f,reviewer:e.target.value}))}
                style={{ ...INP, marginBottom:14 }} placeholder={tr(lang,"Full name","Nom complet")}/>
              <label style={LBL}>{tr(lang,"Rating","Note")}</label>
              <div style={{ display:"flex", gap:6, marginBottom:16 }}>
                {[1,2,3,4,5].map(s=>(
                  <button key={s} onClick={()=>setReviewForm(f=>({...f,rating:s}))}
                    style={{ background:"none", border:"none", fontSize:32,
                      cursor:"pointer", opacity:reviewForm.rating>=s?1:.2, transition:"opacity .15s" }}>★</button>
                ))}
              </div>
              <label style={LBL}>{tr(lang,"Your Review *","Votre Avis *")}</label>
              <textarea value={reviewForm.comment}
                onChange={e=>setReviewForm(f=>({...f,comment:e.target.value}))}
                style={{ ...INP, height:90, resize:"none", marginBottom:18 }}
                placeholder={tr(lang,"Your honest experience...","Votre expérience honnête...")}/>
              <button onClick={()=>submitReview(showReview)} disabled={reviewLoading}
                style={{ ...BTN_GOLD, width:"100%", borderRadius:12, padding:"14px", opacity:reviewLoading?.7:1 }}>
                {reviewLoading?<Spinner/>:tr(lang,"Submit Review","Soumettre l'avis")}
              </button>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReport&&(
          <div style={MODAL} onClick={()=>setShowReport(null)}>
            <div style={SHEET} onClick={e=>e.stopPropagation()} className="slideUp">
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, marginBottom:10 }}>
                ⚑ {tr(lang,"Report Listing","Signaler l'annonce")}
              </h3>
              <p style={{ fontSize:12, color:C.mist, marginBottom:16 }}>
                {tr(lang,"Help us keep AfriGate safe. Reports are reviewed within 24h.",
                         "Aidez-nous à maintenir AfriGate sécurisé. Signalements examinés sous 24h.")}
              </p>
              <label style={LBL}>{tr(lang,"Reason *","Motif *")}</label>
              <select value={reportForm.reason}
                onChange={e=>setReportForm(f=>({...f,reason:e.target.value}))}
                style={{ ...SEL, marginBottom:14 }}>
                <option value="">{tr(lang,"Select reason...","Choisir un motif...")}</option>
                <option value="fake">{tr(lang,"Fake / Scam","Fausse / Arnaque")}</option>
                <option value="inappropriate">{tr(lang,"Inappropriate content","Contenu inapproprié")}</option>
                <option value="wrong_price">{tr(lang,"Misleading price","Prix trompeur")}</option>
                <option value="duplicate">{tr(lang,"Duplicate listing","Annonce dupliquée")}</option>
                <option value="spam">{tr(lang,"Spam","Spam")}</option>
                <option value="other">{tr(lang,"Other","Autre")}</option>
              </select>
              <label style={LBL}>{tr(lang,"Details (optional)","Détails (optionnel)")}</label>
              <textarea value={reportForm.details}
                onChange={e=>setReportForm(f=>({...f,details:e.target.value}))}
                style={{ ...INP, height:80, resize:"none", marginBottom:18 }}
                placeholder={tr(lang,"Describe the issue...","Décrivez le problème...")}/>
              <button onClick={submitReport} disabled={reportLoading}
                style={{ ...BTN_GOLD, width:"100%", borderRadius:12, padding:"13px",
                  background:`linear-gradient(135deg,${C.danger},#e55)`,
                  boxShadow:`0 2px 14px ${C.danger}45`, opacity:reportLoading?.7:1 }}>
                {reportLoading?<Spinner/>:tr(lang,"Submit Report","Envoyer le signalement")}
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
      {toast&&<Toast {...toast}/>}

      {/* SW update banner */}
      {swUpdate&&(
        <div style={{ background:C.gold, color:C.navy, padding:"9px 16px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          fontSize:12, fontWeight:700 }}>
          <span>🔄 {tr(lang,"Update available","Mise à jour disponible")}</span>
          <button onClick={()=>window.location.reload()}
            style={{ background:C.navy, color:"#fff", border:"none",
              borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700 }}>
            {tr(lang,"Update","Mettre à jour")}
          </button>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <div style={{ background:C.navy, padding:"0 16px", height:60,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(0,0,0,.28)" }}>
        <div style={{ cursor:"pointer" }} onClick={()=>setPage("onboarding")}>
          <Logo height={34}/>
        </div>
        <div style={{ display:"flex", gap:7, alignItems:"center" }}>
          <button onClick={()=>setShowCountryPicker(true)}
            style={{ background:"rgba(255,255,255,.1)", border:"none",
              color:"#fff", borderRadius:8, padding:"5px 9px", cursor:"pointer", fontSize:16 }}>
            {getCountry(country).flag}
          </button>
          <button onClick={()=>setLang(l=>l==="en"?"fr":"en")}
            style={{ background:"rgba(255,255,255,.1)", color:"#fff",
              border:"none", borderRadius:7, padding:"5px 9px",
              fontSize:10, fontWeight:700, cursor:"pointer", letterSpacing:1 }}>
            {lang==="en"?"FR":"EN"}
          </button>
          <button onClick={()=>setShowWishlist(true)}
            style={{ background:"rgba(255,255,255,.1)", border:"none",
              color:"#fff", borderRadius:7, padding:"5px 9px",
              cursor:"pointer", fontSize:16, position:"relative" }}>
            ❤️
            {wishlist.length>0&&(
              <span style={{ position:"absolute", top:2, right:2, background:C.danger,
                color:"#fff", borderRadius:"50%", width:14, height:14, fontSize:8,
                fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {wishlist.length}
              </span>
            )}
          </button>
          <button onClick={()=>setShowNotif(true)}
            style={{ background:"rgba(255,255,255,.1)", border:"none",
              color:"#fff", borderRadius:7, padding:"5px 9px",
              cursor:"pointer", fontSize:16, position:"relative" }}>
            🔔
            {unreadCount>0&&(
              <span style={{ position:"absolute", top:2, right:2, background:C.danger,
                color:"#fff", borderRadius:"50%", width:14, height:14, fontSize:8,
                fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {unreadCount}
              </span>
            )}
          </button>
          <button onClick={()=>setShowPayment(true)} style={BTN_SM}>
            {tr(lang,"60-Day Trial","Essai 60J")}
          </button>
          <button onClick={()=>setShowAdminLogin(true)}
            style={{ background:"rgba(255,255,255,.08)", color:"#fff",
              border:"none", borderRadius:7, padding:"5px 9px", fontSize:12, cursor:"pointer" }}>⚙️</button>
        </div>
      </div>

      {/* ── HERO SEARCH ── */}
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,
        padding:"18px 16px 22px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, zIndex:0,
          backgroundImage:"url(https://images.unsplash.com/photo-1521791055366-0d553872952f?w=600&q=30)",
          backgroundSize:"cover", backgroundPosition:"center",
          filter:"grayscale(100%) brightness(0.07)" }}/>
        <div style={{ position:"absolute", inset:0, zIndex:0,
          background:`radial-gradient(ellipse at 85% 50%,${C.gold}0E 0%,transparent 60%)` }}/>
        <div style={{ position:"relative", zIndex:1 }}>
          {/* Country pills */}
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:10, marginBottom:12 }}>
            <button onClick={()=>setCountryFilter(null)}
              style={{ background:!countryFilter?C.gold:"rgba(255,255,255,.08)",
                color:!countryFilter?C.navy:"rgba(255,255,255,.7)",
                border:"none", borderRadius:20, padding:"5px 12px",
                fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
              🌍 {tr(lang,"All Countries","Tous Pays")}
            </button>
            {COUNTRIES.slice(0,8).map(c=>(
              <button key={c.code} onClick={()=>setCountryFilter(c.code)}
                style={{ background:countryFilter===c.code?C.gold:"rgba(255,255,255,.08)",
                  color:countryFilter===c.code?C.navy:"rgba(255,255,255,.7)",
                  border:"none", borderRadius:20, padding:"5px 10px",
                  fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
                {c.flag} {c.code}
              </button>
            ))}
          </div>
          <h2 style={{ color:"#fff", fontFamily:"'Cormorant Garamond',serif",
            fontSize:20, fontWeight:300, marginBottom:12, lineHeight:1.3 }}>
            {tr(lang,"Find the Best Deals in Africa","Trouvez les Meilleures Offres en Afrique")}
          </h2>
          <SmartSearch value={searchQ} onChange={setSearchQ} lang={lang}
            placeholder={tr(lang,
              "Search: Real Estate, Cement, Logistics...",
              "Chercher: Immobilier, Ciment, Logistique...")}/>
        </div>
      </div>

      {/* ── PILLAR PILLS ── */}
      <div style={{ background:"#fff", padding:"11px 16px", display:"flex", gap:7,
        overflowX:"auto", borderBottom:`1px solid ${C.stone}`,
        boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
        <button onClick={()=>setPillarFilter(null)}
          style={{ background:!pillarFilter?C.navy:"#f5f5f5",
            color:!pillarFilter?"#fff":C.slate,
            border:`1px solid ${!pillarFilter?C.navy:C.stone}`,
            borderRadius:20, padding:"6px 14px", fontSize:11, fontWeight:600,
            cursor:"pointer", whiteSpace:"nowrap", transition:"all .2s" }}>
          🌍 {tr(lang,"All","Tous")}
        </button>
        {PILLARS.map(p=>(
          <button key={p.id} onClick={()=>setPillarFilter(p.id)}
            style={{ background:pillarFilter===p.id?C.navy:"#f5f5f5",
              color:pillarFilter===p.id?"#fff":C.slate,
              border:`1px solid ${pillarFilter===p.id?C.navy:C.stone}`,
              borderRadius:20, padding:"6px 14px", fontSize:11, fontWeight:600,
              cursor:"pointer", whiteSpace:"nowrap", transition:"all .2s" }}>
            {p.icon} {p[lang==="fr"?"fr":"en"]}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ paddingBottom:90 }}>

        {/* 60-Day Trial Banner */}
        <div style={{ margin:"14px 16px 0",
          background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,
          borderRadius:14, padding:"14px 16px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          boxShadow:`0 4px 20px ${C.navy}30`, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0,
            background:`radial-gradient(ellipse at 90% 50%,${C.gold}12,transparent 60%)`,
            pointerEvents:"none" }}/>
          <div style={{ position:"relative" }}>
            <div style={{ color:C.gold, fontWeight:800, fontSize:13, marginBottom:2 }}>
              🎁 {tr(lang,"CLAIM 60-DAY FREE TRIAL","RÉCLAMER L'ESSAI GRATUIT 60 JOURS")}
            </div>
            <div style={{ color:"rgba(255,255,255,.45)", fontSize:11 }}>
              {tr(lang,"Then 9,900 FCFA/month · No card required","Puis 9 900 FCFA/mois · Sans carte")}
            </div>
          </div>
          <button onClick={()=>setShowPayment(true)}
            style={{ ...BTN_SM, flexShrink:0, position:"relative" }}>
            {tr(lang,"Claim","Réclamer")}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, padding:"14px 16px 0" }}>
          {[
            { icon:"🏘", val:listings.filter(l=>l.status==="approved").length, lbl:tr(lang,"Listings","Annonces") },
            { icon:"🌍", val:"12",  lbl:tr(lang,"Countries","Pays") },
            { icon:"⭐", val:"4.8", lbl:tr(lang,"Avg Rating","Note Moy.") },
            { icon:"✅", val:listings.filter(l=>l.verified&&l.status==="approved").length, lbl:tr(lang,"Verified","Vérifiés") },
          ].map((s,i)=>(
            <div key={i} style={{ background:"#fff", borderRadius:12, padding:"10px 8px",
              textAlign:"center", boxShadow:"0 1px 8px rgba(0,0,0,.05)", border:`1px solid ${C.stone}` }}>
              <div style={{ fontSize:18, marginBottom:2 }}>{s.icon}</div>
              <div style={{ fontWeight:800, fontSize:15, color:C.navy }}>{s.val}</div>
              <div style={{ fontSize:9, color:C.mist, letterSpacing:.8, textTransform:"uppercase" }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Construction spotlight */}
        {(!pillarFilter||pillarFilter==="construction")&&(
          <div style={{ margin:"14px 16px 0",
            background:"linear-gradient(135deg,#3d1f0a,#6b3a1f)",
            borderRadius:14, padding:"14px 16px",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            boxShadow:"0 4px 20px rgba(139,69,19,.3)" }}>
            <div>
              <div style={{ color:C.goldL, fontWeight:700, fontSize:13 }}>
                🧱 {tr(lang,"NEW: Construction & Materials","NOUVEAU: Construction & Matériaux")}
              </div>
              <div style={{ color:"rgba(255,255,255,.5)", fontSize:11, marginTop:2 }}>
                {tr(lang,"Cement · Sand · Tôle · Hardware — Bulk pricing available",
                         "Ciment · Sable · Tôle · Quincaillerie — Prix de gros disponibles")}
              </div>
            </div>
            <button onClick={()=>setPillarFilter("construction")}
              style={{ ...BTN_SM, flexShrink:0 }}>
              {tr(lang,"Shop","Acheter")}
            </button>
          </div>
        )}

        {/* Featured */}
        {featuredList.length>0&&(
          <div style={{ padding:"20px 16px 0" }}>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, color:C.slate, letterSpacing:2, textTransform:"uppercase", marginBottom:3 }}>FEATURED</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, color:C.navy }}>
                {tr(lang,"Top Listings","Meilleures Annonces")}
              </div>
            </div>
            {featuredList.map((l,i)=>(
              <FeaturedCard key={l.id} l={l} lang={lang} C={C} BTN_GOLD={BTN_GOLD}
                wishlisted={wishlist.includes(l.id)} onWishlist={()=>toggleWishlist(l.id)}
                onOpen={()=>openDetail(l)} delay={i*.08}/>
            ))}
          </div>
        )}

        {/* Regular */}
        {regularList.length>0&&(
          <div style={{ padding:"20px 16px 0" }}>
            <div style={{ marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:10, color:C.slate, letterSpacing:2, textTransform:"uppercase", marginBottom:3 }}>
                  {pillarFilter?PILLARS.find(p=>p.id===pillarFilter)?.[lang==="fr"?"fr":"en"]:"ALL LISTINGS"}
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, color:C.navy }}>
                  {tr(lang,"Latest Listings","Dernières Annonces")}
                </div>
              </div>
              <span style={{ background:C.stone, color:C.slate, borderRadius:20, padding:"4px 10px", fontSize:11, fontWeight:600 }}>
                {regularList.length} {tr(lang,"results","résultats")}
              </span>
            </div>
            {regularList.map((l,i)=>(
              <StandardCard key={l.id} l={l} lang={lang} C={C}
                wishlisted={wishlist.includes(l.id)} onWishlist={()=>toggleWishlist(l.id)}
                onOpen={()=>openDetail(l)} delay={i*.05}/>
            ))}
          </div>
        )}

        {/* Empty state */}
        {visibleListings.length===0&&(
          <div style={{ textAlign:"center", padding:"60px 24px", color:C.mist }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:C.navy, marginBottom:6 }}>
              {tr(lang,"No listings found","Aucune annonce trouvée")}
            </div>
            <div style={{ fontSize:13 }}>{tr(lang,"Try a different search or category","Essayez une autre recherche ou catégorie")}</div>
            <button onClick={()=>{ setSearchQ(""); setPillarFilter(null); setCountryFilter(null); }}
              style={{ ...BTN_SM, marginTop:18 }}>
              {tr(lang,"Clear filters","Effacer filtres")}
            </button>
          </div>
        )}

        {/* FAB */}
        <button onClick={()=>setShowPost(true)}
          style={{ position:"fixed", bottom:24, right:20,
            background:`linear-gradient(135deg,${C.goldD},${C.gold},${C.goldL})`,
            color:C.navy, border:"none", borderRadius:"50%",
            width:58, height:58, fontSize:26, cursor:"pointer",
            boxShadow:`0 6px 24px ${C.gold}60`, zIndex:50,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:900 }}>
          +
        </button>
      </div>

      {/* ══ COUNTRY PICKER ════════════════════════════════════════════════════ */}
      {showCountryPicker&&(
        <div style={MODAL} onClick={()=>setShowCountryPicker(false)}>
          <div style={SHEET} onClick={e=>e.stopPropagation()} className="slideUp">
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, marginBottom:16 }}>
              🌍 {tr(lang,"Select Country","Choisir le Pays")}
            </h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {COUNTRIES.map(c=>(
                <button key={c.code}
                  onClick={()=>{ setCountry(c.code); setCountryFilter(c.code); setShowCountryPicker(false); }}
                  style={{ background:country===c.code?C.navy:"#f8f8f8",
                    color:country===c.code?"#fff":C.navy,
                    border:`1.5px solid ${country===c.code?C.navy:C.stone}`,
                    borderRadius:10, padding:"11px 14px", cursor:"pointer",
                    display:"flex", alignItems:"center", gap:10, textAlign:"left", transition:"all .2s" }}>
                  <span style={{ fontSize:22 }}>{c.flag}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:12 }}>{c.name}</div>
                    <div style={{ fontSize:10, opacity:.6 }}>{c.currency}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ WISHLIST / FAVORITES ═════════════════════════════════════════════ */}
      {showWishlist&&(
        <div style={MODAL} onClick={()=>setShowWishlist(false)}>
          <div style={SHEET} onClick={e=>e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400 }}>
                ❤️ {tr(lang,"My Saved Listings","Mes Annonces Sauvegardées")}
              </h3>
              <button onClick={()=>setShowWishlist(false)}
                style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>
            {wishlist.length===0?(
              <div style={{ textAlign:"center", padding:40, color:C.mist }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🤍</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:C.navy }}>
                  {tr(lang,"No saved listings yet","Aucune annonce sauvegardée")}
                </div>
                <div style={{ fontSize:12, marginTop:6 }}>
                  {tr(lang,"Tap ❤️ on any listing to save it","Appuyez ❤️ sur une annonce pour la sauvegarder")}
                </div>
              </div>
            ):listings.filter(l=>wishlist.includes(l.id)).map(l=>(
              <div key={l.id} style={{ display:"flex", gap:12, background:"#f8f8f8",
                borderRadius:12, padding:12, marginBottom:10, cursor:"pointer" }}
                onClick={()=>{ openDetail(l); setShowWishlist(false); }}>
                <img src={l.img} alt={l.title}
                  style={{ width:70, height:70, borderRadius:8, objectFit:"cover", flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:C.navy, marginBottom:2 }}>{l.title}</div>
                  <div style={{ color:C.gold, fontWeight:700, fontSize:13 }}>{l.price}</div>
                  <div style={{ color:C.mist, fontSize:11 }}>📍 {l.location}</div>
                  <div style={{ marginTop:3 }}><ViewCount count={l.view_count}/></div>
                </div>
                <button onClick={e=>{ e.stopPropagation(); toggleWishlist(l.id); }}
                  style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", alignSelf:"flex-start" }}>❤️</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ NOTIFICATIONS ════════════════════════════════════════════════════ */}
      {showNotif&&(
        <div style={MODAL} onClick={()=>setShowNotif(false)}>
          <div style={SHEET} onClick={e=>e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400 }}>
                🔔 {tr(lang,"Notifications","Notifications")}
              </h3>
              <button onClick={()=>{ setNotifications(n=>n.map(x=>({...x,read:true}))); setShowNotif(false); }}
                style={{ background:"none", border:`1px solid ${C.stone}`, borderRadius:8,
                  padding:"5px 10px", fontSize:11, color:C.slate, cursor:"pointer" }}>
                {tr(lang,"Mark all read","Tout marquer lu")}
              </button>
            </div>
            {notifications.length===0?(
              <div style={{ textAlign:"center", padding:40, color:C.mist }}>
                {tr(lang,"No notifications","Aucune notification")}
              </div>
            ):notifications.map(n=>(
              <div key={n.id} style={{ background:n.read?"#f8f8f8":C.goldWarm,
                borderRadius:12, padding:"12px 14px", marginBottom:8,
                border:`1px solid ${n.read?C.stone:C.goldPale}` }}>
                <div style={{ fontSize:13, color:C.navy, fontWeight:n.read?400:600, lineHeight:1.5 }}>{n.text}</div>
                <div style={{ fontSize:10, color:C.mist, marginTop:4 }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ POST LISTING ══════════════════════════════════════════════════════ */}
      {showPost&&(
        <div style={MODAL} onClick={()=>setShowPost(false)}>
          <div style={SHEET} onClick={e=>e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <div>
                <div style={{ fontSize:10, color:C.slate, letterSpacing:2, textTransform:"uppercase" }}>NEW LISTING</div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:400, color:C.navy }}>
                  {tr(lang,"Post Your Listing","Publier une Annonce")}
                </h3>
              </div>
              <button onClick={()=>setShowPost(false)}
                style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>
            <p style={{ fontSize:11, color:C.success, fontWeight:600, marginBottom:18 }}>
              ✅ {tr(lang,"Saves to database · Pending admin review","Sauvegardé en base · En attente de validation")}
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              <div>
                <label style={LBL}>{tr(lang,"Country *","Pays *")}</label>
                <select value={postForm.country} onChange={e=>setPostForm(f=>({...f,country:e.target.value}))} style={SEL}>
                  {COUNTRIES.map(c=>(<option key={c.code} value={c.code}>{c.flag} {c.name}</option>))}
                </select>
              </div>
              <div>
                <label style={LBL}>{tr(lang,"Category *","Catégorie *")}</label>
                <select value={postForm.pillar}
                  onChange={e=>{ setPostForm(f=>({...f,pillar:e.target.value,sub_category:"",price_unit:""}));
                    checkDup({...postForm,pillar:e.target.value}); }} style={SEL}>
                  <option value="">{tr(lang,"Select a category...","Sélectionner...")}</option>
                  {PILLARS.map(p=>(<option key={p.id} value={p.id}>{p.icon} {p[lang==="fr"?"fr":"en"]}</option>))}
                </select>
              </div>
              {postForm.pillar==="construction"&&(
                <>
                  <div>
                    <label style={LBL}>{tr(lang,"Sub-Category *","Sous-Catégorie *")}</label>
                    <select value={postForm.sub_category}
                      onChange={e=>setPostForm(f=>({...f,sub_category:e.target.value,price_unit:""}))} style={SEL}>
                      <option value="">{tr(lang,"Select sub-category...","Sélectionner sous-catégorie...")}</option>
                      {CONSTRUCTION_SUBS.map(s=>(<option key={s.id} value={s.id}>{s.icon} {lang==="fr"?s.fr:s.en}</option>))}
                    </select>
                  </div>
                  {postForm.sub_category&&(
                    <div>
                      <label style={LBL}>{tr(lang,"Price Unit *","Unité de Prix *")}</label>
                      <select value={postForm.price_unit}
                        onChange={e=>setPostForm(f=>({...f,price_unit:e.target.value}))} style={SEL}>
                        <option value="">{tr(lang,"Select price unit...","Sélectionner l'unité...")}</option>
                        {getSubCat(postForm.sub_category)?.units?.map(u=>(
                          <option key={u.id} value={u.id}>{lang==="fr"?u.fr:u.en}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={LBL}>Title (EN) *</label>
                  <input value={postForm.title} onChange={e=>setPostForm(f=>({...f,title:e.target.value}))} style={INP} placeholder="Listing title"/>
                </div>
                <div>
                  <label style={LBL}>Titre (FR)</label>
                  <input value={postForm.title_fr} onChange={e=>setPostForm(f=>({...f,title_fr:e.target.value}))} style={INP} placeholder="Titre français"/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={LBL}>{tr(lang,"Price *","Prix *")}</label>
                  <input value={postForm.price} onChange={e=>setPostForm(f=>({...f,price:e.target.value}))}
                    style={INP} placeholder={postForm.pillar==="construction"?"6,500 FCFA/sac":"5,000,000 FCFA"}/>
                </div>
                <div>
                  <label style={LBL}>{tr(lang,"Location *","Lieu *")}</label>
                  <input value={postForm.location}
                    onChange={e=>{ setPostForm(f=>({...f,location:e.target.value})); checkDup({...postForm,location:e.target.value}); }}
                    style={INP} placeholder="Douala, Akwa"/>
                </div>
              </div>
              <div>
                <label style={LBL}>{tr(lang,"Description","Description")}</label>
                <textarea value={postForm.description} onChange={e=>setPostForm(f=>({...f,description:e.target.value}))}
                  style={{ ...INP, height:80, resize:"none" }}
                  placeholder={tr(lang,"Describe your listing...","Décrivez votre annonce...")}/>
              </div>
              <div>
                <label style={LBL}>{tr(lang,"Image URL","URL Image")}</label>
                <input value={postForm.image_url} onChange={e=>setPostForm(f=>({...f,image_url:e.target.value}))}
                  style={INP} placeholder="https://..."/>
              </div>
              <div style={{ borderTop:`1px solid ${C.stone}`, paddingTop:14 }}>
                <div style={{ fontWeight:800, fontSize:13, marginBottom:10, color:C.navy }}>
                  🏢 {tr(lang,"Seller Information","Informations Vendeur")}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                  <div>
                    <label style={LBL}>{tr(lang,"Business Name *","Nom Entreprise *")}</label>
                    <input value={postForm.seller_name}
                      onChange={e=>{ setPostForm(f=>({...f,seller_name:e.target.value})); checkDup({...postForm,seller_name:e.target.value}); }}
                      style={INP} placeholder={tr(lang,"Your business","Votre entreprise")}/>
                  </div>
                  <div>
                    <label style={LBL}>WhatsApp *</label>
                    <input value={postForm.whatsapp} onChange={e=>setPostForm(f=>({...f,whatsapp:e.target.value}))}
                      style={INP} placeholder="+237671282427"/>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label style={LBL}>🎵 TikTok</label>
                    <input value={postForm.tiktok} onChange={e=>setPostForm(f=>({...f,tiktok:e.target.value}))} style={INP} placeholder="@username"/>
                  </div>
                  <div>
                    <label style={LBL}>📘 Facebook</label>
                    <input value={postForm.facebook} onChange={e=>setPostForm(f=>({...f,facebook:e.target.value}))} style={INP} placeholder="page name"/>
                  </div>
                </div>
              </div>
              {dupWarning&&(
                <div style={{ background:C.warnBg, border:`1.5px solid ${C.warn}40`,
                  borderRadius:10, padding:"10px 12px", fontSize:12, color:C.warn, fontWeight:600 }}>
                  {dupWarning}
                </div>
              )}
              <button onClick={submitListing} disabled={postLoading}
                style={{ ...BTN_GOLD, width:"100%", borderRadius:12, padding:"14px", fontSize:15,
                  opacity:postLoading?.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {postLoading?<><Spinner/> {tr(lang,"Submitting...","Soumission...")}</>:`🚀 ${tr(lang,"Submit Listing","Soumettre l'Annonce")}`}
              </button>
              <p style={{ fontSize:11, color:C.mist, textAlign:"center" }}>
                {tr(lang,"Reviewed before publishing.","Examiné avant publication.")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══ PAYMENT ═══════════════════════════════════════════════════════════ */}
      {showPayment&&(
        <div style={MODAL} onClick={()=>{ setShowPayment(false); setPayStep(1); }}>
          <div style={SHEET} onClick={e=>e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:10, color:C.slate, letterSpacing:2, textTransform:"uppercase" }}>MEMBERSHIP</div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:400, color:C.navy }}>
                  {payStep===1?tr(lang,"60-Day Free Trial","Essai Gratuit 60 Jours"):
                   payStep===2?tr(lang,"Choose Payment","Choisir Paiement"):
                   tr(lang,"Confirm Payment","Confirmer le Paiement")}
                </h3>
              </div>
              <button onClick={()=>{ setShowPayment(false); setPayStep(1); }}
                style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>
            {payStep===1&&(
              <>
                <div style={{ background:C.navy, borderRadius:14, padding:20, marginBottom:14 }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", color:C.goldL, fontSize:28, fontWeight:400, marginBottom:4 }}>
                    9,900 FCFA <span style={{ fontSize:13, color:"rgba(255,255,255,.4)", fontFamily:"'DM Sans',sans-serif", fontWeight:400 }}>/month</span>
                  </div>
                  {[tr(lang,"Unlimited verified listings","Annonces vérifiées illimitées"),
                    tr(lang,"Featured badge & priority placement","Badge vedette & priorité"),
                    tr(lang,"WhatsApp + TikTok + Facebook links","WhatsApp + TikTok + Facebook"),
                    tr(lang,"Analytics & performance dashboard","Tableau de bord analytique"),
                    tr(lang,"Post to 12 African + European countries","Poster dans 12 pays"),
                  ].map((f,i)=>(
                    <div key={i} style={{ color:"rgba(255,255,255,.75)", fontSize:13, marginTop:9, display:"flex", gap:10 }}>
                      <span style={{ color:C.gold }}>—</span>{f}
                    </div>
                  ))}
                </div>
                <div style={{ background:C.goldWarm, borderRadius:10, padding:"10px 14px",
                  marginBottom:14, fontSize:12, fontWeight:600, color:C.charcoal }}>
                  🎁 {tr(lang,"60-day FREE trial — no charge today!","Essai GRATUIT 60 jours — aucun frais aujourd'hui!")}
                </div>
                <button onClick={()=>setPayStep(2)}
                  style={{ ...BTN_GOLD, width:"100%", borderRadius:12, padding:"14px", fontSize:15 }}>
                  {tr(lang,"CLAIM FREE TRIAL →","RÉCLAMER L'ESSAI GRATUIT →")}
                </button>
              </>
            )}
            {payStep===2&&(
              [{ id:"mtn",label:"MTN Mobile Money",icon:"📱" },
               { id:"orange",label:"Orange Money",icon:"🟠" },
               { id:"visa",label:"Visa / Mastercard",icon:"💳" }]
              .map(m=>(
                <button key={m.id} onClick={()=>{ setPayMethod(m.id); setPayStep(3); }}
                  style={{ width:"100%", background:payMethod===m.id?C.goldWarm:"#f8f8f8",
                    border:`1.5px solid ${payMethod===m.id?C.gold:C.stone}`,
                    borderRadius:12, padding:"14px 16px", cursor:"pointer",
                    display:"flex", alignItems:"center", gap:14, marginBottom:10,
                    fontWeight:600, fontSize:14, color:C.navy, textAlign:"left", transition:"all .2s" }}>
                  <span style={{ fontSize:24 }}>{m.icon}</span>{m.label}
                </button>
              ))
            )}
            {payStep===3&&(
              <>
                <div>
                  <label style={LBL}>{tr(lang,"Full Name","Nom Complet")}</label>
                  <input value={payName} onChange={e=>setPayName(e.target.value)}
                    style={{ ...INP, marginBottom:12 }} placeholder={tr(lang,"Your full name","Votre nom complet")}/>
                </div>
                {payMethod!=="visa"&&(
                  <div>
                    <label style={LBL}>{tr(lang,"Phone Number","Numéro de Téléphone")}</label>
                    <input value={payPhone} onChange={e=>setPayPhone(e.target.value)}
                      style={{ ...INP, marginBottom:18 }} placeholder="+237 671 282 427"/>
                  </div>
                )}
                <div style={{ background:C.goldWarm, borderRadius:10, padding:"12px 14px", marginBottom:18 }}>
                  <div style={{ fontWeight:700, color:C.navy, fontSize:13 }}>
                    🎁 {tr(lang,"60-Day Free Trial","Essai Gratuit 60 Jours")}
                  </div>
                  <div style={{ color:C.slate, fontSize:12, marginTop:2 }}>
                    {tr(lang,"No charge today. 9,900 FCFA/month after.","Aucun frais aujourd'hui. 9 900 FCFA/mois après.")}
                  </div>
                </div>
                <button onClick={confirmPayment} disabled={payLoading}
                  style={{ ...BTN_GOLD, width:"100%", borderRadius:12, padding:"14px", fontSize:15,
                    opacity:payLoading?.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {payLoading?<><Spinner/> {tr(lang,"Processing...","Traitement...")}</>:
                    tr(lang,"Start Free Trial →","Démarrer l'Essai Gratuit →")}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ CHAT ══════════════════════════════════════════════════════════════ */}
      {showChat&&(
        <div style={MODAL} onClick={()=>setShowChat(false)}>
          <div style={SHEET} onClick={e=>e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:400 }}>
                  ✉️ {chatSeller}
                </h3>
                <div style={{ fontSize:10, color:C.mist }}>{tr(lang,"Internal messaging","Messagerie interne")}</div>
              </div>
              <button onClick={()=>setShowChat(false)}
                style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>
            <div style={{ background:"#f8f8f8", borderRadius:12, padding:12, height:220, overflowY:"auto", marginBottom:12 }}>
              {!(chatHistory[chatSeller]?.length)?(
                <div style={{ textAlign:"center", padding:30, color:C.mist, fontSize:13 }}>
                  {tr(lang,"Start the conversation...","Commencez la conversation...")}
                </div>
              ):chatHistory[chatSeller].map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:m.from==="me"?"flex-end":"flex-start", marginBottom:8 }}>
                  <div style={{ background:m.from==="me"?C.navy:"#fff", color:m.from==="me"?"#fff":C.navy,
                    borderRadius:m.from==="me"?"12px 12px 0 12px":"12px 12px 12px 0",
                    padding:"8px 12px", maxWidth:"78%", fontSize:13, boxShadow:"0 1px 4px rgba(0,0,0,.08)" }}>
                    <div>{m.text}</div>
                    <div style={{ fontSize:9, opacity:.5, marginTop:3, textAlign:"right" }}>{m.time}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}/>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&sendChat()}
                style={{ ...INP, flex:1 }} placeholder={tr(lang,"Type a message...","Écrire un message...")}/>
              <button onClick={sendChat} style={{ ...BTN_GOLD, padding:"12px 18px", borderRadius:10 }}>
                {tr(lang,"Send","Envoyer")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ADMIN LOGIN ════════════════════════════════════════════════════════ */}
      {showAdminLogin&&!isAdmin&&(
        <div style={MODAL} onClick={()=>setShowAdminLogin(false)}>
          <div style={SHEET} onClick={e=>e.stopPropagation()} className="slideUp">
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, marginBottom:20 }}>
              ⚙️ {tr(lang,"Admin Login","Connexion Admin")}
            </h3>
            <label style={LBL}>Email</label>
            <input value={adminCreds.email} onChange={e=>setAdminCreds(c=>({...c,email:e.target.value}))}
              style={{ ...INP, marginBottom:12 }} type="email" placeholder="admin@afrigate.cm"/>
            <label style={LBL}>{tr(lang,"Password","Mot de passe")}</label>
            <input value={adminCreds.pass} onChange={e=>setAdminCreds(c=>({...c,pass:e.target.value}))}
              style={{ ...INP, marginBottom:adminErr?8:18 }} type="password" placeholder="••••••••"/>
            {adminErr&&<div style={{ color:C.danger, fontSize:12, marginBottom:14, fontWeight:600 }}>{adminErr}</div>}
            <button onClick={()=>{
              if (adminCreds.email==="admin@afrigate.cm"&&adminCreds.pass==="AfriGate@2025!") {
                setIsAdmin(true); setShowAdminLogin(false); setShowAdmin(true); setAdminErr("");
              } else { setAdminErr(tr(lang,"Invalid credentials","Identifiants incorrects")); }
            }} style={{ ...BTN_GOLD, width:"100%", borderRadius:12, padding:"13px" }}>
              {tr(lang,"Login","Connexion")}
            </button>
          </div>
        </div>
      )}

      {/* ══ ADMIN PANEL ════════════════════════════════════════════════════════ */}
      {showAdmin&&isAdmin&&(
        <div style={MODAL} onClick={()=>setShowAdmin(false)}>
          <div style={SHEET} onClick={e=>e.stopPropagation()} className="slideUp">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400 }}>
                ⚙️ {tr(lang,"Admin Panel","Panneau Admin")}
              </h3>
              <button onClick={()=>setShowAdmin(false)}
                style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto" }}>
              {["queue","listings","system"].map(tab=>(
                <button key={tab} onClick={()=>setAdminTab(tab)}
                  style={{ background:adminTab===tab?C.navy:"#f5f5f5",
                    color:adminTab===tab?"#fff":C.slate,
                    border:"none", borderRadius:8, padding:"7px 14px",
                    fontWeight:700, fontSize:11, cursor:"pointer",
                    letterSpacing:.5, textTransform:"uppercase", whiteSpace:"nowrap" }}>
                  {tab==="queue"?tr(lang,"Queue","File"):tab==="listings"?tr(lang,"Listings","Annonces"):"System"}
                  {tab==="queue"&&pendingQueue.length>0&&(
                    <span style={{ background:C.danger, color:"#fff", borderRadius:"50%",
                      width:15, height:15, fontSize:8,
                      display:"inline-flex", alignItems:"center", justifyContent:"center", marginLeft:6 }}>
                      {pendingQueue.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {adminTab==="queue"&&(
              pendingQueue.length===0?(
                <div style={{ textAlign:"center", padding:"24px", background:"#f5f5f5", borderRadius:12, color:C.mist }}>
                  ✅ {tr(lang,"No listings pending review","Aucune annonce en attente")}
                </div>
              ):pendingQueue.map(l=>(
                <div key={l.id} style={{ background:"#f8f8f8", borderRadius:12, padding:13,
                  marginBottom:10, border:`1px solid ${C.warn}30` }}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{l.title}</div>
                  <div style={{ fontSize:11, color:C.slate, marginBottom:8 }}>
                    {getCountry(l.country).flag} {l.location} · 🏢 {l.seller_name} · {l.pillar}
                    {l.sub_category&&` · ${l.sub_category}`}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>adminApprove(l.id)}
                      style={{ ...BTN_GOLD, flex:1, borderRadius:8, padding:"8px", fontSize:12 }}>
                      ✓ {tr(lang,"Approve","Approuver")}
                    </button>
                    <button onClick={()=>adminReject(l.id)}
                      style={{ flex:1, background:C.danger, color:"#fff", border:"none",
                        borderRadius:8, padding:"8px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                      ✕ {tr(lang,"Reject","Rejeter")}
                    </button>
                  </div>
                </div>
              ))
            )}
            {adminTab==="listings"&&(
              <div style={{ maxHeight:320, overflowY:"auto" }}>
                {listings.filter(l=>l.status==="approved").map(l=>(
                  <div key={l.id} style={{ display:"flex", alignItems:"center", gap:10,
                    background:"#f8f8f8", borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                    <img src={l.img} alt={l.title}
                      style={{ width:44, height:44, borderRadius:8, objectFit:"cover", flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:11, overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.title}</div>
                      <div style={{ fontSize:9, color:C.mist }}>
                        {getCountry(l.country).flag} · {l.seller_name}
                        {l.featured?" · ⭐Featured":""}
                        {` · 👁 ${l.view_count||0}`}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:5 }}>
                      <button onClick={()=>adminToggleFeatured(l.id)}
                        style={{ background:l.featured?C.gold:"#ddd", color:l.featured?C.navy:"#666",
                          border:"none", borderRadius:6, padding:"5px 8px", fontSize:11, cursor:"pointer", fontWeight:700 }}>⭐</button>
                      <button onClick={()=>adminDelete(l.id)}
                        style={{ background:C.danger, color:"#fff", border:"none",
                          borderRadius:6, padding:"5px 8px", fontSize:11, cursor:"pointer", fontWeight:700 }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {adminTab==="system"&&(
              <div style={{ background:C.navy, borderRadius:12, padding:14,
                fontSize:11, color:"rgba(255,255,255,.65)", lineHeight:2 }}>
                📊 Google Analytics: G-XXXXXXXXXX<br/>
                📘 Meta Pixel: YOUR_PIXEL_ID<br/>
                💳 CinetPay: MTN MoMo · Orange · Visa/MC<br/>
                🗄️ Supabase: CONNECTED<br/>
                🧱 Construction category: ACTIVE<br/>
                🔗 Deep Links: /?action=post · /?action=wishlist · /?pillar=construction<br/>
                🌐 SEO: JSON-LD structured data active<br/>
                💰 Withdrawals: MTN +237 671 28 24 27<br/>
                🌍 Countries: {COUNTRIES.map(c=>c.flag).join(" ")}<br/>
                📱 PWA: Service Worker v2.0.0<br/>
                🔔 Push Notifications: Enabled<br/>
                👁 View Counters: Active (Supabase)<br/>
                ⚑ Report System: Active
              </div>
            )}
            <button onClick={()=>{ setShowAdmin(false); setIsAdmin(false); setAdminCreds({email:"",pass:""});
              notify(tr(lang,"Logged out","Déconnecté")); }}
              style={{ ...BTN_NAVY, width:"100%", borderRadius:12, padding:"12px", marginTop:14, background:C.danger }}>
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
function FeaturedCard({ l, lang, C, BTN_GOLD, wishlisted, onWishlist, onOpen, delay=0 }) {
  const countryInfo    = getCountry(l.country);
  const isConstruction = l.pillar==="construction";
  const waMsg = encodeURIComponent(`Hello, I'm interested in *${l.title}* on AfriGate Market. Is it still available?`);
  return (
    <div className="card fadeUp" style={{ background:"#fff", borderRadius:16, overflow:"hidden",
      marginBottom:16, boxShadow:"0 4px 24px rgba(10,17,40,.09)",
      border:`1.5px solid ${C.stone}`, animationDelay:`${delay}s` }}>
      <div style={{ position:"relative", cursor:"pointer" }} onClick={onOpen}>
        <img src={l.img} alt={l.title}
          style={{ width:"100%", height:210, objectFit:"cover", display:"block" }} loading="lazy"/>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(10,17,40,.7) 0%,transparent 55%)" }}/>
        <button onClick={e=>{ e.stopPropagation(); onWishlist(); }}
          style={{ position:"absolute", top:10, right:10,
            background:"rgba(0,0,0,.35)", backdropFilter:"blur(8px)",
            border:"none", borderRadius:"50%", width:36, height:36,
            fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {wishlisted?"❤️":"🤍"}
        </button>
        {/* View counter */}
        <div style={{ position:"absolute", top:10, left:10,
          background:"rgba(10,17,40,.6)", borderRadius:20, padding:"3px 8px",
          backdropFilter:"blur(4px)" }}>
          <ViewCount count={l.view_count}/>
        </div>
        <div style={{ position:"absolute", bottom:12, left:12, display:"flex", gap:6, flexWrap:"wrap" }}>
          <span style={{ background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
            color:C.navy, fontSize:9, fontWeight:800, padding:"3px 9px", borderRadius:20 }}>⭐ FEATURED</span>
          {l.verified&&<VerifiedBadge small/>}
          {l.fast_reply&&<span style={{ background:"rgba(26,122,74,.8)", color:"#fff",
            fontSize:8, fontWeight:700, padding:"2px 7px", borderRadius:20 }}>⚡ Fast Reply</span>}
          <span style={{ background:"rgba(10,17,40,.65)", color:"rgba(255,255,255,.85)",
            fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:20, backdropFilter:"blur(4px)" }}>
            {countryInfo.flag} {countryInfo.name}
          </span>
        </div>
      </div>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:6, cursor:"pointer" }} onClick={onOpen}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:8, color:C.mist, letterSpacing:1.5, textTransform:"uppercase", marginBottom:2 }}>
              {PILLARS.find(p=>p.id===l.pillar)?.[lang==="fr"?"fr":"en"]}
            </div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
              fontSize:18, fontWeight:400, color:C.navy, lineHeight:1.25, marginBottom:3 }}>{l.title}</h3>
            <div style={{ color:C.slate, fontSize:12, marginBottom:4 }}>📍 {l.location}</div>
            {isConstruction&&l.price_unit&&(
              <div style={{ marginBottom:4 }}>
                <PriceUnitBadge priceUnit={l.price_unit} subCategory={l.sub_category} lang={lang}/>
              </div>
            )}
          </div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif",
            fontSize:16, fontWeight:600, color:C.gold,
            marginLeft:10, textAlign:"right", flexShrink:0, lineHeight:1.2 }}>{l.price}</div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <Stars rating={l.rating} size={11} showCount count={l.review_count}/>
          <span style={{ fontSize:11, color:C.mist }}>🏢 {l.seller_name}</span>
        </div>
        {(l.beds||l.sqm)&&(
          <div style={{ display:"flex", gap:12, marginBottom:10, paddingTop:8, borderTop:`1px solid ${C.stone}` }}>
            {l.beds  &&<span style={{ color:C.slate, fontSize:11 }}>🛏 {l.beds}  {lang==="fr"?"ch.":"beds"}</span>}
            {l.baths &&<span style={{ color:C.slate, fontSize:11 }}>🚿 {l.baths} {lang==="fr"?"sdb.":"baths"}</span>}
            {l.sqm   &&<span style={{ color:C.slate, fontSize:11 }}>📐 {l.sqm}m²</span>}
          </div>
        )}
        <div style={{ display:"flex", gap:8 }}>
          <a href={`https://wa.me/${l.whatsapp}?text=${waMsg}`}
            target="_blank" rel="noreferrer"
            style={{ flex:1, background:"#25D366", color:"#fff", textDecoration:"none",
              borderRadius:9, padding:"10px 0", fontSize:12, fontWeight:700,
              display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
            💬 WhatsApp
          </a>
          <button onClick={onOpen}
            style={{ flex:1, background:C.navy, color:"#fff", border:"none",
              borderRadius:9, padding:"10px 0", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            {lang==="fr"?"Voir Détails":"View Details"}
          </button>
        </div>
        {(l.tiktok||l.facebook)&&(
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            {l.tiktok  &&<a href={`https://tiktok.com/@${l.tiktok}`}    target="_blank" rel="noreferrer" style={{ color:C.mist, fontSize:10, textDecoration:"none" }}>🎵 TikTok</a>}
            {l.facebook&&<a href={`https://facebook.com/${l.facebook}`} target="_blank" rel="noreferrer" style={{ color:C.mist, fontSize:10, textDecoration:"none" }}>📘 Facebook</a>}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STANDARD CARD
// ════════════════════════════════════════════════════════════════════════════
function StandardCard({ l, lang, C, wishlisted, onWishlist, onOpen, delay=0 }) {
  const countryInfo    = getCountry(l.country);
  const isConstruction = l.pillar==="construction";
  const waMsg = encodeURIComponent(`Hello, I'm interested in *${l.title}* on AfriGate Market. Is it still available?`);
  return (
    <div className="card fadeUp" style={{ background:"#fff", borderRadius:14, overflow:"hidden",
      marginBottom:11, boxShadow:"0 2px 12px rgba(10,17,40,.06)",
      border:`1px solid ${C.stone}`, display:"flex", animationDelay:`${delay}s` }}>
      <div style={{ position:"relative", width:118, flexShrink:0 }}>
        <img src={l.img} alt={l.title}
          style={{ width:"100%", height:"100%", minHeight:125, objectFit:"cover", display:"block", cursor:"pointer" }}
          loading="lazy" onClick={onOpen}/>
        {l.verified&&(
          <div style={{ position:"absolute", top:6, left:6 }}>
            <span style={{ background:C.verified, color:"#fff", fontSize:8, fontWeight:800,
              padding:"2px 6px", borderRadius:20, display:"flex", alignItems:"center", gap:2 }}>
              <svg width={6} height={6} viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="5" fill="#fff"/>
                <path d="M2.5 5l1.8 1.8L7.5 3.5" stroke={C.verified} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg> VER
            </span>
          </div>
        )}
        <button onClick={e=>{ e.stopPropagation(); onWishlist(); }}
          style={{ position:"absolute", bottom:6, right:6,
            background:"rgba(255,255,255,.9)", border:"none", borderRadius:"50%",
            width:28, height:28, fontSize:14, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
          {wishlisted?"❤️":"🤍"}
        </button>
        <div style={{ position:"absolute", top:6, right:6, fontSize:14 }}>{countryInfo.flag}</div>
        <div style={{ position:"absolute", bottom:6, left:6,
          background:"rgba(10,17,40,.65)", borderRadius:10, padding:"1px 5px", backdropFilter:"blur(4px)" }}>
          <ViewCount count={l.view_count}/>
        </div>
      </div>
      <div style={{ flex:1, padding:"11px 13px", display:"flex",
        flexDirection:"column", justifyContent:"space-between", minWidth:0 }}>
        <div onClick={onOpen} style={{ cursor:"pointer" }}>
          <div style={{ fontSize:8, color:C.mist, letterSpacing:1.5, textTransform:"uppercase", marginBottom:2 }}>
            {PILLARS.find(p=>p.id===l.pillar)?.[lang==="fr"?"fr":"en"]}
            {isConstruction&&l.sub_category&&` · ${getSubCat(l.sub_category)?.[lang==="fr"?"fr":"en"]?.split("(")[0]?.trim()}`}
          </div>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
            fontSize:14, fontWeight:400, color:C.navy, lineHeight:1.3,
            margin:"2px 0 3px", overflow:"hidden",
            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{l.title}</h3>
          <div style={{ fontFamily:"'Cormorant Garamond',serif",
            color:C.gold, fontSize:13, fontWeight:600, marginBottom:2 }}>{l.price}</div>
          {isConstruction&&l.price_unit&&(
            <div style={{ marginBottom:3 }}>
              <PriceUnitBadge priceUnit={l.price_unit} subCategory={l.sub_category} lang={lang}/>
            </div>
          )}
          <div style={{ color:C.mist, fontSize:10, marginBottom:3 }}>📍 {l.location}</div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Stars rating={l.rating} size={10} showCount count={l.review_count}/>
            {l.fast_reply&&<span style={{ fontSize:8, color:C.verified, fontWeight:700 }}>⚡</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:6, marginTop:8 }}>
          <a href={`https://wa.me/${l.whatsapp}?text=${waMsg}`}
            target="_blank" rel="noreferrer"
            style={{ flex:1, background:"#25D366", color:"#fff", textDecoration:"none",
              borderRadius:7, padding:"8px 0", fontSize:10, fontWeight:700,
              display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}>
            💬 WA
          </a>
          <button onClick={onOpen}
            style={{ flex:2, background:C.navy, color:"#fff", border:"none",
              borderRadius:7, padding:"8px 0", fontSize:10, fontWeight:700, cursor:"pointer" }}>
            {lang==="fr"?"Voir Détails":"View Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
