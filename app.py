import os
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = "super_secret_session_key_for_flash_messages"
DATABASE = "database.db"

def get_db_connection():
    """Establishes and returns a connection to the SQLite database."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Access columns by name like dictionary keys
    return conn

def init_database():
    """Initializes the database schema and seeds sample data if empty."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create the users table if it doesn't already exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            city TEXT NOT NULL
        )
    ''')
    
    # Seed initial sample data if the table is currently empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        sample_users = [
            ("Alice Smith", "alice@example.com", "123-456-7890", "New York"),
            ("Bob Johnson", "bob@example.com", "234-567-8901", "San Francisco"),
            ("Charlie Brown", "charlie@example.com", "345-678-9012", "Chicago"),
            ("Diana Prince", "diana@amazon.com", "456-789-0123", "Boston")
        ]
        cursor.executemany(
            "INSERT INTO users (name, email, phone, city) VALUES (?, ?, ?, ?)",
            sample_users
        )
        print("Prepopulated SQLite database with 4 sample user records!")
    
    conn.commit()
    conn.close()

# Ensure the database is initialized immediately on startup
init_database()


@app.route("/")
def index():
    """Displays user statistics, search field, form, and list of users."""
    search_query = request.args.get("search", "").strip()
    conn = get_db_connection()
    
    if search_query:
        # Search filter (matches name, email, phone, or city)
        users = conn.execute(
            """SELECT * FROM users WHERE 
               name LIKE ? OR email LIKE ? OR phone LIKE ? OR city LIKE ? 
               ORDER BY id DESC""",
            (f"%{search_query}%", f"%{search_query}%", f"%{search_query}%", f"%{search_query}%")
        ).fetchall()
    else:
        # Fetch all users sorted descending by ID (newest first)
        users = conn.execute("SELECT * FROM users ORDER BY id DESC").fetchall()
        
    # Get total registered users count for the dashboard
    total_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    
    # Get city statistics for the visual bento cards
    city_counts = conn.execute(
        "SELECT city, COUNT(*) as count FROM users GROUP BY city ORDER BY count DESC LIMIT 5"
    ).fetchall()
    
    conn.close()
    return render_template(
        "index.html", 
        users=users, 
        total_count=total_count, 
        city_counts=city_counts,
        search_query=search_query
    )


@app.route("/add", methods=["POST"])
def add_user():
    """Processes user registration form submissions."""
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip()
    phone = request.form.get("phone", "").strip()
    city = request.form.get("city", "").strip()
    
    # Validation: Empty field checks
    if not name or not email or not phone or not city:
        flash("All fields are required! Please fill out the entire form.", "error")
        return redirect(url_for("index"))
        
    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO users (name, email, phone, city) VALUES (?, ?, ?, ?)",
            (name, email, phone, city)
        )
        conn.commit()
        flash(f"User '{name}' has been successfully added!", "success")
    except sqlite3.IntegrityError:
        # Fails if email already exists (UNIQUE constraint violation)
        flash(f"Error: A user with the email '{email}' already exists.", "error")
    finally:
        conn.close()
        
    return redirect(url_for("index"))


@app.route("/edit/<int:user_id>", methods=["GET", "POST"])
def edit_user(user_id):
    """Bonus Feature: Processes user detail updates."""
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    
    if user is None:
        conn.close()
        flash("Error: User record not found.", "error")
        return redirect(url_for("index"))
        
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        phone = request.form.get("phone", "").strip()
        city = request.form.get("city", "").strip()
        
        # Validation
        if not name or not email or not phone or not city:
            flash("All fields must be filled to complete the update.", "error")
            conn.close()
            return redirect(url_for("edit_user", user_id=user_id))
            
        try:
            conn.execute(
                "UPDATE users SET name = ?, email = ?, phone = ?, city = ? WHERE id = ?",
                (name, email, phone, city, user_id)
            )
            conn.commit()
            flash(f"User details for '{name}' successfully updated!", "success")
            conn.close()
            return redirect(url_for("index"))
        except sqlite3.IntegrityError:
            flash(f"Error: Email address '{email}' is registered with another user.", "error")
            conn.close()
            return redirect(url_for("edit_user", user_id=user_id))
            
    conn.close()
    return render_template("edit.html", user=user)


@app.route("/delete/<int:user_id>", methods=["POST", "GET"])
def delete_user(user_id):
    """Deletes a selected user from the SQLite database."""
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    
    if user:
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        flash(f"User record for '{user['name']}' deleted successfully.", "success")
    else:
        flash("Error: Attempted to delete a non-existent user record.", "error")
        
    conn.close()
    return redirect(url_for("index"))


if __name__ == "__main__":
    # Runs the Flask application locally on port 5000 (accessible via http://127.0.0.1:5000)
    app.run(host="127.0.0.1", port=5000, debug=True)
