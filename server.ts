import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "users_node_db.json");

// Parse JSON bodies
app.use(express.json());

// Helper to initialize and read database
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  createdAt: string;
}

const defaultUsers: User[] = [
  {
    id: "1",
    name: "Alice Smith",
    email: "alice@example.com",
    phone: "123-456-7890",
    city: "New York",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "234-567-8901",
    city: "San Francisco",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    phone: "345-678-9012",
    city: "Chicago",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@amazon.com",
    phone: "456-789-0123",
    city: "Boston",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function readDB(): User[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultUsers, null, 2), "utf8");
      return defaultUsers;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading db file, returning empty array", err);
    return [];
  }
}

function writeDB(users: User[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing db file", err);
  }
}

// REST API Endpoints

// GET /api/users - Get all users
app.get("/api/users", (req, res) => {
  const users = readDB();
  res.json(users);
});

// GET /api/stats - Get user statistics
app.get("/api/stats", (req, res) => {
  const users = readDB();
  const totalUsers = users.length;
  
  // Count by city
  const cityCounts: Record<string, number> = {};
  users.forEach((user) => {
    const city = user.city.trim() || "Unknown";
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  const citySummary = Object.entries(cityCounts).map(([city, count]) => ({
    city,
    count,
  }));

  res.json({
    totalUsers,
    citySummary,
  });
});

// POST /api/users - Add a new user
app.post("/api/users", (req, res) => {
  const { name, email, phone, city } = req.body;

  // Simple server side validation
  if (!name || !email || !phone || !city) {
    return res.status(400).json({ error: "All fields (name, email, phone, city) are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const users = readDB();
  
  // Check if email already exists (case-insensitive check)
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
     return res.status(400).json({ error: `A user with email ${email} already exists.` });
  }

  const newUser: User = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    city: city.trim(),
    createdAt: new Date().toISOString(),
  };

  users.unshift(newUser); // Add to the beginning of the list
  writeDB(users);

  res.status(201).json({ message: "User added successfully!", user: newUser });
});

// PUT /api/users/:id - Edit an existing user
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone, city } = req.body;

  if (!name || !email || !phone || !city) {
    return res.status(400).json({ error: "All fields (name, email, phone, city) are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const users = readDB();
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  // Check if updated email conflicts with another user's email
  const emailConflict = users.some((u) => u.id !== id && u.email.toLowerCase() === email.toLowerCase());
  if (emailConflict) {
    return res.status(400).json({ error: `The email ${email} is already in use by another user.` });
  }

  users[index] = {
    ...users[index],
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    city: city.trim(),
  };

  writeDB(users);
  res.json({ message: "User updated successfully!", user: users[index] });
});

// DELETE /api/users/:id - Delete a user
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const users = readDB();
  const initialCount = users.length;
  const filteredUsers = users.filter((user) => user.id !== id);

  if (filteredUsers.length === initialCount) {
    return res.status(404).json({ error: "User not found." });
  }

  writeDB(filteredUsers);
  res.json({ message: "User deleted successfully!" });
});


// Configure Vite middleware or serve static dist folder
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
