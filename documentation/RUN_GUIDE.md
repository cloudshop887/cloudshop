# 🚀 How to Run CloudShop (Single Command)

We have set up a convenient way to run both the Backend and Frontend with a single command!

## Prerequisites

1.  Open a terminal (Command Prompt or PowerShell).
2.  Navigate to the project root directory:
    ```bash
    cd "c:\Users\ADMIN\Documents\NEW PR (2)\NEW PR"
    ```

## 🏃 Run Development Servers

Simply run:

```bash
npm run dev
```

### What this does:
1.  Starts the **Backend** server on port `5000`
2.  Starts the **Frontend** development server on port `5173`
3.  Shows logs from both in the same terminal window

## 🛠️ Other Useful Commands

-   **Install All Dependencies:**
    If you are setting up for the first time or added new packages:
    ```bash
    npm run install-all
    ```

-   **Run Backend Only:**
    ```bash
    npm run server
    ```

-   **Run Frontend Only:**
    ```bash
    npm run client
    ```

## ⚠️ Troubleshooting

If you see an error saying `'concurrently' is not recognized` or `npm command failed`:

1.  Make sure you ran the installation command in the root folder:
    ```bash
    npm install
    ```
2.  If you have PowerShell script errors, try running with `cmd /c`:
    ```bash
    cmd /c "npm run dev"
    ```
