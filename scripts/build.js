// FoodNest unified build for Vercel.
//
// 1. Installs frontend & backend dependencies if not present.
// 2. Builds the TanStack Start frontend (`npm run build` in frontend/), which
//    emits the Nitro Vercel preset output at frontend/.vercel/output/.
// 3. Copies backend code and backend node_modules directly inside the serverless
//    function directory (`__server.func/backend` and `__server.func/node_modules`).
// 4. Patches `__server.func/index.mjs` so requests to `/api/*` and `/uploads/*`
//    are routed to `./backend/server.js`.
// 5. Copies the output to root `.vercel/output` so Vercel root deployments work seamlessly.

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const frontend = path.join(root, "frontend");
const backendSource = path.join(root, "backend");
const frontendVercel = path.join(frontend, ".vercel", "output");
const rootVercel = path.join(root, ".vercel", "output");
const funcDir = path.join(frontendVercel, "functions", "__server.func");
const entry = path.join(funcDir, "index.mjs");

function copyDirSync(src, dest, filterFn) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (filterFn && !filterFn(entry.name, path.join(src, entry.name))) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, filterFn);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ---------------------------------------------------------------------------
// Step 1 – ensure dependencies & build the frontend
// ---------------------------------------------------------------------------
const frontendNodeModules = path.join(frontend, "node_modules");
const backendNodeModules = path.join(backendSource, "node_modules");

if (!fs.existsSync(frontendNodeModules) || !fs.existsSync(path.join(frontendNodeModules, ".bin", "vite"))) {
  console.log("==> Installing frontend dependencies...");
  execSync("npm install", { cwd: frontend, stdio: "inherit" });
}

if (!fs.existsSync(backendNodeModules)) {
  console.log("==> Installing backend dependencies...");
  execSync("npm install", { cwd: backendSource, stdio: "inherit" });
}

console.log("==> Building frontend...");
execSync("npm run build", { cwd: frontend, stdio: "inherit" });

if (!fs.existsSync(entry)) {
  throw new Error(`Nitro output not found at ${entry} – frontend build may have failed.`);
}

// ---------------------------------------------------------------------------
// Step 2 – copy backend code and node_modules inside __server.func
// ---------------------------------------------------------------------------
console.log("==> Packaging backend into __server.func...");
const backendDest = path.join(funcDir, "backend");

copyDirSync(backendSource, backendDest, (name) => {
  return name !== "node_modules" && name !== "tests" && !name.endsWith(".log") && !name.endsWith(".err");
});

const funcNodeModules = path.join(funcDir, "node_modules");
if (fs.existsSync(backendNodeModules)) {
  console.log("==> Packaging backend node_modules into __server.func/node_modules...");
  copyDirSync(backendNodeModules, funcNodeModules);
}

// ---------------------------------------------------------------------------
// Step 3 – patch the server entry to mount the Express backend
// ---------------------------------------------------------------------------
console.log("==> Patching Nitro server entry to mount the backend API...");

let serverCode = fs.readFileSync(entry, "utf8");

if (serverCode.includes("__foodnest_api_guard__")) {
  console.log("    Already patched.");
} else {
  const patchMarker = "//#region node_modules/nitro/dist/presets/vercel/runtime/vercel.web.mjs";
  const regionStart = serverCode.indexOf(patchMarker);
  if (regionStart === -1) {
    throw new Error("Could not locate the vercel.web region in the Nitro output.");
  }
  const region = serverCode.slice(regionStart);
  const fetchImplStart = region.indexOf("var vercel_web_default = { fetch(req, context) {");
  if (fetchImplStart === -1) {
    throw new Error("Could not locate vercel_web_default in the Nitro output.");
  }

  const dispatcher = `
//#region #foodnest-api
// FoodNest backend API dispatcher. Requests to /api/* and /uploads/* are
// served by the shared Express application (backend/) inside __server.func.
let __foodnest_api_app_promise = undefined;
function __foodnest_api_app() {
	if (!__foodnest_api_app_promise) {
		__foodnest_api_app_promise = import("./backend/server.js").then((m) => m.default);
	}
	return __foodnest_api_app_promise;
}
async function __foodnest_api_dispatch(req) {
	const app = await __foodnest_api_app();
	const url = new URL(req.url, "https://x");
	if (!url.pathname.startsWith("/api/") && !url.pathname.startsWith("/uploads") && url.pathname !== "/api") {
		return null; // not an API request – fall through to SSR
	}
	return new Promise((resolve) => {
		const headers = Object.fromEntries(req.headers.entries());
		const chunks = [];
		const reader = req.body ? req.body.getReader() : null;
		function drain() {
			if (!reader) return finish();
			reader.read().then(({ done, value }) => {
				if (done) return finish();
				chunks.push(value);
				drain();
			});
		}
		function finish() {
			const body = Buffer.concat(chunks.map((c) => (typeof c === "string" ? Buffer.from(c) : Buffer.from(c))));
			if (body.length) headers["content-length"] = String(body.length);
			const stream = body.length ? __foodnest_api_Readable.from([body]) : __foodnest_api_Readable.from([]);
			const nodeReq = Object.assign(stream, {
				method: req.method,
				url: url.pathname + url.search,
				headers,
				httpVersion: "1.1",
				httpVersionMajor: 1,
				httpVersionMinor: 1,
				on: stream.on.bind(stream),
			});
			let statusCode = 200;
			const resHeaders = {};
			const resChunks = [];
			const nodeRes = Object.create(null, {
				headersSent: { value: false, writable: true, configurable: true },
				statusCode: {
					get() { return statusCode; },
					set(v) { statusCode = v; },
					configurable: true,
				},
				setHeader: { value(k, v) { resHeaders[String(k).toLowerCase()] = v; } },
				getHeader: { value() { return undefined; } },
				removeHeader: { value() {} },
				writeHead: { value(code, h) { statusCode = code; if (h) Object.assign(resHeaders, h); nodeRes.headersSent = true; } },
				write: { value(chunk) { resChunks.push(Buffer.from(chunk)); return true; } },
				end: {
					value(chunk) {
						if (chunk !== undefined) resChunks.push(Buffer.from(chunk));
						nodeRes.headersSent = true;
						const bodyBuf = Buffer.concat(resChunks);
						const respHeaders = { ...resHeaders };
						resolve(
							new Response(bodyBuf.length ? bodyBuf : null, { status: statusCode, headers: respHeaders }),
						);
					},
				},
				on: { value() { return nodeRes; } },
			});
			void app(nodeReq, nodeRes);
		}
		drain();
	});
}
//#endregion
`;

  const insertionPoint = regionStart + fetchImplStart + "var vercel_web_default = { fetch(req, context) {".length;
  const newServerCode =
	serverCode.slice(0, insertionPoint) + dispatcher + serverCode.slice(insertionPoint);

  const hooked = newServerCode.replace(
	/return nitroApp\.fetch\(req\);/,
	`return __foodnest_api_dispatch(req).then((r) => r !== null ? r : nitroApp.fetch(req));`,
  );

  const finalCode =
	"// __foodnest_api_guard__\n" +
	'import { Readable as __foodnest_api_Readable } from "node:stream";\n' +
	hooked;
  fs.writeFileSync(entry, finalCode);
  console.log("    Patched __server.func/index.mjs successfully.");
}

// ---------------------------------------------------------------------------
// Step 4 – Mirror .vercel/output to repository root for Vercel deployments
// ---------------------------------------------------------------------------
console.log("==> Syncing .vercel/output to repository root...");
copyDirSync(frontendVercel, rootVercel);

console.log("==> Build complete. Ready for Vercel deployment.");
