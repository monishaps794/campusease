import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

/** ✅ Base Token Verification */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

/** ✅ Admin Guard (Allows: role: "admin" OR isAdmin: true) */
export const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Key Fix ✅ Accept both admin representations
    if (decoded.role === "admin" || decoded.isAdmin === true) {
      req.user = decoded;
      return next();
    }

    return res.status(403).json({ success: false, message: "Access denied: Admin only." });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};
