import { createServer } from "node:http";
import type { ApiResponse, HealthData } from "@projectlink/shared";

const port = Number(process.env.PORT ?? 4000);

const server = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    const payload: ApiResponse<HealthData> = {
      success: true,
      data: {
        service: "projectlink-api",
        status: "ok",
      },
    };

    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(payload));
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(
    JSON.stringify({ success: false, message: "Route tidak ditemukan" }),
  );
});

server.listen(port, () => {
  console.log(`ProjectLink API siap di http://localhost:${port}`);
});
