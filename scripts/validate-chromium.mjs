import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseUrl = process.env.PROJECTLINK_URL ?? "http://localhost:3000";
const executable = [
  process.argv[2],
  process.env.CHROMIUM_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find((candidate) => candidate && existsSync(candidate));

if (!executable) {
  throw new Error("Chrome atau Edge mandiri tidak ditemukan.");
}

const profile = await mkdtemp(join(tmpdir(), "projectlink-chromium-"));
const port = 9333;
const chrome = spawn(
  executable,
  [
    "--headless=new",
    "--disable-gpu",
    "--disable-extensions",
    "--disable-background-networking",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function json(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function waitForDebugger() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      return await json(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await delay(100);
    }
  }
  throw new Error("Chrome DevTools Protocol tidak tersedia.");
}

await waitForDebugger();
const target = await json(
  `http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}/`)}`,
  { method: "PUT" },
);
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let sequence = 0;
const pending = new Map();
const events = new Map();
const consoleErrors = [];

socket.addEventListener("message", (message) => {
  const payload = JSON.parse(message.data);
  if (payload.id && pending.has(payload.id)) {
    const { resolve, reject } = pending.get(payload.id);
    pending.delete(payload.id);
    if (payload.error) reject(new Error(payload.error.message));
    else resolve(payload.result);
    return;
  }
  if (payload.method === "Runtime.exceptionThrown") {
    consoleErrors.push(payload.params.exceptionDetails.text);
  }
  if (payload.method === "Log.entryAdded" && payload.params.entry.level === "error") {
    consoleErrors.push(payload.params.entry.text);
  }
  const listeners = events.get(payload.method);
  if (listeners?.length) listeners.shift()(payload.params);
});

function send(method, params = {}) {
  sequence += 1;
  return new Promise((resolve, reject) => {
    pending.set(sequence, { resolve, reject });
    socket.send(JSON.stringify({ id: sequence, method, params }));
  });
}

function once(method, timeout = 15000) {
  return Promise.race([
    new Promise((resolve) => {
      const listeners = events.get(method) ?? [];
      listeners.push(resolve);
      events.set(method, listeners);
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout waiting for ${method}`)), timeout),
    ),
  ]);
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result.value;
}

async function navigate(pathname) {
  const loaded = once("Page.loadEventFired");
  await send("Page.navigate", { url: `${baseUrl}${pathname}` });
  await loaded;
  await delay(150);
}

async function waitFor(expression, timeout = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      if (await evaluate(`Boolean(${expression})`)) return true;
    } catch (error) {
      if (!/navigated|context|closed/i.test(error.message)) throw error;
    }
    await delay(80);
  }
  throw new Error(`Condition timed out: ${expression}`);
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

const routes = [
  "/",
  "/search?scope=projects",
  "/search?scope=people",
  "/projects/aqua-loop",
  "/profiles/maya-pradipta",
  "/organizations/nexa-research-lab",
  "/opportunities/urban-heat-mapping",
  "/home?prototypeState=new",
  "/home?prototypeState=returning",
  "/collaboration",
  "/organization/nexa-research-lab",
  "/organization/nexa-research-lab/search?scope=talent&selected=maya-pradipta",
  "/organization/nexa-research-lab/shortlists",
  "/organization/nexa-research-lab/pipeline",
  "/organization/nexa-research-lab/members",
  "/organization/nexa-research-lab/billing",
];

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "laptop", width: 1366, height: 850 },
  { name: "small-desktop", width: 1024, height: 768 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-landscape", width: 844, height: 390 },
  { name: "reflow-320", width: 320, height: 800 },
];

const responsive = [];
for (const viewport of viewports) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width <= 844,
  });
  for (const route of routes) {
    await navigate(route);
    await waitFor(
      "document.querySelector('main h1') && document.readyState === 'complete'",
    );
    const metrics = await evaluate(`(() => ({
      path: location.pathname + location.search,
      title: document.title,
      h1: document.querySelectorAll('main h1').length,
      pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      mainVisible: !!document.querySelector('main')?.getClientRects().length,
      duplicateIds: (() => {
        const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);
        return ids.length - new Set(ids).size;
      })(),
      primaryDead: [...document.querySelectorAll('main a.pl-button-primary')]
        .filter((node) => !node.getAttribute('href')).length
    }))()`);
    responsive.push({ viewport: viewport.name, route, ...metrics });
  }
}

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});

// Standalone Chromium history, refresh, URL state, and session mutation checks.
await navigate("/search?scope=projects");
await evaluate(`(() => {
  const select = document.querySelector('.px-filter-panel select');
  select.value = 'Predictive Maintenance';
  select.dispatchEvent(new Event('change', { bubbles: true }));
})()`);
await waitFor("location.search.includes('field=Predictive+Maintenance')");
await waitFor("document.querySelector('a[href*=\"selected=industrial-motor-monitoring\"]')");
await evaluate(`document.querySelector('a[href*="selected=industrial-motor-monitoring"]').click()`);
await waitFor("location.search.includes('selected=industrial-motor-monitoring')");
const selectedUrl = await evaluate("location.href");
const reloaded = once("Page.loadEventFired");
await send("Page.reload");
await reloaded;
await waitFor("location.search.includes('selected=industrial-motor-monitoring')");
await evaluate("history.back()");
await waitFor("!location.search.includes('selected=industrial-motor-monitoring')");
const backUrl = await evaluate("location.href");
await evaluate("history.forward()");
await waitFor("location.search.includes('selected=industrial-motor-monitoring')");
const forwardUrl = await evaluate("location.href");

