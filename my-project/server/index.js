import "dotenv/config";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const app = express();
const port = Number(process.env.API_PORT || 3001);
const jwtSecret = process.env.JWT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be set to a random value of at least 32 characters.");
}

const dataDirectory = fileURLToPath(new URL("./data/", import.meta.url));
mkdirSync(dataDirectory, { recursive: true });
const db = new DatabaseSync(path.join(dataDirectory, "hipath.sqlite"));

app.use(express.json({ limit: "32kb" }));

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    mobile VARCHAR(10) NOT NULL,
    city TEXT NOT NULL,
    school TEXT,
    udise VARCHAR(11),
    subject TEXT,
    interest TEXT NOT NULL,
    description TEXT,
    role TEXT NOT NULL CHECK (role IN ('director', 'teacher', 'other')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

db.exec(createUsersTable);

function issueToken(user) {
  return jwt.sign({ sub: String(user.id) }, jwtSecret, { expiresIn: "8h" });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function authenticate(req, res, next) {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Please log in to continue." });

  try {
    req.userId = jwt.verify(token, jwtSecret).sub;
    return next();
  } catch {
    return res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
}

app.post("/api/auth/register", async (req, res, next) => {
  const {
    name, email, password, mobile, city, school = "", udise = "",
    subject = "", interest, description = "", role,
  } = req.body ?? {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedMobile = typeof mobile === "string" ? mobile.trim() : "";

  if (!name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@.]+$/.test(normalizedEmail) ||
      typeof password !== "string" || password.length < 8 ||
      !/^\d{10}$/.test(normalizedMobile) || !city?.trim() || !interest?.trim() ||
      !["director", "teacher", "other"].includes(role) ||
      (["director", "teacher"].includes(role) && !school?.trim()) ||
      (role === "teacher" && !subject?.trim()) ||
      (role === "other" && !description?.trim()) ||
      (role === "director" && udise && !/^\d{11}$/.test(udise))) {
    return res.status(400).json({ error: "Check the form fields. Passwords must be at least 8 characters." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = db.prepare(
      `INSERT INTO users (name, email, password_hash, mobile, city, school, udise, subject, interest, description, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id, name, email, role`,
    ).get(name.trim(), normalizedEmail, passwordHash, normalizedMobile, city.trim(), school.trim(), udise || null,
      subject.trim(), interest.trim(), description.trim(), role);
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.message?.includes("UNIQUE constraint failed: users.email")) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    return next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  const normalizedEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const { password } = req.body ?? {};
  if (!normalizedEmail || typeof password !== "string") {
    return res.status(400).json({ error: "Enter your email and password." });
  }

  try {
    const user = db.prepare(
      "SELECT id, name, email, role, password_hash FROM users WHERE email = ?",
    ).get(normalizedEmail);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/google", async (req, res, next) => {
  const credential = req.body?.credential;
  if (!googleClientId) return res.status(503).json({ error: "Google sign-in is not configured yet." });
  if (typeof credential !== "string" || !credential) {
    return res.status(400).json({ error: "Google did not return a valid sign-in credential." });
  }

  try {
    const verification = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!verification.ok) return res.status(401).json({ error: "Google sign-in could not be verified. Please try again." });
    const identity = await verification.json();
    if (identity.aud !== googleClientId || identity.iss !== "https://accounts.google.com" ||
        identity.email_verified !== "true" || !identity.email) {
      return res.status(401).json({ error: "Please sign in with a verified Google account." });
    }

    const user = db.prepare(
      "SELECT id, name, email, role FROM users WHERE email = ?",
    ).get(identity.email.trim().toLowerCase());
    if (!user) return res.status(404).json({ error: "No HiPATH account is registered with this Google email. Please sign up first." });
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/me", authenticate, async (req, res, next) => {
  try {
    const user = db.prepare(
      "SELECT id, name, email, role FROM users WHERE id = ?",
    ).get(req.userId);
    if (!user) return res.status(401).json({ error: "Account not found." });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
});

app.listen(port, () => console.log(`HiPATH API listening on http://localhost:${port}`));

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    db.close();
    process.exit(0);
  });
}
