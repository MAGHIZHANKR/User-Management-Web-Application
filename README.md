# User Management Web Application

An elegant, end-to-end full stack web application demonstrating how frontend, backend, and persistent database technologies work together. Built with **Python Flask** for server-side operations, **HTML5/CSS3** for an eye-catching responsive layout, and **SQLite** for lightweight, self-contained relational database storage.

## 🌟 Key Features

* **Complete User Lifecycle (CRUD)**: Create new user credentials, display registered profiles, view metrics, edit details, and delete entries.
* **Modern Stats Dashboard**: Bento-style grid cards showing total active entries and localized diagnostics (top cities registered).
* **Robust Server Validation**: Prevents empty field registrations, checks character structures, and guards against duplicate emails.
* **Interactive Live Search**: Filter profiles dynamically using names or locations with an inline search menu.
* **Refined Professional Aesthetics**: Layout containing fluid typography custom pairings (Inter & Outfit), responsive grids, floating inputs, and smooth transitions.
* **Active Session Feedback**: Success and Error micro-notification banners reporting status after every action.

---

## 🛠️ Technology Stack

* **Backend**: Python 3 (Flask micro-framework)
* **Frontend**: HTML5, CSS3, Font Awesome (vector icons), Google Fonts
* **Database**: SQLite (embedded, file-based SQL, managed with `sqlite3` driver)
* **Utilities**: SQL syntax seeding, responsive media queries, session-based flash systems

---

## 📂 Project Directory Structure

```text
user-management-app/
│
├── app.py              # Main Python Flask script (routes, validations, and SQLite controllers)
├── database.db         # Persistent SQLite database file (created automatically on first launch)
├── requirements.txt    # Declared Python library versions (Flask)
├── README.md           # Exhaustive guide, structures, and launch configurations
│
├── templates/          # J2 (Jinja) templates rendering server-side markup
│   ├── index.html      # Main registration and table grid portal 
│   └── edit.html       # Dynamic record editor (Bonus feature module)
│
├── static/             # Static styles and styles assets
│   └── style.css       # Clean, modern styling containing responsive media queries & color palettes
│
└── screenshots/        # Assets folder for screenshots (pre-configured)
```

---

## 🚀 Step-by-Step Installation & Run Guide

Follow these simple steps to run this application directly on your local system or inside VS Code:

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your machine. You can verify your version by running:
```bash
python --version
```

### 2. Extract Project Files
Download and unpack the project zip file into your preferred workspace directory (e.g. `user-management-app`). 

### 3. Open in VS Code
Open VS Code, select **File > Open Folder**, and load the `user-management-app` folder.

### 4. Create and Activate Virtual Environment (Recommended)
Open your terminal inside VS Code (**Ctrl + `** or **Terminal > New Terminal**) and execute:

* **Windows**:
  ```bash
  python -m venv venv
  venv\Scripts\activate
  ```
* **macOS / Linux**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 5. Install Required Dependencies
Install the required packages declared in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 6. Run the Solution
Boot up your Flask local developer server with the following command:
```bash
python app.py
```

Upon executing this:
* A local file named `database.db` is immediately initialized.
* A relational `users` table is created.
* Four standard sample profiles (Alice, Bob, Charlie, and Diana) are seeded into your database automatically so you don't start with a blank screen.

### 7. Access in your Browser
Open your preferred web browser and navigate to:
```text
http://127.0.0.1:5000/
```

---

## ⚙️ SQL Database Architecture

The backend database contains a single tables schema named `users` designed as follows:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    city TEXT NOT NULL
);
```

### Automatic Maintenance
Every query runs inside a robust connection lock scope using Flask's context manager helper. If an integrity violation takes place (for example. a user attempts to double-register an email address), the transaction is gracefully rolled back and a feedback banner warns the user.

---

## 🔮 Future Enhancements

1. **User Auth Integration**: Set up Flask-Login sessions to encrypt records and separate administrators.
2. **Export to CSV**: Add button to download registered list as an Excel/CSV spreadsheet.
3. **Advanced Charts**: Integrate Chart.js visual tools to represent registered cities graphically.
4. **Interactive Filters**: Column header toggles for ASC/DESC alphabetical sorting configurations.

---

*This project is beginner-friendly and serves as a stellar foundation for learning how backends, databases, and styling sheets synchronize perfectly!*
