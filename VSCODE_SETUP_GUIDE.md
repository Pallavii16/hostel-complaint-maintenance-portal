# VS Code Setup Guide - Hostel Complaint & Maintenance Portal

This guide will help you set up and run the project in Visual Studio Code.

## Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** and **npm** installed
- **VS Code** installed
- **Python extension** for VS Code (recommended)

## Step-by-Step Setup

### 1. Open Project in VS Code

```bash
# Navigate to your project directory
cd C:\Users\ABHIDNYA\OneDrive\Desktop\hostel

# Open VS Code in this directory
code .
```

Or in VS Code:
- Go to **File** → **Open Folder**
- Select the `hostel` folder

---

### 2. Set Up Backend (Python/Flask)

#### Step 2.1: Create Virtual Environment

Open a **new terminal** in VS Code (`Ctrl + `` ` or **Terminal** → **New Terminal**) and run:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# On macOS/Linux, use:
# source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

#### Step 2.2: Install Python Dependencies

```bash
# Install all required packages
python -m pip install -r requirements.txt
```

#### Step 2.3: Start Flask Backend Server

```bash
# Run the Flask application
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

**Keep this terminal running!** The backend server must stay active.

---

### 3. Set Up Frontend (React)

#### Step 3.1: Open a New Terminal

In VS Code, open a **second terminal** (click the `+` icon in the terminal panel, or press `` Ctrl + Shift + ` ``).

**Important**: Keep the backend terminal running in Terminal 1, and use Terminal 2 for frontend commands.

#### Step 3.2: Navigate to Frontend Directory

```bash
# Move to frontend folder
cd frontend
```

#### Step 3.3: Install Node Dependencies

```bash
# Install all npm packages (first time only)
npm install
```

This may take a few minutes on first run.

#### Step 3.4: Start React Development Server

```bash
# Start Vite dev server
npm run dev
```

You should see:
```
VITE v7.2.4  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

### 4. Access the Application

1. **Frontend**: Open your browser and go to `http://localhost:5173`
2. **Backend API**: Available at `http://localhost:5000`

---

## Quick Reference: All Commands

### Terminal 1 (Backend)

```bash
# Navigate to project root
cd C:\Users\ABHIDNYA\OneDrive\Desktop\hostel

# Activate virtual environment
venv\Scripts\activate

# Start Flask server
python app.py
```

### Terminal 2 (Frontend)

```bash
# Navigate to frontend folder
cd C:\Users\ABHIDNYA\OneDrive\Desktop\hostel\frontend

# Start React dev server
npm run dev
```

---

## VS Code Tips

### Using VS Code Terminal

1. **Split Terminal**: Right-click terminal tab → **Split Terminal**
2. **New Terminal**: Click `+` icon or `` Ctrl + Shift + ` ``
3. **Kill Terminal**: Click trash icon on terminal tab
4. **Rename Terminal**: Right-click terminal tab → **Rename**

### Recommended VS Code Extensions

- **Python** (by Microsoft)
- **ES7+ React/Redux/React-Native snippets**
- **Prettier** (code formatter)
- **Auto Rename Tag**

### Debugging

#### Backend (Flask)
1. Set breakpoints in `app.py`
2. Press `F5` → Select "Python: Flask"
3. VS Code will start Flask in debug mode

#### Frontend (React)
1. Install "Debugger for Chrome" extension
2. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend"
    }
  ]
}
```
3. Press `F5` to debug

---

## Troubleshooting

### Issue: `python` command not found
**Solution**: Use `py` instead of `python`, or configure Python path in VS Code settings.

### Issue: Port 5000 already in use
**Solution**: 
- Stop other Flask apps
- Or change port in `app.py`: `app.run(port=5001)`

### Issue: Port 5173 already in use
**Solution**: Vite will automatically try the next available port (5174, 5175, etc.)

### Issue: `npm` not found
**Solution**: Install Node.js from https://nodejs.org/

### Issue: Virtual environment not activating
**Solution**: 
- Windows: Use `venv\Scripts\activate.bat` or `venv\Scripts\Activate.ps1`
- If PowerShell execution policy blocks it: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## Default Credentials

- **Warden Username**: `warden`
- **Warden Password**: `warden123`

**Important**: Change these in production!

---

## Stopping the Servers

1. **Stop Backend**: In Terminal 1, press `Ctrl + C`
2. **Stop Frontend**: In Terminal 2, press `Ctrl + C`

---

## Next Steps

1. Open `http://localhost:5173` in your browser
2. Register a new student account
3. Or login as warden with credentials above
4. Start testing the application!

Happy coding! 🚀







