import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/node";
import { ENV } from "./env.js";

// initialize Arcjet with security rules
export const aj = arcjet({
  key: ENV.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    // shield protects your app from common attacks e.g. SQL injection, XSS, CSRF attacks
    shield({ mode: "LIVE" }),

    // bot detection - more permissive configuration
    detectBot({
      mode: "DRY_RUN", // Changed from MONITOR to DRY_RUN - only LIVE or DRY_RUN are valid
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:BROWSER", // Allow regular browsers
        "CATEGORY:SECURITY", // Allow security tools
        "CATEGORY:MONITORING", // Allow monitoring tools
        // Common user agents
        "Mozilla/5.0",
        "Chrome",
        "Safari",
        "Firefox",
        "Edge",
        "Mobile",
        "Vercel",
        "ChatGPT",
        "OpenAI",
        // allow legitimate search engine bots
        // see full list at https://arcjet.com/bot-list
      ],
    }),

    // rate limiting with token bucket algorithm
    tokenBucket({
      mode: "LIVE",
      refillRate: 10, // tokens added per interval
      interval: 10, // interval in seconds (10 seconds)
      capacity: 15, // maximum tokens in bucket
    }),
  ],
});
