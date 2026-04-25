import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

dotenv.config();

if (process.env.NODE_ENV !== "development") {
  console.error("Seed script can only run when NODE_ENV=development");
  process.exit(1);
}

// Import app modules via relative paths (no TS path aliases in plain node).
const { default: connectDB } = await import("../src/lib/db.js");
const { default: User } = await import("../src/models/User.js");

const USERS = [
  {
    name: "admin",
    email: "admin@example.com",
    password: "Password@123",
    role: "admin",
  },
  {
    name: "user",
    email: "user@example.com",
    password: "Password@123",
    role: "user",
  },
];

async function upsertUser(u) {
  const email = u.email.toLowerCase();
  const hashed = await bcrypt.hash(u.password, 10);

  const existing = await User.findOne({ email });
  if (!existing) {
    const created = await User.create({
      name: u.name,
      email,
      password: hashed,
      role: u.role,
    });
    return { action: "created", id: created._id.toString(), email };
  }

  existing.name = u.name;
  existing.role = u.role;
  existing.password = hashed; // keep deterministic for dev
  await existing.save();

  return { action: "updated", id: existing._id.toString(), email };
}

async function main() {
  await connectDB();

  const results = [];
  for (const u of USERS) {
    results.push(await upsertUser(u));
  }

  console.log("Seeded dev users:");
  for (const r of results) console.log(`- ${r.action}: ${r.email} (${r.id})`);
}

try {
  await main();
} finally {
  await mongoose.disconnect().catch(() => {});
}

