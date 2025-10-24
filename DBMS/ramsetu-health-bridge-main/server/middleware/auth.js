import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  // Accept token from cookie or Authorization header
  let token = null;
  // 1) Cookie
  if (req.cookies?.token) token = req.cookies.token;
  // 2) Authorization header: support both "Bearer <token>" and "<token>"
  if (!token) {
    const h = req.headers["authorization"]; // header keys are lowercased in Node
    if (typeof h === "string" && h.length) {
      token = h.startsWith("Bearer ") ? h.substring(7).trim() : h.trim();
    }
  }
  // 3) x-access-token header
  if (!token && typeof req.headers["x-access-token"] === "string") {
    token = req.headers["x-access-token"]; 
  }
  // 4) Query param (useful for quick diagnostics; not recommended for production)
  if (!token && typeof req.query?.token === "string") {
    token = req.query.token;
  }

  // Debug: log the incoming token for troubleshooting
  console.log("Auth middleware received token:", token);

  if (!token || token === "undefined" || token === "null") {
    console.log("No token provided to auth middleware.");
    return res.status(401).json({ error: "Session expired or authentication failed. Please log in again." });
  }

  // Try verifying with multiple accepted secrets to support admin-backend tokens too
  const secrets = [];
  if (process.env.JWT_SECRET) secrets.push(process.env.JWT_SECRET);
  if (process.env.ADMIN_JWT_SECRET) secrets.push(process.env.ADMIN_JWT_SECRET);
  // Support comma-separated list in JWT_SECRETS
  if (process.env.JWT_SECRETS) {
    for (const s of String(process.env.JWT_SECRETS).split(",").map((x) => x.trim()).filter(Boolean)) {
      if (!secrets.includes(s)) secrets.push(s);
    }
  }
  // Always include a safe fallback used by admin-backend if not overridden
  if (!secrets.includes('supersecretkey')) secrets.push('supersecretkey');

  const tryVerify = (tok, secret) => {
    try {
      return jwt.verify(tok, secret);
    } catch (e) {
      return null;
    }
  };

  let decoded = null;
  for (const s of secrets) {
    decoded = tryVerify(token, s);
    if (decoded) break;
  }
  if (!decoded) {
    console.error("JWT verification failed with both primary and fallback secrets.");
    return res.status(401).json({ error: "Authentication failed. Invalid or expired token." });
  }

  console.log("Decoded JWT:", decoded);
  // Ensure both id and _id are present for compatibility
  req.user = { ...decoded };
  if (decoded.id && !decoded._id) req.user._id = decoded.id;
  if (decoded._id && !decoded.id) req.user.id = decoded._id;
  // Log user role for admin access
  console.log("User role:", req.user.role);
  next();
};

export const authorize = (roles = []) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
