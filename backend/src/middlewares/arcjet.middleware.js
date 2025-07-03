import { aj } from "../config/arcjet.js";

// Arcjet middleware for rate limiting, bot protection, and security

export const arcjetMiddleware = async (req, res, next) => {
  try {
    // Log user agent for debugging
    const userAgent = req.headers['user-agent'];
    console.log(`Request from user agent: ${userAgent}`);
    
    const decision = await aj.protect(req, {
      requested: 1, // each request consumes 1 token
    });

    // Log decision details for debugging
    if (decision.isDenied()) {
      console.log('Arcjet denied request:', {
        reason: decision.reason,
        userAgent: userAgent,
        ip: req.ip || req.headers['x-forwarded-for'],
      });
    }

    // handle denied requests
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
        });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({
          error: "Bot access denied",
          message: "Automated requests are not allowed.",
          details: "If you are a legitimate user, please contact support."
        });
      } else {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied by security policy.",
          details: decision.reason.toString()
        });
      }
    }

    // check for spoofed bots
    if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
      console.log('Spoofed bot detected:', {
        userAgent: userAgent,
        ip: req.ip || req.headers['x-forwarded-for'],
      });
      
      return res.status(403).json({
        error: "Spoofed bot detected",
        message: "Malicious bot activity detected.",
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    // allow request to continue if Arcjet fails
    next();
  }
};
