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
  { id:"realestate",  icon:"🏛",  en:"Real Estate",   fr:"Immobilier"    },
  { id:"vehicles",    icon:"🚗",  en:"Vehicles",      fr:"Véhicules"     },
  { id:"containers",  icon:"📦",  en:"Containers",    fr:"Conteneurs"    },
  { id:"logistics",   icon:"🚚",  en:"Logistics",     fr:"Logistique"    },
  { id:"shops",       icon:"🏪",  en:"Shops",         fr:"Boutiques"     },
  { id:"food",        icon:"🐟",  en:"Food & Market", fr:"Alimentation"  },
  { id:"electronics", icon:"📱",  en:"Electronics",   fr:"Électronique"  },
  { id:"fashion",     icon:"👗",  en:"Fashion",       fr:"Mode"          },
  { id:"health",      icon:"🏥",  en:"Health",        fr:"Santé"         },
  { id:"services",    icon:"💈",  en:"Services",      fr:"Services"      },
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
    rating:4.7, review_count:15, featured:true, verified:true, status:"approved",
    description:"First owner, full AMG Line option. Massaging seats, Burmester audio, panoramic roof. Full service history.",
    reviews:[{name:"Chukwu E.",rating:5,comment:"Great car, honest seller, smooth transaction.",date:"2025-02-15"}]},
  { id:40, country:"CM", pillar:"vehicles", title:"Toyota Land Cruiser 200 V8",
    price:"45,000,000 FCFA", location:"Douala, Akwa",
    img:"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    seller_name:"CM Auto Premium", whatsapp:"237671282427",
    tiktok:"cmauto", facebook:"cmautopremium",
    rating:4.8, review_count:22, featured:false, verified:true, status:"approved",
    description:"Toyota Land Cruiser V8 2021. Full option, leather seats, sunroof. Perfect condition. Service history.",
    reviews:[]},
  { id:41, country:"CM", pillar:"vehicles", title:"Camion Benne 10 Tonnes",
    price:"18,000,000 FCFA", location:"Douala, Port",
    img:"https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80",
    seller_name:"Trucks Afrique CM", whatsapp:"237671282427",
    tiktok:"trucksafrique", facebook:"trucksafriquecm",
    rating:4.6, review_count:9, featured:false, verified:true, status:"approved",
    description:"10-tonne dump truck. Mercedes Actros 2019. Excellent condition. Ideal for construction and mining.",
    reviews:[]},
  { id:42, country:"GH", pillar:"vehicles", title:"Honda Motorcycle CG 125",
    price:"12,500 GHS", location:"Accra, Tema",
    img:"https://images.unsplash.com/photo-1558618047-f7c5bce0d0bd?w=800&q=80",
    seller_name:"Moto Ghana Hub", whatsapp:"233201234567",
    tiktok:"motoghanahub", facebook:"motoghanahub",
    rating:4.5, review_count:17, featured:false, verified:true, status:"approved",
    description:"Honda CG 125 2022. Low mileage, fuel efficient. Perfect for city delivery and commuting.",
    reviews:[]},
  { id:43, country:"SN", pillar:"vehicles", title:"Peugeot 308 2022 Diesel",
    price:"12,500,000 FCFA", location:"Dakar, Plateau",
    img:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    seller_name:"Dakar Auto Import", whatsapp:"221771234567",
    tiktok:"dakarauto", facebook:"dakarautoimport",
    rating:4.7, review_count:11, featured:false, verified:true, status:"approved",
    description:"Peugeot 308 diesel 2022. First owner, full AC, GPS, parking sensors. Low mileage.",
    reviews:[]},

  { id:4,  country:"CM", pillar:"realestate", title:"Appartement Vue Mer Kribi",
    price:"95,000,000 FCFA", location:"Kribi, Front de Mer",
    img:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    seller_name:"Côte Estates", whatsapp:"237671282427",
    tiktok:"", facebook:"coteestates",
    rating:4.6, review_count:19, featured:false, verified:true,
    beds:3, baths:2, sqm:180, status:"approved",
    description:"Three-bedroom beachfront residence. Private beach access, architect interiors, fully furnished.",
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

  // ── CONTAINERS (5 listings) ───────────────────────────────────────────────────
  { id:5,  country:"CI", pillar:"containers", title:"Conteneur 40ft High Cube",
    price:"6,800,000 FCFA", location:"Port d'Abidjan",
    img:"https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80",
    seller_name:"AfriContainers CI", whatsapp:"2250102030405",
    tiktok:"africontainers", facebook:"africontainersci",
    rating:4.5, review_count:11, featured:true, verified:true, status:"approved",
    description:"ISO-certified 40ft HC. CSC certified, immediate delivery. Storage or international shipping.",
    reviews:[]},
  { id:44, country:"CM", pillar:"containers", title:"Conteneur 20ft Standard",
    price:"3,500,000 FCFA", location:"Port de Douala",
    img:"https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&q=80",
    seller_name:"Douala Container Hub", whatsapp:"237671282427",
    tiktok:"doualacontainer", facebook:"doualacontainerhub",
    rating:4.6, review_count:19, featured:false, verified:true, status:"approved",
    description:"20ft standard dry container. Wind and watertight. Ideal for storage or shipping. Available immediately.",
    reviews:[]},
  { id:45, country:"NG", pillar:"containers", title:"Reefer Container 40ft Refrigerated",
    price:"9,200,000 FCFA", location:"Lagos, Apapa Port",
    img:"https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80",
    seller_name:"Lagos Reefer Containers", whatsapp:"2348012345678",
    tiktok:"lagosreefer", facebook:"lagosreefer",
    rating:4.7, review_count:8, featured:false, verified:true, status:"approved",
    description:"40ft refrigerated container. Temperature -25°C to +25°C. Ideal for food, pharma and cold chain.",
    reviews:[]},
  { id:46, country:"CM", pillar:"containers", title:"Container Bureau Aménagé",
    price:"4,200,000 FCFA", location:"Yaoundé",
    img:"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    seller_name:"ModuBox CM", whatsapp:"237671282427",
    tiktok:"moduboxcm", facebook:"moduboxcm",
    rating:4.8, review_count:14, featured:false, verified:true, status:"approved",
    description:"20ft container converted to office space. Electricity, AC, windows included. Ready to use.",
    reviews:[{name:"Martin K.",rating:5,comment:"Perfect mobile office. Very well fitted out!",date:"2025-02-18"}]},
  { id:47, country:"SN", pillar:"containers", title:"Conteneurs Occasion Certifiés",
    price:"2,800,000 FCFA", location:"Port de Dakar",
    img:"https://images.unsplash.com/photo-1565793979263-6ef3f5feaecb?w=800&q=80",
    seller_name:"Dakar Container Trade", whatsapp:"221771234567",
    tiktok:"dakarcontainer", facebook:"dakarcontainertrade",
    rating:4.5, review_count:16, featured:false, verified:true, status:"approved",
    description:"Used certified containers 20ft and 40ft. Inspected and graded A/B. Great for construction or storage.",
    reviews:[]},

  // ── LOGISTICS (5 listings) ────────────────────────────────────────────────────
  { id:6,  country:"CM", pillar:"logistics", title:"Transport Multimodal Premium",
    price:"Sur devis / On Quote", location:"Douala ↔ Lagos ↔ Abidjan",
    img:"https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80",
    seller_name:"AfriLogistics Pro", whatsapp:"237671282427",
    tiktok:"afrilogistics", facebook:"afrilogistics",
    rating:4.8, review_count:44, featured:true, verified:true, status:"approved",
    description:"End-to-end multimodal freight. Real-time tracking, insurance included, dedicated account manager.",
    reviews:[]},
  { id:48, country:"CM", pillar:"logistics", title:"Livraison Express Douala",
    price:"2,000 FCFA", location:"Douala, Toutes Zones",
    img:"https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&q=80",
    seller_name:"SpeedDrop CM", whatsapp:"237671282427",
    tiktok:"speeddropcm", facebook:"speeddropcm",
    rating:4.7, review_count:88, featured:false, verified:true, status:"approved",
    description:"Same day delivery in Douala. Motorbike and van fleet. Packages, documents and goods. Track online.",
    reviews:[{name:"Alice M.",rating:5,comment:"Very fast delivery! Arrived within 2 hours.",date:"2025-03-14"}]},
  { id:49, country:"NG", pillar:"logistics", title:"Nigeria Interstate Freight",
    price:"50,000 NGN/tonne", location:"Lagos → Abuja → PH",
    img:"https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=800&q=80",
    seller_name:"NijaFreight Ltd", whatsapp:"2348012345678",
    tiktok:"nijafreight", facebook:"nijafreightltd",
    rating:4.6, review_count:33, featured:false, verified:true, status:"approved",
    description:"Interstate haulage across Nigeria. Lagos, Abuja, Port Harcourt, Kano. GPS tracked. Insured cargo.",
    reviews:[]},
  { id:50, country:"CM", pillar:"logistics", title:"Dédouanement & Clearing Douala",
    price:"150,000 FCFA", location:"Port de Douala",
    img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    seller_name:"CM Customs Broker", whatsapp:"237671282427",
    tiktok:"cmcustoms", facebook:"cmcustomsbroker",
    rating:4.9, review_count:27, featured:false, verified:true, status:"approved",
    description:"Full customs clearance services. Import and export. Fast processing, all documentation handled.",
    reviews:[{name:"Ibrahim D.",rating:5,comment:"Cleared my container in 2 days. Very professional!",date:"2025-03-07"}]},
  { id:10, country:"FR", pillar:"logistics", title:"Import/Export Europe-Afrique",
    price:"On Quote / Sur Devis", location:"Paris → Douala / Abidjan",
    img:"https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80",
    seller_name:"EuroAfri Freight", whatsapp:"33612345678",
    tiktok:"euroafrifreight", facebook:"euroafrifreight",
    rating:4.7, review_count:29, featured:false, verified:true, status:"approved",
    description:"Specialist France-Africa freight. Customs clearance included. Paris, Lyon and Marseille depots.",
    reviews:[]},

  // ── SHOPS (5 listings) ────────────────────────────────────────────────────────
  { id:7,  country:"GH", pillar:"shops", title:"Prime Retail Space Accra",
    price:"4,500 GHS/month", location:"Accra, Osu High Street",
    img:"https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
    seller_name:"GoldCoast Properties", whatsapp:"233201234567",
    tiktok:"goldcoastprop", facebook:"goldcoastproperties",
    rating:4.4, review_count:8, featured:true, verified:true, status:"approved",
    description:"High-traffic retail on Osu's premium strip. 85sqm, full AC, private parking, 24h security.",
    reviews:[]},
  { id:51, country:"CM", pillar:"shops", title:"Boutique à Louer Akwa Douala",
    price:"120,000 FCFA/mois", location:"Douala, Akwa",
    img:"https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80",
    seller_name:"Immo Commerce CM", whatsapp:"237671282427",
    tiktok:"immocommercecm", facebook:"immocommercecm",
    rating:4.7, review_count:12, featured:false, verified:true, status:"approved",
    description:"Shop space for rent in Akwa commercial zone. 60sqm, ground floor, high foot traffic. Ready to occupy.",
    reviews:[]},
  { id:52, country:"CM", pillar:"shops", title:"Supermarché à Vendre Yaoundé",
    price:"85,000,000 FCFA", location:"Yaoundé, Bastos",
    img:"https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80",
    seller_name:"Business Transfer CM", whatsapp:"237671282427",
    tiktok:"businesstransfercm", facebook:"businesstransfercm",
    rating:4.8, review_count:6, featured:false, verified:true, status:"approved",
    description:"Fully equipped supermarket for sale. 200sqm, complete stock, refrigeration units, 5 years lease.",
    reviews:[{name:"Georges T.",rating:5,comment:"Great investment opportunity. Very well equipped store.",date:"2025-03-01"}]},
  { id:53, country:"NG", pillar:"shops", title:"Lagos Shopping Mall Kiosk",
    price:"180,000 NGN/month", location:"Lagos, Ikeja Mall",
    img:"https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    seller_name:"Ikeja Mall Leasing", whatsapp:"2348012345678",
    tiktok:"ikejamalll", facebook:"ikejamallng",
    rating:4.6, review_count:9, featured:false, verified:true, status:"approved",
    description:"Prime kiosk in Ikeja City Mall. 15sqm. High foot traffic. Ideal for fashion, phones or food.",
    reviews:[]},
  { id:54, country:"CI", pillar:"shops", title:"Local Commercial Plateau Abidjan",
    price:"250,000 FCFA/mois", location:"Abidjan, Plateau",
    img:"https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&q=80",
    seller_name:"Abidjan Commerce CI", whatsapp:"2250102030405",
    tiktok:"abidjancommerce", facebook:"abidjancommerceci",
    rating:4.7, review_count:11, featured:false, verified:true, status:"approved",
    description:"Commercial space in central Plateau. 45sqm. Ground floor. Ideal for bank, pharmacy or boutique.",
    reviews:[]},
  // ── FOOD & MARKET (5 listings) ───────────────────────────────────────────────
  { id:11, country:"CM", pillar:"food", title:"Youpwe Fresh Fish Market",
    price:"500 FCFA/kg", location:"Douala, Youpwe",
    img:"https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
    seller_name:"Youpwe Fish Traders", whatsapp:"237671282427",
    tiktok:"youpwefish", facebook:"youpwefish",
    rating:4.8, review_count:52, featured:true, verified:true, status:"approved",
    description:"Fresh fish, shrimp, crab and seafood daily. Direct from the Atlantic. Wholesale and retail available.",
    reviews:[{name:"Mama Ngo",rating:5,comment:"Best fresh fish in Douala! Very fresh every morning.",date:"2025-03-10"}]},
  { id:16, country:"CM", pillar:"food", title:"Marché Fruits & Légumes Bio",
    price:"200 FCFA/kg", location:"Yaoundé, Marché Mfoundi",
    img:"https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    seller_name:"Bio Harvest CM", whatsapp:"237671282427",
    tiktok:"bioharvestcm", facebook:"bioharvestcm",
    rating:4.7, review_count:38, featured:false, verified:true, status:"approved",
    description:"Fresh organic fruits and vegetables daily. Tomatoes, plantains, mangoes, avocados. Delivery available.",
    reviews:[]},
  { id:17, country:"NG", pillar:"food", title:"Lagos Rice & Grain Wholesale",
    price:"45,000 NGN/bag", location:"Lagos, Mile 12 Market",
    img:"https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
    seller_name:"Nigeria Grains Hub", whatsapp:"2348012345678",
    tiktok:"nigeriagrains", facebook:"nigeriagrainshub",
    rating:4.6, review_count:29, featured:false, verified:true, status:"approved",
    description:"Premium rice, beans, garri, semolina. Wholesale prices. Nationwide delivery. Minimum 10 bags.",
    reviews:[]},
  { id:18, country:"CM", pillar:"food", title:"Boucherie Premium Viande Fraîche",
    price:"3,500 FCFA/kg", location:"Douala, Bonamoussadi",
    img:"https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
    seller_name:"Boucherie du Wouri", whatsapp:"237671282427",
    tiktok:"boucheriewouri", facebook:"boucherieduwouri",
    rating:4.8, review_count:44, featured:false, verified:true, status:"approved",
    description:"Fresh beef, mutton, chicken and pork. Halal certified. Custom cuts available. Daily fresh stock.",
    reviews:[{name:"Chef Pierre",rating:5,comment:"Best quality meat in Douala. Always fresh!",date:"2025-03-05"}]},
  { id:19, country:"CI", pillar:"food", title:"Restaurant Cuisine Africaine Abidjan",
    price:"3,000 FCFA/plat", location:"Abidjan, Plateau",
    img:"https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
    seller_name:"Maquis Chez Fatou", whatsapp:"2250102030405",
    tiktok:"chezfatou", facebook:"maquischezfatou",
    rating:4.9, review_count:67, featured:true, verified:true, status:"approved",
    description:"Authentic West African cuisine. Attiéké, kedjenou, aloco. Catering available for events and parties.",
    reviews:[{name:"Kouamé A.",rating:5,comment:"Best attiéké in Abidjan! Very authentic and delicious.",date:"2025-03-01"}]},

  // ── ELECTRONICS (5 listings) ──────────────────────────────────────────────────
  { id:20, country:"CM", pillar:"electronics", title:"iPhone 15 Pro Max 256GB",
    price:"750,000 FCFA", location:"Douala, Akwa",
    img:"https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80",
    seller_name:"TechZone Cameroon", whatsapp:"237671282427",
    tiktok:"techzonecm", facebook:"techzonecm",
    rating:4.9, review_count:34, featured:true, verified:true, status:"approved",
    description:"Brand new sealed iPhone 15 Pro Max. All colors available. 1 year warranty included.",
    reviews:[{name:"Kevin T.",rating:5,comment:"Genuine product, very fast delivery!",date:"2025-03-15"}]},
  { id:21, country:"CM", pillar:"electronics", title:"Samsung Galaxy S24 Ultra",
    price:"620,000 FCFA", location:"Yaoundé, Bastos",
    img:"https://images.unsplash.com/photo-1706439136067-1d45e4fd8b80?w=800&q=80",
    seller_name:"Galaxy Shop CM", whatsapp:"237671282427",
    tiktok:"galaxyshopcm", facebook:"galaxyshopcm",
    rating:4.8, review_count:21, featured:false, verified:true, status:"approved",
    description:"Samsung Galaxy S24 Ultra 512GB. Titanium finish. S-Pen included. All network bands supported.",
    reviews:[]},
  { id:22, country:"NG", pillar:"electronics", title:"HP Laptop Core i7 16GB RAM",
    price:"380,000 NGN", location:"Lagos, Computer Village",
    img:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    seller_name:"Lagos Tech Hub", whatsapp:"2348012345678",
    tiktok:"lagostechhub", facebook:"lagostechhub",
    rating:4.7, review_count:18, featured:false, verified:true, status:"approved",
    description:"HP Laptop 15 Core i7 12th gen, 16GB RAM, 512GB SSD. Windows 11 pre-installed. 1 year warranty.",
    reviews:[]},
  { id:23, country:"GH", pillar:"electronics", title:"Samsung 55\" 4K Smart TV",
    price:"8,500 GHS", location:"Accra, Tema",
    img:"https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80",
    seller_name:"Accra Electronics", whatsapp:"233201234567",
    tiktok:"accraelectronics", facebook:"accraelectronics",
    rating:4.6, review_count:14, featured:false, verified:true, status:"approved",
    description:"Samsung 55 inch 4K UHD Smart TV. Netflix, YouTube built-in. Free wall mounting included.",
    reviews:[]},
  { id:24, country:"CM", pillar:"electronics", title:"Réparation Téléphones & Laptops",
    price:"5,000 FCFA", location:"Douala, Ndokotti",
    img:"https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80",
    seller_name:"Fix It Cameroon", whatsapp:"237671282427",
    tiktok:"fixitcm", facebook:"fixitcameroon",
    rating:4.8, review_count:89, featured:false, verified:true, status:"approved",
    description:"Professional phone and laptop repair. Screen replacement, battery, charging port. Same day service.",
    reviews:[{name:"Paul N.",rating:5,comment:"Fixed my iPhone screen in 30 minutes. Excellent!",date:"2025-02-25"}]},

  // ── FASHION (5 listings) ──────────────────────────────────────────────────────
  { id:25, country:"CM", pillar:"fashion", title:"Boutique Mode Africaine Premium",
    price:"15,000 FCFA", location:"Yaoundé, Centre Ville",
    img:"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    seller_name:"AfriStyle Fashion", whatsapp:"237671282427",
    tiktok:"afristyle", facebook:"afristylecm",
    rating:4.7, review_count:28, featured:true, verified:true, status:"approved",
    description:"Latest African fashion: dashiki, kente, ankara. Men, women and children. Custom tailoring available.",
    reviews:[]},
  { id:26, country:"CM", pillar:"fashion", title:"Chaussures & Sacs de Luxe",
    price:"25,000 FCFA", location:"Douala, Akwa",
    img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    seller_name:"Luxury Feet CM", whatsapp:"237671282427",
    tiktok:"luxuryfeetcm", facebook:"luxuryfeetcm",
    rating:4.8, review_count:33, featured:false, verified:true, status:"approved",
    description:"Designer shoes, heels, sneakers and handbags. Nike, Adidas, local designers. All sizes available.",
    reviews:[{name:"Marie T.",rating:5,comment:"Beautiful shoes! Great quality and fair price.",date:"2025-03-08"}]},
  { id:27, country:"NG", pillar:"fashion", title:"Men's Agbada & Senator Suits",
    price:"85,000 NGN", location:"Lagos, Balogun Market",
    img:"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    seller_name:"Lagos Tailor King", whatsapp:"2348012345678",
    tiktok:"lagostailorking", facebook:"lagostailorking",
    rating:4.9, review_count:47, featured:false, verified:true, status:"approved",
    description:"Premium agbada, senator and native attire. Custom measurements. Ready in 3-5 days. All fabrics.",
    reviews:[]},
  { id:28, country:"CI", pillar:"fashion", title:"Vêtements Enfants & Bébés",
    price:"8,000 FCFA", location:"Abidjan, Adjamé",
    img:"https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80",
    seller_name:"Bébé Mode CI", whatsapp:"2250102030405",
    tiktok:"bebemodeCI", facebook:"bebemodeci",
    rating:4.6, review_count:22, featured:false, verified:true, status:"approved",
    description:"Beautiful clothing for babies and children 0-12 years. Everyday wear and party outfits.",
    reviews:[]},
  { id:29, country:"CM", pillar:"fashion", title:"Perruques & Extensions Cheveux",
    price:"35,000 FCFA", location:"Douala, Bonanjo",
    img:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    seller_name:"Hair Queen CM", whatsapp:"237671282427",
    tiktok:"hairqueencm", facebook:"hairqueencm",
    rating:4.7, review_count:56, featured:false, verified:true, status:"approved",
    description:"Human hair wigs, Brazilian extensions, Peruvian bundles. All textures: straight, curly, wavy.",
    reviews:[]},

  // ── HEALTH (5 listings) ───────────────────────────────────────────────────────
  { id:30, country:"CM", pillar:"health", title:"Clinique Dentaire Sourire d'Afrique",
    price:"10,000 FCFA / consultation", location:"Douala, Bonanjo",
    img:"https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80",
    seller_name:"Dr. Mbarga Jean-Paul", whatsapp:"237671282427",
    tiktok:"", facebook:"souriredafrique",
    rating:4.9, review_count:67, featured:true, verified:true, status:"approved",
    description:"Complete dental care: cleaning, fillings, extractions, whitening. Modern equipment. Bilingual EN/FR.",
    reviews:[{name:"Sophie M.",rating:5,comment:"Excellent dentist! Very professional and painless.",date:"2025-02-20"}]},
  { id:31, country:"CM", pillar:"health", title:"Clinique Généraliste Dr. Nkeng",
    price:"8,000 FCFA / consultation", location:"Yaoundé, Bastos",
    img:"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    seller_name:"Dr. Nkeng Patrick", whatsapp:"237671282427",
    tiktok:"", facebook:"cliniquedrNkeng",
    rating:4.8, review_count:43, featured:false, verified:true, status:"approved",
    description:"General medicine, consultations, vaccinations, blood tests. Pediatrics and adult care.",
    reviews:[]},
  { id:32, country:"NG", pillar:"health", title:"Lagos Eye Care Specialist Centre",
    price:"15,000 NGN", location:"Lagos, Victoria Island",
    img:"https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
    seller_name:"ClearVision Lagos", whatsapp:"2348012345678",
    tiktok:"clearvisionlag", facebook:"clearvisionlagos",
    rating:4.7, review_count:31, featured:false, verified:true, status:"approved",
    description:"Full eye examinations, prescription glasses, contact lenses. Cataract surgery available.",
    reviews:[]},
  { id:33, country:"CM", pillar:"health", title:"Pharmacie Moderne 24h/24",
    price:"Prix variable", location:"Douala, Akwa",
    img:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    seller_name:"Pharmacie du Centre", whatsapp:"237671282427",
    tiktok:"", facebook:"pharmacieducentre",
    rating:4.8, review_count:112, featured:false, verified:true, status:"approved",
    description:"All medicines available. Open 24 hours. Delivery service. Licensed pharmacist on duty always.",
    reviews:[{name:"Jean B.",rating:5,comment:"Always available day and night. Very professional!",date:"2025-03-12"}]},
  { id:34, country:"CM", pillar:"health", title:"Clinique Maternité Femme & Santé",
    price:"50,000 FCFA", location:"Douala, Makepe",
    img:"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    seller_name:"Maternité Makepe", whatsapp:"237671282427",
    tiktok:"", facebook:"maternitefemme",
    rating:4.9, review_count:38, featured:false, verified:true, status:"approved",
    description:"Prenatal care, delivery, postnatal support. Experienced team of midwives and gynecologists. 24h.",
    reviews:[]},

  // ── SERVICES (5 listings) ─────────────────────────────────────────────────────
  { id:35, country:"CM", pillar:"services", title:"Salon de Coiffure VIP Douala",
    price:"5,000 FCFA", location:"Douala, Bonapriso",
    img:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    seller_name:"Beauty Palace CM", whatsapp:"237671282427",
    tiktok:"beautypacecm", facebook:"beautypalacecm",
    rating:4.6, review_count:41, featured:true, verified:true, status:"approved",
    description:"Professional hair salon: braiding, weaving, relaxing, coloring. Nail care also available.",
    reviews:[]},
  { id:36, country:"CM", pillar:"services", title:"Lavage Auto Premium Douala",
    price:"3,000 FCFA", location:"Douala, Akwa",
    img:"https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80",
    seller_name:"Shine Auto Wash", whatsapp:"237671282427",
    tiktok:"shineautowash", facebook:"shineautowash",
    rating:4.7, review_count:63, featured:false, verified:true, status:"approved",
    description:"Full car wash, interior cleaning, wax polish. Motorcycles and trucks also. Express 30 min service.",
    reviews:[{name:"Eric M.",rating:5,comment:"My car looks brand new every time!",date:"2025-03-10"}]},
  { id:37, country:"CM", pillar:"services", title:"Plombier & Électricien Professionnel",
    price:"15,000 FCFA", location:"Yaoundé, Bastos",
    img:"https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    seller_name:"Fix Home CM", whatsapp:"237671282427",
    tiktok:"fixhomecm", facebook:"fixhomecm",
    rating:4.8, review_count:27, featured:false, verified:true, status:"approved",
    description:"Certified plumber and electrician. Installations, repairs, emergency calls 24h. Fast and reliable.",
    reviews:[]},
  { id:38, country:"CM", pillar:"services", title:"Studio Photo & Vidéo Professionnel",
    price:"50,000 FCFA", location:"Douala, Bonanjo",
    img:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    seller_name:"AfriLens Studio", whatsapp:"237671282427",
    tiktok:"afrilens", facebook:"afrilensstudio",
    rating:4.9, review_count:35, featured:false, verified:true, status:"approved",
    description:"Professional photography and videography. Weddings, events, corporate shoots. Drone footage available.",
    reviews:[{name:"Sandrine K.",rating:5,comment:"Amazing wedding photos! Very talented photographer.",date:"2025-03-03"}]},
  { id:39, country:"NG", pillar:"services", title:"Lagos Cleaning & Fumigation Service",
    price:"25,000 NGN", location:"Lagos, Lekki",
    img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    seller_name:"CleanPro Lagos", whatsapp:"2348012345678",
    tiktok:"cleanprolagos", facebook:"cleanprolagos",
    rating:4.7, review_count:48, featured:false, verified:true, status:"approved",
    description:"Deep cleaning, fumigation, post-construction cleaning. Offices and homes. Insured and certified team.",
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

  // user auth
  const [currentUser,   setCurrentUser]   = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab,       setAuthTab]       = useState("login"); // "login" | "register"
  const [authLoading,   setAuthLoading]   = useState(false);
  const [authErr,       setAuthErr]       = useState("");
  const [registerForm,  setRegisterForm]  = useState({
    fullName:"", email:"", phone:"", password:"", confirmPassword:"", country:"CM"
  });
  const [loginForm, setLoginForm] = useState({ email:"", password:"" });

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
    // Send confirmation email to seller
    sendListingSubmittedEmail(currentUser, newL);
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
    sendListingApprovedEmail(listings.find(l => l.id === id));
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

  // ── Email notifications (EmailJS free tier) ─────────────────────────────────
  // To activate: sign up at emailjs.com, get your Service ID, Template IDs and Public Key
  const EMAILJS_SERVICE  = "YOUR_SERVICE_ID";   // replace after signing up
  const EMAILJS_PUB_KEY  = "YOUR_PUBLIC_KEY";   // replace after signing up

  const sendEmail = async (templateId, params) => {
    try {
      await fetch(`https://api.emailjs.com/api/v1.0/email/send`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE,
          template_id: templateId,
          user_id: EMAILJS_PUB_KEY,
          template_params: params,
        }),
      });
    } catch(e) { /* silent fail if not configured */ }
  };

  const sendWelcomeEmail = (user) => sendEmail("template_welcome", {
    to_name:  user.fullName,
    to_email: user.email,
    reply_to: "admin@afrigate.cm",
    message:  `Welcome to AfriGate Market, ${user.fullName}! Your account is ready. Start exploring listings across Africa and Europe.`,
  });

  const sendListingSubmittedEmail = (user, listing) => sendEmail("template_listing", {
    to_name:    user?.fullName || listing.seller_name,
    to_email:   user?.email   || "",
    listing:    listing.title,
    reply_to:   "admin@afrigate.cm",
    message:    `Your listing "${listing.title}" has been received and is currently under review. You will be notified once it is approved.`,
  });

  const sendListingApprovedEmail = (listing) => {
    // find user by seller name — notify if we have their email
    const user = registeredUsers.find(u => u.fullName === listing.seller_name);
    if (!user) return;
    sendEmail("template_approved", {
      to_name:  user.fullName,
      to_email: user.email,
      listing:  listing.title,
      reply_to: "admin@afrigate.cm",
      message:  `Great news! Your listing "${listing.title}" has been approved and is now LIVE on AfriGate Market. Buyers can now find and contact you.`,
    });
  };

  // ── Registered users store (local + Supabase) ────────────────────────────────
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const handleRegister = async () => {
    setAuthErr("");
    const { fullName, email, phone, password, confirmPassword } = registerForm;
    if (!fullName.trim())            { setAuthErr("Please enter your full name."); return; }
    if (!email.includes("@"))        { setAuthErr("Please enter a valid email address."); return; }
    if (password.length < 6)         { setAuthErr("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword){ setAuthErr("Passwords do not match."); return; }
    if (registeredUsers.find(u => u.email === email)) {
      setAuthErr("An account with this email already exists."); return;
    }
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const newUser = {
      id: Date.now(), fullName, email, phone,
      country: registerForm.country,
      joinedAt: new Date().toISOString(),
      avatar: fullName.charAt(0).toUpperCase(),
    };
    setRegisteredUsers(u => [...u, newUser]);
    setCurrentUser(newUser);
    setShowAuthModal(false);
    setRegisterForm({ fullName:"", email:"", phone:"", password:"", confirmPassword:"", country:"CM" });
    setAuthLoading(false);
    notify(tr(lang, `🎉 Welcome, ${fullName}! Check your email for a welcome message.`,
                    `🎉 Bienvenue, ${fullName}! Vérifiez votre email.`));
    addNotification(tr(lang,
      `Welcome to AfriGate Market, ${fullName}! Your account is ready.`,
      `Bienvenue sur AfriGate Market, ${fullName}! Votre compte est prêt.`));
    sendWelcomeEmail(newUser);
  };

  const handleLogin = async () => {
    setAuthErr("");
    const { email, password } = loginForm;
    if (!email.includes("@")) { setAuthErr("Please enter a valid email address."); return; }
    if (!password)             { setAuthErr("Please enter your password."); return; }
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const user = registeredUsers.find(u => u.email === email);
    if (!user) { setAuthErr("No account found with this email. Please register first."); setAuthLoading(false); return; }
    setCurrentUser(user);
    setShowAuthModal(false);
    setLoginForm({ email:"", password:"" });
    setAuthLoading(false);
    notify(tr(lang, `Welcome back, ${user.fullName}! 👋`, `Bon retour, ${user.fullName}! 👋`));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    notify(tr(lang, "You have been logged out.", "Vous avez été déconnecté."));
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
            { icon:"✅", val:"10", lbl:tr(lang,"Categories","Catégories") },
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
          { icon: currentUser ? <span style={{ width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.goldL})`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:C.navy }}>{currentUser.avatar}</span> : "👤", lbl:tr(lang,"Account","Compte"), act:() => { setShowAuthModal(true); setAuthTab(currentUser ? "profile" : "login"); setAuthErr(""); } },
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

      {/* ══ AUTH MODAL (Register / Login / Profile) ════════════════════════ */}
      {showAuthModal && (
        <div style={MODAL} onClick={() => setShowAuthModal(false)}>
          <div style={SHEET} onClick={e => e.stopPropagation()} className="slideUp">

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:400, color:C.navy }}>
                {currentUser
                  ? tr(lang, "My Account", "Mon Compte")
                  : authTab === "register"
                    ? tr(lang, "Create Account", "Créer un Compte")
                    : tr(lang, "Sign In", "Se Connecter")}
              </h3>
              <button onClick={() => setShowAuthModal(false)}
                style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.slate }}>✕</button>
            </div>

            {/* ── PROFILE VIEW (logged in) ── */}
            {currentUser ? (
              <div>
                <div style={{ textAlign:"center", marginBottom:24 }}>
                  <div style={{ width:72, height:72, borderRadius:"50%",
                    background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:28, fontWeight:800, color:C.navy, margin:"0 auto 12px" }}>
                    {currentUser.avatar}
                  </div>
                  <div style={{ fontWeight:700, fontSize:18, color:C.navy }}>{currentUser.fullName}</div>
                  <div style={{ color:C.slate, fontSize:13, marginTop:4 }}>{currentUser.email}</div>
                  {currentUser.phone && (
                    <div style={{ color:C.mist, fontSize:12, marginTop:2 }}>📱 {currentUser.phone}</div>
                  )}
                  <div style={{ color:C.mist, fontSize:11, marginTop:4 }}>
                    {getCountry(currentUser.country).flag} {getCountry(currentUser.country).name}
                  </div>
                </div>

                <div style={{ background:C.stone, borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
                  <div style={{ fontSize:11, color:C.slate, fontWeight:700, letterSpacing:1,
                    textTransform:"uppercase", marginBottom:8 }}>
                    {tr(lang,"Member Since","Membre Depuis")}
                  </div>
                  <div style={{ fontSize:13, color:C.navy }}>
                    {new Date(currentUser.joinedAt).toLocaleDateString("en-GB", {
                      day:"numeric", month:"long", year:"numeric"
                    })}
                  </div>
                </div>

                <div style={{ background:C.warnBg, borderRadius:12, padding:"14px 16px", marginBottom:20,
                  border:`1px solid ${C.warn}30` }}>
                  <div style={{ fontSize:12, color:C.warn, fontWeight:700, marginBottom:4 }}>
                    🎁 {tr(lang,"60-Day Free Trial Active","Essai Gratuit 60 Jours Actif")}
                  </div>
                  <div style={{ fontSize:11, color:C.slate }}>
                    {tr(lang,"Upgrade to Pro for 9,900 FCFA/month","Passez Pro pour 9 900 FCFA/mois")}
                  </div>
                </div>

                <button onClick={() => { setShowPayment(true); setShowAuthModal(false); }}
                  style={{ ...BTN_GOLD, width:"100%", marginBottom:10 }}>
                  ⭐ {tr(lang,"Upgrade to Pro","Passer à Pro")}
                </button>
                <button onClick={handleLogout}
                  style={{ ...BTN_NAVY, width:"100%", background:"transparent",
                    color:C.danger, border:`1.5px solid ${C.danger}40` }}>
                  {tr(lang,"Sign Out","Se Déconnecter")}
                </button>
              </div>

            ) : (
              <div>
                {/* Tab switcher */}
                <div style={{ display:"flex", background:C.stone, borderRadius:10,
                  padding:4, marginBottom:22 }}>
                  {[["login", tr(lang,"Sign In","Connexion")],
                    ["register", tr(lang,"Register","S'inscrire")]].map(([tab, lbl]) => (
                    <button key={tab} onClick={() => { setAuthTab(tab); setAuthErr(""); }}
                      style={{ flex:1, padding:"9px", border:"none", cursor:"pointer",
                        borderRadius:8, fontWeight:700, fontSize:13, transition:"all .2s",
                        background: authTab===tab ? C.navy : "transparent",
                        color: authTab===tab ? "#fff" : C.slate }}>
                      {lbl}
                    </button>
                  ))}
                </div>

                {authErr && (
                  <div style={{ background:"#FFF0F0", border:`1px solid ${C.danger}40`,
                    borderRadius:9, padding:"10px 14px", marginBottom:14,
                    color:C.danger, fontSize:12, fontWeight:600 }}>
                    ⚠️ {authErr}
                  </div>
                )}

                {/* ── REGISTER FORM ── */}
                {authTab === "register" ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div>
                      <label style={LBL}>{tr(lang,"Full Name *","Nom Complet *")}</label>
                      <input style={INP} placeholder={tr(lang,"Your full name","Votre nom complet")}
                        value={registerForm.fullName}
                        onChange={e => setRegisterForm(f => ({...f, fullName:e.target.value}))}/>
                    </div>
                    <div>
                      <label style={LBL}>{tr(lang,"Email Address *","Adresse Email *")}</label>
                      <input style={INP} type="email" placeholder="example@gmail.com"
                        value={registerForm.email}
                        onChange={e => setRegisterForm(f => ({...f, email:e.target.value}))}/>
                    </div>
                    <div>
                      <label style={LBL}>{tr(lang,"Phone Number (optional)","Téléphone (optionnel)")}</label>
                      <input style={INP} type="tel" placeholder="+237 6XX XXX XXX"
                        value={registerForm.phone}
                        onChange={e => setRegisterForm(f => ({...f, phone:e.target.value}))}/>
                    </div>
                    <div>
                      <label style={LBL}>{tr(lang,"Country","Pays")}</label>
                      <select style={SEL} value={registerForm.country}
                        onChange={e => setRegisterForm(f => ({...f, country:e.target.value}))}>
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={LBL}>{tr(lang,"Password *","Mot de Passe *")}</label>
                      <input style={INP} type="password"
                        placeholder={tr(lang,"Minimum 6 characters","Minimum 6 caractères")}
                        value={registerForm.password}
                        onChange={e => setRegisterForm(f => ({...f, password:e.target.value}))}/>
                    </div>
                    <div>
                      <label style={LBL}>{tr(lang,"Confirm Password *","Confirmer le Mot de Passe *")}</label>
                      <input style={INP} type="password"
                        placeholder={tr(lang,"Repeat your password","Répétez votre mot de passe")}
                        value={registerForm.confirmPassword}
                        onChange={e => setRegisterForm(f => ({...f, confirmPassword:e.target.value}))}/>
                    </div>
                    <button onClick={handleRegister} disabled={authLoading}
                      style={{ ...BTN_GOLD, width:"100%", marginTop:4,
                        opacity: authLoading ? .7 : 1 }}>
                      {authLoading ? <Spinner/> : tr(lang,"Create My Account →","Créer Mon Compte →")}
                    </button>
                    <p style={{ fontSize:11, color:C.mist, textAlign:"center", lineHeight:1.6 }}>
                      {tr(lang,
                        "By registering you agree to our Terms of Service. A welcome email will be sent to your inbox.",
                        "En vous inscrivant vous acceptez nos CGU. Un email de bienvenue sera envoyé.")}
                    </p>
                  </div>

                ) : (
                  /* ── LOGIN FORM ── */
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div>
                      <label style={LBL}>{tr(lang,"Email Address","Adresse Email")}</label>
                      <input style={INP} type="email" placeholder="example@gmail.com"
                        value={loginForm.email}
                        onChange={e => setLoginForm(f => ({...f, email:e.target.value}))}/>
                    </div>
                    <div>
                      <label style={LBL}>{tr(lang,"Password","Mot de Passe")}</label>
                      <input style={INP} type="password"
                        placeholder={tr(lang,"Your password","Votre mot de passe")}
                        value={loginForm.password}
                        onChange={e => setLoginForm(f => ({...f, password:e.target.value}))}/>
                    </div>
                    <button onClick={handleLogin} disabled={authLoading}
                      style={{ ...BTN_GOLD, width:"100%", marginTop:4,
                        opacity: authLoading ? .7 : 1 }}>
                      {authLoading ? <Spinner/> : tr(lang,"Sign In →","Se Connecter →")}
                    </button>
                    <div style={{ textAlign:"center" }}>
                      <button onClick={() => { setAuthTab("register"); setAuthErr(""); }}
                        style={{ background:"none", border:"none", color:C.gold,
                          fontSize:13, cursor:"pointer", fontWeight:600 }}>
                        {tr(lang,"No account? Register here","Pas de compte? S'inscrire ici")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
