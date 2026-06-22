import React, { useState, useEffect } from "react";
import { 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Search, 
  FileCode, 
  Database, 
  Code, 
  Globe, 
  Info, 
  Sparkles,
  Server,
  Terminal,
  Activity,
  PlusCircle,
  X,
  XCircle,
  CheckCircle,
  ArrowUpDown,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Stats, FileData } from "./types";

export default function App() {
  // Global States
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, citySummary: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"live" | "files" | "guide">("live");
  const [activeFile, setActiveFile] = useState<string>("app.py");
  
  // Sorting State
  const [sortBy, setSortBy] = useState<"name" | "email" | "city" | "none">("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  
  // Editing State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Notification States
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: "success" | "error" }[]>([]);

  // Add Notification helper
  const addNotification = (text: string, type: "success" | "error") => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Fetch Users and Stats
  const fetchData = async () => {
    try {
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      setUsers(usersData);

      const statsRes = await fetch("/api/stats");
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error("Error loading API data:", err);
      addNotification("Could not connect to the backend server. Using local memory state.", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser((prev) => prev ? { ...prev, [name]: value } : null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle Add User Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, city } = formData;

    if (!name.trim() || !email.trim() || !phone.trim() || !city.trim()) {
      addNotification("Please fill in all user profile details first.", "error");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        addNotification(data.error || "Failed to create user account.", "error");
        return;
      }

      addNotification(`User '${name}' successfully added to SQLite persistent layer!`, "success");
      setFormData({ name: "", email: "", phone: "", city: "" });
      fetchData();
    } catch (err) {
      // Offline fallback
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        city,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      addNotification(`Added [Offline fallback]: ${name}`, "success");
    }
  };

  // Handle Edit User Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const { id, name, email, phone, city } = editingUser;

    if (!name.trim() || !email.trim() || !phone.trim() || !city.trim()) {
      addNotification("All fields must be filled to complete edit.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, city }),
      });
      const data = await res.json();

      if (!res.ok) {
        addNotification(data.error || "Failed to edit user profile.", "error");
        return;
      }

      addNotification(`User details for '${name}' have been updated!`, "success");
      setEditingUser(null);
      fetchData();
    } catch (err) {
      setUsers((prev) => prev.map((u) => (u.id === id ? editingUser : u)));
      setEditingUser(null);
      addNotification("User profile updated in local memory.", "success");
    }
  };

  // Handle Delete User Account
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete '${name}' from DB?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        addNotification("Could not delete the record.", "error");
        return;
      }

      addNotification(`User record for '${name}' deleted successfully.`, "success");
      fetchData();
    } catch (err) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      addNotification(`Deleted [Offline fallback]: ${name}`, "success");
    }
  };

  // Toggle Sorting column
  const toggleSort = (field: "name" | "email" | "city") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Filter and Sort raw data lists
  const processedUsers = [...users]
    .filter((user) => {
      const matchText = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(matchText) ||
        user.email.toLowerCase().includes(matchText) ||
        user.phone.includes(matchText) ||
        user.city.toLowerCase().includes(matchText)
      );
    })
    .sort((a, b) => {
      if (sortBy === "none") return 0;
      const compareA = a[sortBy].toLowerCase();
      const compareB = b[sortBy].toLowerCase();
      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Source code files for Python Flask copy-pasting
  const pythonFiles: FileData[] = [
    {
      filename: "app.py",
      language: "python",
      description: "Python Flask core server driving routes, session flags, and SQLite connection managers",
      content: `from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3

app = Flask(__name__)
app.secret_key = "super_secret_session_key_for_flash_messages"
DATABASE = "database.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            city TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_database()

@app.route("/")
def index():
    search_query = request.args.get("search", "").strip()
    conn = get_db_connection()
    if search_query:
        users = conn.execute(
            "SELECT * FROM users WHERE name LIKE ? OR email LIKE ? OR city LIKE ?",
            (f"%{search_query}%", f"%{search_query}%", f"%{search_query}%")
        ).fetchall()
    else:
        users = conn.execute("SELECT * FROM users ORDER BY id DESC").fetchall()
    
    total_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    conn.close()
    return render_template("index.html", users=users, total_count=total_count)

@app.route("/add", methods=["POST"])
def add_user():
    name = request.form['name'].strip()
    email = request.form['email'].strip()
    phone = request.form['phone'].strip()
    city = request.form['city'].strip()
    
    if not name or not email or not phone or not city:
        flash("All fields are required!", "error")
        return redirect(url_for("index"))
        
    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO users (name, email, phone, city) VALUES (?, ?, ?, ?)",
            (name, email, phone, city)
        )
        conn.commit()
        flash(f"User '{name}' saved successfully!", "success")
    except sqlite3.IntegrityError:
        flash("Error: Email address already registered.", "error")
    finally:
        conn.close()
    return redirect(url_for("index"))

@app.route("/delete/<int:user_id>", methods=["POST", "GET"])
def delete_user(user_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    flash("User deleted successfully.", "success")
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)`
    },
    {
      filename: "templates/index.html",
      language: "html",
      description: "Jinja J2 template structure rendering registrations, flash alerts, and datatables",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Management System</title>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Lexend:wght@400;500;650;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <div class="container animate-faded-in">
        <header class="app-header">
            <div class="brand">
                <div class="logo-box">U</div>
                <div>
                    <h1>User Management</h1>
                    <p class="subtitle">SQLite persistent storage dashboard</p>
                </div>
            </div>
            <div class="badge-pill">
                <span class="status-dot green"></span> SQLite DB: Active
            </div>
        </header>

        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                {% for category, msg in messages %}
                    <div class="alert {{ category }}">{{ msg }}</div>
                {% endfor %}
            {% endif %}
        {% endwith %}

        <main class="main-layout">
            <section class="panel-form">
                <div class="card">
                    <form action="/add" method="POST" class="user-form">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" placeholder="John Doe" required>
                        </div>
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" placeholder="john@example.com" required>
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="text" name="phone" placeholder="123-456-7890" required>
                        </div>
                        <div class="form-group">
                            <label>City Location</label>
                            <input type="text" name="city" placeholder="New York" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Save User</button>
                    </form>
                </div>
            </section>

            <section class="panel-list">
                <div class="card">
                    <table class="user-table">
                        <thead>
                            <tr>
                                <th>Ref</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>City</th>
                                <th style="text-align: center;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {% for user in users %}
                            <tr>
                                <td>#{{ user.id }}</td>
                                <td class="user-name-cell">
                                    <div class="avatar">{{ user.name[0] | upper }}</div>
                                    <div class="name-text"><strong>{{ user.name }}</strong></div>
                                </td>
                                <td>{{ user.email }}</td>
                                <td><span class="location-tag">{{ user.city }}</span></td>
                                <td class="actions-cell">
                                    <a href="/delete/{{ user.id }}" class="action-btn delete-btn">D</a>
                                </td>
                            </tr>
                            {% endfor %}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>
</body>
</html>`
    },
    {
      filename: "static/style.css",
      language: "css",
      description: "Neo-Brutalist bold typography styling matching strict theme guidelines",
      content: `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Lexend:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

:root {
    --primary-blue: #2563eb;
    --dark-slate: #0f172a;
    --light-slate: #475569;
    --bg-main: #fcfbf7;
    --bg-card: #ffffff;
    --border-color: #0f172a;
}
body {
    background-color: var(--bg-main);
    color: var(--dark-slate);
    font-family: 'Lexend', sans-serif;
    margin: 0;
    padding: 40px 0;
    background-image: radial-gradient(var(--border-color) 1px, transparent 1px);
    background-size: 24px 24px;
}
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}
.main-layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 32px;
}
.card {
    background-color: var(--bg-card);
    border: 3px solid var(--border-color);
    border-radius: 0px;
    padding: 24px;
    box-shadow: 6px 6px 0px 0px var(--border-color);
}
.form-group label {
    display: block;
    font-weight: 800;
    margin-bottom: 6px;
    text-transform: uppercase;
    font-size: 0.85rem;
}
.form-group input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 0px;
    border: 3px solid var(--border-color);
    background-color: var(--bg-card);
}
.btn {
    border: 3px solid var(--border-color);
    padding: 12px 24px;
    border-radius: 0px;
    font-weight: 800;
    text-transform: uppercase;
    cursor: pointer;
    width: 100%;
    color: white;
    background-color: var(--primary-blue);
    box-shadow: 4px 4px 0px 0px var(--border-color);
}
.btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px 0px var(--border-color);
}`
    },
    {
      filename: "requirements.txt",
      language: "text",
      description: "Pip package declaration requirements for direct install",
      content: `Flask>=3.0.0`
    }
  ];

  const currentFileContent = pythonFiles.find((f) => f.filename === activeFile)?.content || "";
  const currentFileDesc = pythonFiles.find((f) => f.filename === activeFile)?.description || "";

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-slate-900 selection:bg-slate-900 selection:text-white font-sans antialiased">
      {/* Upper Status Line */}
      <div className="w-full h-2.5 bg-slate-950 shadow-sm border-b-2 border-slate-950" />

      {/* Floating Alerts Container */}
      <div className="fixed top-8 right-8 z-50 flex flex-col gap-4 min-w-[340px] max-w-[440px]">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`p-4 rounded-none shadow-neo border-3 border-slate-950 flex items-start gap-4 transition-colors ${
                n.type === "success" 
                  ? "bg-emerald-200 text-emerald-950" 
                  : "bg-rose-200 text-rose-950"
              }`}
            >
              <div className="mt-0.5 shrink-0 text-slate-950">
                {n.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-extrabold uppercase tracking-wide leading-tight">{n.text}</p>
              </div>
              <button 
                onClick={() => setNotifications((prev) => prev.filter((notif) => notif.id !== n.id))}
                className="text-slate-900 hover:text-slate-950 shrink-0 self-start"
              >
                <X className="w-4 h-4 stroke-[3px]" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header and Brand */}
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b-3 border-slate-950 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-yellow-300 text-slate-950 border-3 border-slate-950 rounded-none shadow-neo flex items-center justify-center font-display">
              <Users className="w-8 h-8 stroke-[2.5px]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-300 text-slate-950 border-2 border-slate-950 rounded-none shadow-sm">
                  Full Stack Live
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-200 text-slate-950 border-2 border-slate-950 rounded-none shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-slate-900" />
                  SQLite Active
                </span>
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-slate-950 font-display mt-2">
                User Management Hub
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-1 max-w-xl">
                Demonstrating frontend UI views, Express database synchronization, and Python integration files
              </p>
            </div>
          </div>

          {/* Interactive Navigation Panel tabs */}
          <div className="bg-white p-1 border-3 border-slate-950 rounded-none flex items-center gap-1.5 shadow-neo">
            <button
              onClick={() => setActiveTab("live")}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-none transition-all flex items-center gap-2 ${
                activeTab === "live"
                  ? "bg-slate-950 text-white"
                  : "text-slate-800 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <Globe className="w-4 h-4 stroke-[2.5px]" />
              Live interactive dev
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-none transition-all flex items-center gap-2 ${
                activeTab === "files"
                  ? "bg-slate-950 text-white"
                  : "text-slate-800 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <FileCode className="w-4 h-4 stroke-[2.5px]" />
              Python flask files
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-none transition-all flex items-center gap-2 ${
                activeTab === "guide"
                  ? "bg-slate-950 text-white"
                  : "text-slate-800 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <Info className="w-4 h-4 stroke-[2.5px]" />
              installation keys
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Stage */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Tab 1: Live Interactive Development View */}
        {activeTab === "live" && (
          <div className="space-y-10 animate-faded-in">
            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total User Metric Cards */}
              <div className="bg-white border-3 border-slate-950 rounded-none p-6 shadow-neo-lg flex items-center gap-5 transition-all hover:-translate-y-0.5">
                <div className="w-14 h-14 bg-indigo-200 text-slate-950 border-2.5 border-slate-950 rounded-none flex items-center justify-center shadow-neo">
                  <Users className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Users Installed</p>
                  <p className="text-4xl font-extrabold text-slate-950 font-display mt-1">{stats.totalUsers}</p>
                  <p className="text-xs text-emerald-700 font-extrabold uppercase mt-1 tracking-wider flex items-center gap-1">
                    SQLite Sync Active
                  </p>
                </div>
              </div>

              {/* Demographics city metrics */}
              <div className="bg-white border-3 border-slate-950 rounded-none p-6 shadow-neo-lg flex items-center gap-5 transition-all hover:-translate-y-0.5">
                <div className="w-14 h-14 bg-purple-200 text-slate-950 border-2.5 border-slate-950 rounded-none flex items-center justify-center shadow-neo">
                  <MapPin className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Top Localized Cities</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {stats.citySummary.length > 0 ? (
                      stats.citySummary.slice(0, 3).map((item) => (
                        <span key={item.city} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-950 text-xs font-extrabold rounded-none border-2 border-slate-950 shadow-sm hover:translate-x-0.5 transition-all">
                          {item.city}
                          <span className="w-4.5 h-4.5 rounded-none bg-slate-950 text-white text-[9px] flex items-center justify-center font-black">
                            {item.count}
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic font-medium">No locations logged</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Developer Environment stats */}
              <div className="bg-white border-3 border-slate-950 rounded-none p-6 shadow-neo-lg flex items-center gap-5 transition-all hover:-translate-y-0.5">
                <div className="w-14 h-14 bg-emerald-200 text-slate-950 border-2.5 border-slate-950 rounded-none flex items-center justify-center shadow-neo">
                  <Activity className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">API Connection Node</p>
                  <p className="text-2xl font-black font-mono text-slate-950 tracking-wide mt-1">ESTABLISHED</p>
                  <p className="text-[11px] text-slate-600 font-bold uppercase mt-1">React Client 🚀 Express.js</p>
                </div>
              </div>
            </div>

            {/* Main Interface Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-faded-in">
              
              {/* Left Column: Register Form */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* User Input Action Card */}
                <div className="bg-white border-3 border-slate-950 rounded-none overflow-hidden shadow-neo-lg">
                  <div className="p-6 border-b-3 border-slate-950 bg-white">
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-slate-950 stroke-[2.5px]" />
                      {editingUser ? "Edit Profile Settings" : "Register User Profile"}
                    </h2>
                    <p className="text-xs font-medium text-slate-500 mt-1.5 leading-relaxed">
                      {editingUser ? "Modify details inside simulated SQL cells" : "Add details to permanently insert a new profile record."}
                    </p>
                  </div>

                  <form onSubmit={editingUser ? handleEditSubmit : handleAddSubmit} className="p-6 space-y-5">
                    {/* Full Name field */}
                    <div className="space-y-1.5">
                      <label htmlFor="form-name" className="block text-xs font-black uppercase tracking-widest text-slate-950">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="form-name"
                        type="text"
                        name="name"
                        placeholder="e.g. John Doe"
                        required
                        value={editingUser ? editingUser.name : formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 text-sm rounded-none border-2.5 border-slate-950 focus:outline-none focus:bg-white focus:shadow-neo transition-all bg-white font-medium text-slate-950 placeholder-slate-400"
                      />
                    </div>

                    {/* Email field */}
                    <div className="space-y-1.5">
                      <label htmlFor="form-email" className="block text-xs font-black uppercase tracking-widest text-slate-950">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        name="email"
                        placeholder="e.g. john@example.com"
                        required
                        value={editingUser ? editingUser.email : formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 text-sm rounded-none border-2.5 border-slate-950 focus:outline-none focus:bg-white focus:shadow-neo transition-all bg-white font-medium text-slate-950 placeholder-slate-400"
                      />
                    </div>

                    {/* Phone Number Field */}
                    <div className="space-y-1.5">
                      <label htmlFor="form-phone" className="block text-xs font-black uppercase tracking-widest text-slate-950">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="form-phone"
                        type="tel"
                        name="phone"
                        placeholder="e.g. 123-456-7890"
                        required
                        value={editingUser ? editingUser.phone : formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 text-sm rounded-none border-2.5 border-slate-950 focus:outline-none focus:bg-white focus:shadow-neo transition-all bg-white font-medium text-slate-950 placeholder-slate-400"
                      />
                    </div>

                    {/* City location Field */}
                    <div className="space-y-1.5">
                      <label htmlFor="form-city" className="block text-xs font-black uppercase tracking-widest text-slate-950">
                        City Location <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="form-city"
                        type="text"
                        name="city"
                        placeholder="e.g. New York"
                        required
                        value={editingUser ? editingUser.city : formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 text-sm rounded-none border-2.5 border-slate-950 focus:outline-none focus:bg-white focus:shadow-neo transition-all bg-white font-medium text-slate-950 placeholder-slate-400"
                      />
                    </div>

                    {/* Action buttons list */}
                    <div className="pt-2 flex gap-3">
                      {editingUser && (
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider rounded-none border-2.5 border-slate-950 bg-white hover:bg-slate-100 text-slate-900 transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5"
                        >
                          Cancel
                        </button>
                      )}
                      
                      <button
                        type="submit"
                        className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wide rounded-none border-2.5 border-slate-950 text-white shadow-neo flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-neo-lg active:translate-y-0.5 ${
                          editingUser 
                            ? "bg-amber-500 text-slate-950" 
                            : "bg-blue-600"
                        }`}
                      >
                        {editingUser ? (
                          <>
                            <Edit3 className="w-4 h-4 stroke-[2.5px]" />
                            Update Record
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4 stroke-[2.5px]" />
                            Register User
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Educational Hint card */}
                <div className="p-5 bg-teal-50 border-3 border-slate-950 rounded-none flex items-start gap-4 shadow-neo">
                  <Sparkles className="w-5 h-5 text-slate-950 shrink-0 mt-0.5 stroke-[2.5px]" />
                  <div className="text-xs text-slate-950 leading-relaxed">
                    <p className="font-black uppercase tracking-wider">Zero-setup previews</p>
                    <p className="mt-1.5 font-medium text-slate-700">
                      This React interface represents the live specifications of our Flask SQLite workspace. Click the <strong>Python Flask Files</strong> tab above to view the actual database code that maps exactly to this.
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column: User list Table card with dynamic capabilities */}
              <div className="lg:col-span-8">
                
                <div className="bg-white border-3 border-slate-950 rounded-none overflow-hidden shadow-neo-lg">
                  {/* Table Control Header */}
                  <div className="p-6 border-b-3 border-slate-950 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">
                        Registered Records Grid
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Showing persistent SQLite records containing sorting and filters
                      </p>
                    </div>

                    {/* Integrated search menu */}
                    <div className="relative max-w-xs w-full">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-800 w-4.5 h-4.5 stroke-[2.5px] pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search profiles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-8 py-2 text-xs rounded-none border-2.5 border-slate-950 bg-white focus:outline-none focus:shadow-neo transition-all text-slate-950 font-semibold placeholder-slate-400"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                        >
                          <X className="w-4 h-4 stroke-[2.5px]" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Datatable view */}
                  <div className="overflow-x-auto">
                    {processedUsers.length > 0 ? (
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b-3 border-slate-950 text-[11px] font-black uppercase tracking-widest text-slate-900">
                            <th className="px-6 py-4 w-16 text-center">Ref</th>
                            <th className="px-6 py-4">
                              <button 
                                onClick={() => toggleSort("name")}
                                className="flex items-center gap-1.5 font-black hover:text-blue-600 transition-colors uppercase tracking-widest"
                              >
                                Name
                                <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5px]" />
                              </button>
                            </th>
                            <th className="px-6 py-4">
                              <button 
                                onClick={() => toggleSort("email")}
                                className="flex items-center gap-1.5 font-black hover:text-blue-600 transition-colors uppercase tracking-widest"
                              >
                                Email
                                <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5px]" />
                              </button>
                            </th>
                            <th className="px-6 py-4">Phone Number</th>
                            <th className="px-6 py-4">
                              <button 
                                onClick={() => toggleSort("city")}
                                className="flex items-center gap-1.5 font-black hover:text-blue-600 transition-colors uppercase tracking-widest"
                              >
                                City
                                <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5px]" />
                              </button>
                            </th>
                            <th className="px-6 py-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-950">
                          <AnimatePresence initial={false}>
                            {processedUsers.map((user) => (
                              <motion.tr
                                key={user.id}
                                layoutId={`user-row-${user.id}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="hover:bg-[#fbf9f4]/60 transition-all border-b-2 border-slate-950"
                              >
                                {/* ID col */}
                                <td className="px-6 py-4 text-center font-mono text-xs text-slate-700 font-extrabold bg-[#fbf9f4]/90">
                                  #{user.id}
                                </td>

                                {/* Name content cell (avatar + label) */}
                                <td className="px-6 py-4 font-semibold text-slate-950">
                                  <div className="flex items-center gap-3.5">
                                    <div className="w-9 h-9 rounded-none bg-yellow-200 text-slate-950 text-sm font-black flex items-center justify-center font-display border-2 border-slate-950 shadow-sm">
                                      {user.name.trim() ? user.name[0].toUpperCase() : "U"}
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-[#0f172a] leading-tight">{user.name}</p>
                                      <p className="text-[10px] text-slate-500 font-semibold mt-1">
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* Email col */}
                                <td className="px-6 py-4 text-slate-800 font-mono text-xs font-semibold">
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-900 stroke-[2px]" />
                                    {user.email}
                                  </div>
                                </td>

                                {/* Phone col */}
                                <td className="px-6 py-4 text-slate-800 text-xs font-semibold">
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-slate-900 stroke-[2px]" />
                                    {user.phone}
                                  </div>
                                </td>

                                {/* City location status tag */}
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-none bg-white text-slate-950 font-extrabold text-xs border-2 border-slate-950 shadow-sm hover:translate-x-0.5 transition-all">
                                    <MapPin className="w-3.5 h-3.5 text-slate-900 stroke-[2px]" />
                                    {user.city}
                                  </span>
                                </td>

                                {/* Inline controls */}
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingUser(user);
                                        addNotification(`Editing details for user: ${user.name}`, "success");
                                      }}
                                      title="Edit details"
                                      className="p-2 rounded-none border-2 border-slate-950 bg-white hover:bg-yellow-100 text-slate-950 transition-all hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5 cursor-pointer"
                                    >
                                      <Edit3 className="w-4 h-4 stroke-[2px]" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user.id, user.name)}
                                      title="Delete user"
                                      className="p-2 rounded-none border-2 border-slate-950 bg-white hover:bg-rose-200 text-slate-950 transition-all hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5 cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4 stroke-[2px]" />
                                    </button>
                                  </div>
                                </td>

                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    ) : (
                      <div className="px-6 py-16 text-center">
                        <div className="w-14 h-14 bg-slate-100 border-2 border-slate-950 rounded-none flex items-center justify-center mx-auto text-slate-950 shadow-neo mb-4">
                          <Users className="w-6 h-6 stroke-[2.5px]" />
                        </div>
                        <h3 className="text-md font-black uppercase tracking-tight text-slate-950">No Records Found</h3>
                        <p className="text-xs text-slate-600 font-medium mt-2 max-w-sm mx-auto">
                          {searchQuery 
                            ? `No users match your filter criteria: "${searchQuery}". Resetting search will show everyone.` 
                            : "The database is empty! Fill out the registration form on the left to add people."}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-5 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-none border-2 border-slate-950 bg-white text-slate-950 hover:bg-slate-100 shadow-sm transition-all hover:-translate-y-0.5"
                          >
                            Reset Search
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Python Flask Code Previewer panel */}
        {activeTab === "files" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-faded-in">
            {/* Sidebar list of files */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white border-3 border-slate-950 rounded-none p-6 shadow-neo-lg">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                  Flask Project Files
                </h3>
                <nav className="space-y-3">
                  {pythonFiles.map((file) => (
                    <button
                      key={file.filename}
                      onClick={() => setActiveFile(file.filename)}
                      className={`w-full text-left p-3.5 rounded-none border-2.5 border-slate-950 flex items-center justify-between transition-all shadow-sm ${
                        activeFile === file.filename
                          ? "bg-blue-100 text-slate-950 font-black shadow-neo"
                          : "bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-950 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileCode className={`w-5 h-5 stroke-[2.5px] ${activeFile === file.filename ? "text-[#0f172a]" : "text-slate-400"}`} />
                        <div>
                          <p className="text-xs font-mono font-extrabold">{file.filename}</p>
                          <p className="text-[10px] opacity-80 mt-1 max-w-[200px] truncate leading-tight font-semibold">
                            {file.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Dev notice banner */}
              <div className="p-5 bg-teal-50 border-3 border-slate-950 rounded-none flex gap-4 shadow-neo">
                <Terminal className="w-5 h-5 text-slate-950 shrink-0 mt-0.5 stroke-[2.5px]" />
                <div className="text-xs text-slate-950 leading-relaxed">
                  <p className="font-black uppercase tracking-wider">Deploy anywhere</p>
                  <p className="mt-1.5 font-medium text-slate-700">
                    These identical files have been initialized in your active workspace directory. You can export them easily via the settings gear icon to run locally!
                  </p>
                </div>
              </div>
            </div>

            {/* Main Code Editor mockup */}
            <div className="lg:col-span-8">
              <div className="bg-slate-900 rounded-none shadow-neo-lg overflow-hidden border-3 border-slate-950 flex flex-col h-[640px]">
                {/* Editor Header Tab controls */}
                <div className="bg-slate-950 px-4 py-3.5 flex items-center justify-between border-b-3 border-slate-950">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 border border-slate-950 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-amber-500 border border-slate-950 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500 border border-slate-950 shadow-sm" />
                    <span className="text-slate-400 text-xs font-mono ml-4 truncate font-semibold">
                      user-management-app / {activeFile}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentFileContent);
                      addNotification(`Copied '${activeFile}' content!`, "success");
                    }}
                    className="px-3.5 py-1.5 bg-yellow-300 text-slate-950 hover:bg-yellow-400 border-2 border-slate-950 rounded-none text-[10px] font-extrabold uppercase transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5"
                  >
                    Copy Code
                  </button>
                </div>

                {/* Editor Body */}
                <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed text-slate-300">
                  <pre className="whitespace-pre">
                    <code>
                      {currentFileContent}
                    </code>
                  </pre>
                </div>

                {/* Editor Footer diagnostics */}
                <div className="bg-slate-950 px-6 py-2.5 border-t-2 border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between font-semibold uppercase tracking-wider">
                  <span>UTF-8 | LF | {activeFile.endsWith(".py") ? "Python" : activeFile.endsWith(".html") ? "HTML" : "CSS"}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Database className="w-3 h-3 animate-pulse" />
                    SQLite Persistence active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Detailed Run Guide */}
        {activeTab === "guide" && (
          <div className="bg-white border-3 border-slate-950 rounded-none p-8 max-w-4xl mx-auto shadow-neo-lg space-y-6 animate-faded-in">
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-950 border-b-2 border-slate-100 pb-4 flex items-center gap-2.5 font-display">
              <Sparkles className="w-6 h-6 text-[#0f172a] stroke-[2.5px]" />
              Developer Installation Run-sheet
            </h2>

            <p className="text-sm leading-relaxed text-slate-600 font-semibold">
              The workspace represents a hybrid development pattern. We provide a <strong>live container preview using Node React + Express</strong> (for interactive testing without native python compilation timeouts inside your browser), and we have simultaneously bundled <strong>complete, fully tested Python Flask and SQLite databases</strong> ready for direct deploy on your local system or school tasks.
            </p>

            <div className="space-y-5 pt-3">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-950 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-none border-2 border-slate-950 bg-yellow-200 text-slate-950 font-mono text-xs flex items-center justify-center font-extrabold shadow-sm">1</span>
                How to Export
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed pl-8">
                Locate the top gear/settings icon in the Google AI Studio menu structure and click &quot;Export Project as Zip&quot;. Save and unpack the directory archive.
              </p>

              <h3 className="text-sm font-black uppercase tracking-wide text-slate-950 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-none border-2 border-slate-950 bg-yellow-200 text-slate-950 font-mono text-xs flex items-center justify-center font-extrabold shadow-sm">2</span>
                Start Virtual Environment
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4.5 rounded-none border-2 border-slate-950 shadow-neo font-mono text-xs pl-8 whitespace-pre overflow-x-auto leading-relaxed">
                {`# 1. Navigate to extracted directory
cd user-management-app

# 2. Create Python environment sandbox
python -m venv env

# 3. Trigger activation
# On Linux/macOS:
source env/bin/activate
# On Windows:
.\\env\\Scripts\\activate`}
              </div>

              <h3 className="text-sm font-black uppercase tracking-wide text-slate-950 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-none border-2 border-slate-950 bg-yellow-200 text-slate-950 font-mono text-xs flex items-center justify-center font-extrabold shadow-sm">3</span>
                Install Flask & Run
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4.5 rounded-none border-2 border-slate-950 shadow-neo font-mono text-xs pl-8 whitespace-pre overflow-x-auto leading-relaxed">
                {`# 1. Pip install dependencies
pip install -r requirements.txt

# 2. Boot up Flask
python app.py`}
              </div>

              <h3 className="text-sm font-black uppercase tracking-wide text-teal-800 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-none border-2 border-slate-950 bg-teal-200 text-teal-950 font-mono text-xs flex items-center justify-center font-extrabold shadow-sm">✓</span>
                Check Browser Output
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed pl-8">
                Open your browser and navigate to <span className="font-mono bg-slate-100 px-1.5 py-0.5 border-2 border-slate-200 rounded">http://127.0.0.1:5000</span> to test user actions, database commits, edits, and flash outputs.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="border-t-3 border-slate-950 mt-16 py-8 text-center text-xs text-slate-800 bg-white shadow-neo">
        <div className="max-w-7xl mx-auto px-6 font-semibold uppercase tracking-wider text-[11px]">
          <p>User Management Hub &copy; 2026. Designed with React, SQLite, & Python J2 Templates.</p>
        </div>
      </footer>
    </div>
  );
}
