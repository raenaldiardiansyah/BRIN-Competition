import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const exported = resolve(root, "apps", "web", "out");
const dist = resolve(root, "dist");
const client = resolve(dist, "client");
const server = resolve(dist, "server");

if (!existsSync(exported)) {
  throw new Error("Static Next.js export was not found in /out.");
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(client, { recursive: true });
mkdirSync(server, { recursive: true });
cpSync(exported, client, { recursive: true });

writeFileSync(
  resolve(server, "index.js"),
  `const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);

    if (response.status !== 404) return response;

    const cleanPath = url.pathname.replace(/\\/$/, "");
    const htmlRequest = new Request(
      new URL(cleanPath ? cleanPath + ".html" : "/index.html", request.url),
      request,
    );
    response = await env.ASSETS.fetch(htmlRequest);

    if (response.status !== 404) return response;

    return env.ASSETS.fetch(new Request(new URL("/404.html", request.url), request));
  },
};

export default worker;
`,
);

console.log("Prepared Sites deployment output in /dist.");
