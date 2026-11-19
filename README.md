# Hostel Complaint & Maintenance Portal

A modern, responsive portal that lets students raise maintenance complaints and helps wardens triage, prioritise, and close them quickly. The project now ships with a Flask JSON API and a React single-page application focused on smooth UX and accessibility.

## Feature Overview

### Student experience
- **Personal dashboard** with live counters for pending / in-progress / resolved tickets.
- **Rich complaint form** with category + priority selection, inline validations, and contextual guidance.
- **Attach evidence photos** with instant previews for each complaint.
- **Profile side drawer** to review registration details, update room number, and upload a profile photo.
- **Timeline cards** highlighting warden updates, submission date, and quick status badges.

### Warden experience
- **Mission control dashboard** aggregating total hostel load with quick refresh.
- **Smart filters & search surface** (status + category) for fast triage.
- **Inline drawer editor** to update status, leave notes, inspect student evidence, and upload resolution proof without losing context.

## Tech Stack

| Layer      | Tech                                                                                                                                 |
|------------|---------------------------------------------------------------------------------------------------------------------------------------|
| Backend    | Flask 3, PyMongo, Flask-Cors, Werkzeug password hashing                                                                               |
| Frontend   | React 18 (Vite), modern CSS (custom utility styles), React Router 6                                                                   |
| Database   | MongoDB (local development default)                                                                                                   |

## Getting Started

### 1. Backend API (`http://localhost:5000`)
```bash
# inside project root
python -m venv venv
venv\Scripts\activate          # on Windows
# source venv/bin/activate     # on macOS/Linux
python -m pip install -r requirements.txt
set MONGO_URI=mongodb://localhost:27017/hostel_portal
set SECRET_KEY=replace-with-a-long-random-value
python app.py
```

The API exposes `/api/*` endpoints (JSON) and `/uploads/*` for serving uploaded media. MongoDB must be running locally, or set `MONGO_URI` to your MongoDB connection string. Register a warden account through the app; no default warden account is created. Set `SECRET_KEY` to a long random value outside local development.

### 2. React Frontend (`http://localhost:5173`)
```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` calls to `http://localhost:5000`, so both apps stay in sync. To point to a different API base, set `VITE_API_URL` in `frontend/.env`.

### 3. Production build
```bash
cd frontend
npm run build          # outputs to frontend/dist
npm run preview        # optional smoke test
```
Serve the compiled `frontend/dist` folder with any static host (Nginx, Netlify, etc.) and point it at the Flask API or convert Flask to serve the `dist` directory.

### 4. File uploads
- Uploaded images are stored under the root-level `uploads/` folder (auto-created, gitignored).
- Maximum size per image is **5 MB**. Allowed types: png, jpg, jpeg, gif, webp, bmp.
- The React UI previews images before submitting and shows them wherever relevant (student cards + warden drawer).
- Delete unwanted uploads by clearing the folder while the server is stopped.

## Project Structure

```
hostel/
├── app.py                  # Flask API + MongoDB access
├── requirements.txt
├── frontend/               # React SPA
│   ├── src/
│   │   ├── api/            # Fetch client wrapper
│   │   ├── components/     # Layout, badges, alerts, stats, etc.
│   │   ├── contexts/       # Auth provider
│   │   └── pages/          # Login, Register, Student, Warden
│   ├── package.json
│   └── vite.config.js      # Dev proxy + build settings
├── static/                 # (reserved for backend static assets)
├── uploads/                # Runtime image uploads (auto-created)
└── README.md
```

## API Highlights

| Endpoint                      | Method | Purpose                                         |
|------------------------------|--------|-------------------------------------------------|
| `/api/register`              | POST   | Create student or warden account                |
| `/api/login` / `/api/logout` | POST   | Start or end an authenticated session           |
| `/api/auth/session`          | GET    | Fetch currently signed-in user (for React boot) |
| `/api/profile`               | GET/PUT| View or update profile (room no. & avatar)      |
| `/api/complaints`            | GET    | Student: own complaints · Warden: filterable    |
| `/api/complaints`            | POST   | Students log new complaints                     |
| `/api/complaints/<id>`       | GET    | Detail view (role-aware)                        |
| `/api/complaints/<id>`       | PUT    | Warden status + notes + resolution photo        |
| `/uploads/<filename>`        | GET    | Serves uploaded evidence images                 |

All endpoints return JSON responses suitable for the React SPA.

## Security Notes

- Set a strong, private `SECRET_KEY` and `MONGO_URI` through environment variables.
- Use HTTPS and secure cookies in production.
- Create warden accounts only for trusted staff.
- Sanitize / virus-scan uploaded media before exposing the `/uploads` directory publicly.

## Troubleshooting

| Issue                           | Fix                                                                                       |
|---------------------------------|-------------------------------------------------------------------------------------------|
| `pip` not found                 | Use `python -m pip install -r requirements.txt`                                           |
| CORS errors in dev              | Ensure backend is running on port 5000 and keep `npm run dev` proxy enabled               |
| MongoDB connection error        | Start MongoDB and verify the `MONGO_URI` value before restarting `python app.py`          |
| Port already in use             | Run backend with `python app.py --port 5001` and update `VITE_API_URL` accordingly        |
| Upload rejected                 | Use png/jpg/jpeg/gif/webp/bmp files under 5MB; refresh after fixing validation errors     |

## Roadmap ideas

- Push notifications (email / SMS) when status changes
- Multiple attachments / document uploads per complaint
- Advanced analytics & export tools for the warden
- PWA / mobile-friendly offline capabilities

---

Crafted to keep every hostel block running smoothly. 🚀

