const http = require("node:http");
const { URL } = require("node:url");
const ApiError = require("./ApiError");
const { createEntities } = require("./entities");

const MAX_BODY_SIZE = 64 * 1024;

function readJsonBody(request) {
  const length = Number(request.headers["content-length"]);
  if (Number.isFinite(length) && length > MAX_BODY_SIZE) {
    request.resume();
    return Promise.reject(new ApiError(413, "Request body exceeds 64KB limit"));
  }

  const contentType = (request.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    request.resume();
    return Promise.reject(ApiError.badRequest("Content-Type must be application/json"));
  }

  return new Promise((resolve, reject) => {
    const buffer = [];
    let bytesReceived = 0;
    let isDone = false;

    request.on("data", (chunk) => {
      bytesReceived += chunk.length;
      if (bytesReceived > MAX_BODY_SIZE) {
        isDone = true;
        request.resume();
        reject(new ApiError(413, "Request body exceeds 64KB limit"));
      } else {
        buffer.push(chunk);
      }
    });

    request.on("end", () => {
      if (isDone) return;
      try {
        const payloadStr = Buffer.concat(buffer).toString("utf8");
        if (!payloadStr.trim()) throw ApiError.badRequest("Request body cannot be empty");
        resolve(JSON.parse(payloadStr));
      } catch (err) {
        reject(err instanceof SyntaxError ? ApiError.badRequest("Malformed JSON request body") : err);
      }
    });

    request.on("error", (err) => {
      if (!isDone) reject(err);
    });
  });
}

function parseId(segment) {
  if (!/^[1-9]\d*$/.test(segment)) {
    throw ApiError.badRequest("ID must be a positive integer");
  }
  const numericId = Number(segment);
  if (!Number.isSafeInteger(numericId)) {
    throw ApiError.badRequest("ID must be a safe integer");
  }
  return numericId;
}

function sendJson(response, statusCode, bodyData) {
  const serialized = JSON.stringify(bodyData);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(serialized)
  });
  response.end(serialized);
}

function createApp({ entities = createEntities() } = {}) {
  return http.createServer(async (req, res) => {
    try {
      const parsedUrl = new URL(req.url, "http://localhost");
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean).map((part) => {
        try {
          return decodeURIComponent(part);
        } catch {
          throw ApiError.badRequest("Malformed URL path");
        }
      });

      if (pathParts.length < 1 || pathParts.length > 2) {
        throw ApiError.notFound("Route not found");
      }

      const [resourceName, idParam] = pathParts;
      const targetController = entities[resourceName];

      if (!targetController) throw ApiError.notFound("Route not found");

      const entityId = idParam ? parseId(idParam) : null;
      const httpMethod = req.method;

      let resultData;
      let statusCode = 200;

      if (httpMethod === "GET" && entityId === null) {
        resultData = targetController.list(Object.fromEntries(parsedUrl.searchParams.entries()));
      } else if (httpMethod === "GET" && entityId !== null) {
        resultData = targetController.show(entityId);
      } else if (httpMethod === "POST" && entityId === null) {
        const body = await readJsonBody(req);
        resultData = targetController.create(body);
        statusCode = 201;
      } else if (httpMethod === "PUT" && entityId !== null) {
        const body = await readJsonBody(req);
        resultData = targetController.replace(entityId, body);
      } else if (httpMethod === "PATCH" && entityId !== null) {
        const body = await readJsonBody(req);
        resultData = targetController.patch(entityId, body);
      } else if (httpMethod === "DELETE" && entityId !== null) {
        resultData = targetController.destroy(entityId);
      } else {
        throw new ApiError(405, "Method not allowed");
      }

      sendJson(res, statusCode, { data: resultData });
    } catch (err) {
      const errStatus = Number.isInteger(err.status) ? err.status : 500;
      if (errStatus === 500) console.error(err);

      if (!res.headersSent) {
        sendJson(res, errStatus, {
          error: { message: errStatus === 500 ? "Internal server error" : err.message }
        });
      } else {
        res.destroy();
      }
    }
  });
}

module.exports = { createApp, MAX_BODY_SIZE };
