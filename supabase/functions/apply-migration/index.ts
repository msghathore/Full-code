import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface RequestBody {
  action: string;
}

async function applyMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Insert seed data for the three tiers
  const { data, error } = await supabase
    .from("pricing_tiers")
    .insert([
      {
        tier_name: "Basic",
        tier_level: 1,
        min_price: 25.0,
        max_price: 75.0,
        tagline: "Essential Beauty Services",
        description:
          "Perfect for quick touch-ups and essential maintenance. Get professional results without breaking the bank.",
        features: [
          "Standard service quality",
          "Quick appointment times",
          "Basic product selection",
          "Professional staff",
          "Clean & safe environment",
          "Same-day availability",
        ],
        typical_services: [
          "Basic Manicure ($25)",
          "Basic Pedicure ($35)",
          "Simple Haircut ($45)",
          "Eyebrow Threading ($15)",
          "Basic Facial ($60)",
          "Express Massage (30min - $50)",
        ],
        upgrade_benefits: [
          "Upgrade to Premium for luxury products",
          "Get longer appointment times",
          "Access premium add-ons",
        ],
        is_most_popular: false,
        display_order: 1,
      },
      {
        tier_name: "Premium",
        tier_level: 2,
        min_price: 75.0,
        max_price: 150.0,
        tagline: "Elevated Experience",
        description:
          "The sweet spot between value and luxury. Enhanced services with premium products and extended care.",
        features: [
          "Premium product lines",
          "Extended appointment times",
          "Complimentary beverages",
          "Senior stylist selection",
          "Priority scheduling",
          "Relaxation amenities",
          "10% loyalty rewards",
          "Free consultation",
        ],
        typical_services: [
          "Deluxe Manicure with gel ($75)",
          "Spa Pedicure with massage ($85)",
          "Premium Cut & Style ($95)",
          "Deep Tissue Massage (60min - $120)",
          "Advanced Facial Treatment ($110)",
          "Microblading Session ($400)",
        ],
        upgrade_benefits: [
          "Upgrade to Luxury for VIP treatment",
          "Get exclusive products",
          "Access to master stylists",
        ],
        is_most_popular: true,
        display_order: 2,
      },
      {
        tier_name: "Luxury",
        tier_level: 3,
        min_price: 150.0,
        max_price: 500.0,
        tagline: "Ultimate Indulgence",
        description:
          "The pinnacle of pampering. Reserve our master artists, premium suites, and the finest products available.",
        features: [
          "Top-tier luxury products",
          "Private treatment suites",
          "Master stylist guaranteed",
          "Complimentary spa amenities",
          "Concierge service",
          "Premium refreshments",
          "Extended after-care",
          "15% loyalty rewards",
          "VIP priority access",
          "Personalized treatment plans",
          "Luxury gift with service",
        ],
        typical_services: [
          "Luxury Nail Art Experience ($150+)",
          "Full Hair Transformation ($200+)",
          "Hot Stone Massage (90min - $180)",
          "Luxury Facial with LED ($200)",
          "Full PMU Session ($500)",
          "Bridal Package ($350+)",
        ],
        upgrade_benefits: [
          "The ultimate salon experience",
          "No upgrades needed - this is the best",
          "VIP member perks & exclusive events",
        ],
        is_most_popular: false,
        display_order: 3,
      },
    ])
    .select();

  if (error) {
    throw new Error(`Failed to insert seed data: ${error.message}`);
  }

  return data;
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as RequestBody;

    if (body.action === "apply-migration") {
      const result = await applyMigration();
      return new Response(
        JSON.stringify({
          success: true,
          message: "Migration applied and seed data inserted successfully",
          result,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown action" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
