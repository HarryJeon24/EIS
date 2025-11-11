# EIS
Emory International Student Forum

---

## 📌 Important Notice
This project **must be opened through a local server (localhost)**.  
Do **not** open the HTML files directly from your file system (e.g., by double‑clicking them).  
Opening with `file://` paths will cause certain features (JavaScript modules, AJAX requests, relative paths) to break due to browser security restrictions.

---

## ✅ How to Run Correctly

### Option 1: Using PyCharm
1. Open the project in PyCharm.
2. Right‑click the main HTML file and select **"Open in Browser" → Chrome (or your preferred browser)**.
3. PyCharm will serve the file via `http://localhost:63342/...`, ensuring all features work properly.

### Option 2: Using Python (built‑in server)
1. Navigate to the project folder in your terminal.
2. Run:
   ```bash
   python -m http.server 8000


emory-international/
├─ public/
│  └─ favicon.svg
├─ assets/
│  └─ images/            # (optional) logos, screenshots, etc.
├─ css/
│  ├─ base.css           # (optional) resets/global tokens later
│  └─ auth.css           # shared styles for login & signup (formerly login.css)
├─ js/
│  ├─ validators.js      # shared email/password checks
│  ├─ login.js
│  └─ signup.js
├─ pages/
│  ├─ login.html
│  └─ signup.html
└─ README.md