await navigate("/home?prototypeState=returning");
await waitFor("document.querySelector('.pl-action-card > button')");
await evaluate("document.querySelector('.pl-action-card > button').click()");
await waitFor("document.querySelector('#action-detail')");
await evaluate("document.querySelector('#action-detail .pl-button-primary').click()");
await delay(100);
const actionCount = await evaluate("document.querySelectorAll('.pl-action-card').length");
const homeReloaded = once("Page.loadEventFired");
await send("Page.reload");
await homeReloaded;
await waitFor("document.querySelector('.pl-welcome-returning')");
await delay(150);
const actionCountAfterReload = await evaluate("document.querySelectorAll('.pl-action-card').length");

await navigate("/organization/nexa-research-lab/search?scope=talent&selected=nadia-putri");
await waitFor("document.querySelector('.px-org-detail-panel .pl-button-primary')");
await evaluate("document.querySelector('.px-org-detail-panel .pl-button-primary').click()");
await delay(100);
await navigate("/organization/nexa-research-lab/shortlists");
await waitFor("document.querySelectorAll('.px-table-row').length >= 2");
const shortlistCount = await evaluate("document.querySelectorAll('.px-table-row').length");

await navigate("/org/nexa-research-lab/projects");
await waitFor("location.pathname === '/organization/nexa-research-lab/projects'");
const compatibilityUrl = await evaluate("location.pathname");

const authReturnTarget =
  "/search?scope=projects&q=water&field=Environmental+Data";
await navigate(
  `/login?returnTo=${encodeURIComponent(authReturnTarget)}&action=save-search`,
);
await waitFor("document.querySelector('.auth-shell .button.primary.full')");
await evaluate("document.querySelector('.auth-shell .button.primary.full').click()");
await waitFor("location.pathname === '/search' && location.search.includes('saved=1')");
const authReturnUrl = await evaluate("location.pathname + location.search");

await navigate("/search?scope=projects&prototypeState=loading");
await waitFor("document.querySelectorAll('.px-result-skeleton').length === 3");
const loadingState = await evaluate(
  "document.querySelectorAll('.px-result-skeleton').length === 3",
);
await navigate("/search?scope=projects&q=zzzz-no-result");
await waitFor("document.querySelector('.px-search-state h2')");
const emptyState = await evaluate(
  "document.querySelector('.px-search-state h2').textContent.includes('Tidak ada hasil')",
);
await navigate("/search?scope=projects&prototypeState=error");
await waitFor("document.querySelector('.px-search-state .pl-button-primary')");
await evaluate(
  "document.querySelector('.px-search-state .pl-button-primary').click()",
);
await waitFor(
  "!location.search.includes('prototypeState=error') && document.querySelectorAll('.px-result-card').length > 0",
);
const errorRecovery = await evaluate(
  "!location.search.includes('prototypeState=error') && document.querySelectorAll('.px-result-card').length > 0",
);

await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await navigate(
  "/organization/nexa-research-lab/search?scope=talent&selected=maya-pradipta",
);
await waitFor("document.querySelector('.px-org-mobile-tabs')");
const mobileDetailVisible = await evaluate(
  "document.querySelector('.px-org-detail-panel')?.getClientRects().length > 0 && !document.querySelector('.px-org-filter-panel')?.getClientRects().length",
);
await evaluate(
  "[...document.querySelectorAll('.px-org-mobile-tabs button')].find((button) => button.textContent.includes('Filter')).click()",
);
const mobileFilterVisible = await evaluate(
  "document.querySelector('.px-org-filter-panel')?.getClientRects().length > 0 && !document.querySelector('.px-org-detail-panel')?.getClientRects().length",
);

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
await navigate("/");
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab" });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab" });
const firstTabTarget = await evaluate("document.activeElement?.textContent?.trim()");

const failedResponsive = responsive.filter(
  (entry) =>
    entry.pageOverflow ||
    !entry.mainVisible ||
    entry.h1 !== 1 ||
    entry.duplicateIds ||
    entry.primaryDead,
);

const report = {
  browser: executable,
  baseUrl,
  responsive: {
    checks: responsive.length,
    failures: failedResponsive,
  },
  state: {
    selectedUrl,
    backUrl,
    forwardUrl,
    historyRestored: selectedUrl === forwardUrl && backUrl !== selectedUrl,
    actionCount,
    actionCountAfterReload,
    sessionPersisted: actionCount === actionCountAfterReload,
    shortlistCount,
    compatibilityUrl,
    authReturnUrl,
    authReturnRestored:
      authReturnUrl === `${authReturnTarget}&saved=1`,
    loadingState,
    emptyState,
    errorRecovery,
    mobileDetailVisible,
    mobileFilterVisible,
    firstTabTarget,
  },
  consoleErrors,
  status:
    failedResponsive.length === 0 &&
    consoleErrors.length === 0 &&
    selectedUrl === forwardUrl &&
    actionCount === actionCountAfterReload &&
    compatibilityUrl === "/organization/nexa-research-lab/projects" &&
    authReturnUrl === `${authReturnTarget}&saved=1` &&
    loadingState &&
    emptyState &&
    errorRecovery &&
    mobileDetailVisible &&
    mobileFilterVisible
      ? "PASS"
      : "FAIL",
};

console.log(JSON.stringify(report, null, 2));

socket.close();
const chromeExited = new Promise((resolve) => chrome.once("exit", resolve));
chrome.kill();
await Promise.race([chromeExited, delay(2000)]);
for (let attempt = 0; attempt < 5; attempt += 1) {
  try {
    await rm(profile, { recursive: true, force: true });
    break;
  } catch (error) {
    if (attempt === 4) {
      console.warn(`Profil sementara belum dapat dihapus: ${error.message}`);
      break;
    }
    await delay(200);
  }
}
