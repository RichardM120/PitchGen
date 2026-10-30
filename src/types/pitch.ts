import { z } from "zod";

// Single source of truth for a PitchGen deck. The AI extraction step must
// return JSON that passes PitchDeckSchema before it is stored or rendered.

const MediaUrl = z.string().optional().default("");

export const PitchDeckSchema = z.object({
  project_id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  // draft: only in the Studio. in_review: shared for notes. published: live for viewers.
  status: z.preprocess((v) => (v === "sent" ? "published" : v), z.enum(["draft", "in_review", "published"])).default("draft"),
  is_demo: z.boolean().optional().default(false),
  // How the deck renders. Same content, different page.
  layout: z.enum(["cinematic", "editorial", "onepager", "lookbook", "treatment"]).optional().default("cinematic"),
  security: z.object({
    // false = public link: anyone with the URL can open it, no passcode.
    is_password_protected: z.boolean().default(true),
    // Optional deck-specific passcode for a commissioner. The shared studio
    // passcode always works too.
    passcode: z.string().optional().default(""),
    watermark_recipient: z.string().optional().default(""),
  }),
  updated_at: z.string().optional(),
  // Per-pitch media library. Assets live here whether or not a section uses them.
  media: z
    .array(
      z.object({
        url: z.string(),
        kind: z.enum(["image", "video"]),
        name: z.string().default(""),
        credit: z.string().default(""),
        added_at: z.string().default(""),
      }),
    )
    .optional()
    .default([]),
  // Saved output of the reference finder.
  references: z
    .object({
      queries: z.array(z.object({ q: z.string(), why: z.string().default("") })).default([]),
      films: z.array(z.object({ title: z.string(), year: z.string().default(""), dp: z.string().default(""), why: z.string().default("") })).default([]),
      generated_at: z.string().default(""),
    })
    .optional()
    .default({ queries: [], films: [], generated_at: "" }),
  hero: z.object({
    title: z.string(),
    format: z.string(),
    genre: z.array(z.string()),
    comparables: z.string(),
    logline: z.string(),
    hero_image_url: MediaUrl,
    sizzle_video_url: MediaUrl,
  }),
  world_and_engine: z.object({
    synopsis: z.string(),
    the_engine: z.string(),
    why_now: z.string(),
    color_palette: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).min(2),
    mood_stills: z.array(
      z.object({
        url: MediaUrl,
        caption: z.string(),
        aspect_ratio: z.enum(["2.39:1", "16:9", "4:3"]).optional(),
      }),
    ),
  }),
  casting: z.array(
    z.object({
      character_name: z.string(),
      age_range: z.string(),
      archetype: z.string(),
      character_bio: z.string(),
      casting_notes: z.string(),
      actor_wishlist: z.array(
        z.object({
          name: z.string(),
          headshot_url: MediaUrl,
          credits_note: z.string(),
        }),
      ),
      audition_or_reel_url: MediaUrl,
    }),
  ),
  production: z.object({
    locations: z.array(
      z.object({
        name: z.string(),
        region: z.string(),
        visual_rationale: z.string(),
        image_url: MediaUrl,
      }),
    ),
    financials: z.object({
      indicative_budget_band: z.string(),
      uk_tax_relief_eligible: z.boolean(),
      // AVEC: 34% gross (c.25.5% net) film/HETV; 39% gross (c.29.25% net)
      // animation and children's; IFTC: 53% gross (c.39.75% net) for
      // qualifying independent films with core costs up to £15M.
      tax_relief_notes: z.string(),
      co_pro_opportunities: z.array(z.string()),
      existing_attachments_or_funding: z.string(),
    }),
  }),
  episodic_arc: z.array(
    z.object({
      episode_number: z.number().int().positive(),
      title: z.string(),
      hook: z.string(),
      synopsis: z.string(),
    }),
  ),
  team: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      company: z.string().optional(),
      bio: z.string(),
      notable_credits: z.array(z.string()),
      headshot_url: MediaUrl,
    }),
  ),
});

export type PitchDeckData = z.infer<typeof PitchDeckSchema>;
