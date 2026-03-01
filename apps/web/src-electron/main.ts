import { BrowserWindow, app, dialog } from "electron";
import logger from "electron-log/main";
import fs from "fs";
import type { Server } from "http";
import path from "path";

logger.initialize();
logger.info("Log from the main process");

// PGlite用の環境変数を設定
const userDataPath = app.getPath("userData");
const pgliteDataPath = path.join(userDataPath, "pgdata");

if (!fs.existsSync(pgliteDataPath)) {
  fs.mkdirSync(pgliteDataPath, { recursive: true });
}

process.env.DATABASE_MODE = "pglite";
process.env.PGLITE_DATA_PATH = pgliteDataPath;

let mainWindow: BrowserWindow | null = null;
let server: Server | null = null;

async function startNextServer(): Promise<string> {
  const isDev = process.env.NODE_ENV === "development";

  // パス設定
  const appDir = isDev
    ? process.cwd()
    : path.join(app.getAppPath().replace("app.asar", "app.asar.unpacked"), ".next", "standalone", "apps", "web");

  logger.info("[Electron] App directory:", appDir);
  logger.info("[Electron] isDev:", isDev);

  const { default: next } = await import("next");
  const { default: http } = await import("http");

  const nextApp = next({
    dev: isDev,
    dir: appDir,
    ...(isDev ? {} : { conf: { distDir: ".next" } }),
  });

  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  server = http.createServer((req, res) => handle(req, res));

  const port = 3000;
  await new Promise<void>((resolve, reject) => {
    server!.on("error", reject);
    server!.listen(port, "127.0.0.1", () => {
      logger.info(`[Electron] Server running at http://127.0.0.1:${port}`);
      resolve();
    });
  });

  return `http://127.0.0.1:${port}`;
}

async function createWindow(): Promise<void> {
  try {
    // PGliteマイグレーションを実行（Next.jsサーバー起動前）
    const { runMigrations } = await import("./pglite-migrate");
    await runMigrations(pgliteDataPath);

    const serverUrl = await startNextServer();

    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
      title: "クレジット支払い管理ツール",
    });

    await mainWindow.loadURL(serverUrl);

    if (process.env.NODE_ENV === "development") {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.on("closed", () => {
      mainWindow = null;
    });

    logger.info("[Electron] Window created successfully");
  } catch (error) {
    logger.error("[Electron] Failed to create window:", error);
    dialog.showErrorBox(
      "起動エラー",
      `アプリケーションの起動に失敗しました:\n\n${error instanceof Error ? error.message : String(error)}`
    );
    app.quit();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("before-quit", () => {
  if (server) {
    server.close();
  }
});
