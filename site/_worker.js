// site/worker.ts
var NOT_COUNTED_PREFIXES = ["/data/", "/calendar/"];
var FEED = "/feed.xml";
var MAX_PATH = 200;
var MAX_HOST = 100;
var MAX_SUBSCRIBERS = 1e7;
var READERS = [
  ["Feedly", /feedly/i],
  ["Inoreader", /inoreader/i],
  ["NewsBlur", /newsblur/i],
  ["The Old Reader", /theoldreader/i],
  ["Feedbin", /feedbin/i],
  ["Miniflux", /miniflux/i],
  ["FreshRSS", /freshrss/i],
  ["NetNewsWire", /netnewswire/i],
  ["Tiny Tiny RSS", /tiny tiny rss/i],
  ["Feeder", /feeder\.co|spaceship/i],
  ["Slack", /slackbot|slack-imgproxy/i],
  ["Thunderbird", /thunderbird/i]
];
var BOT = /bot\b|bot\/|crawl|spider|slurp|preview|fetcher|monitor|headless|lighthouse|facebookexternalhit|python|curl\/|wget|go-http-client|node-fetch|undici|axios|okhttp|java\/|libwww|httpclient|scrapy|feedparser|^mozilla\/5\.0$/i;
var pad = (n) => String(n).padStart(2, "0");
function utcDay(now) {
  return `${String(now.getUTCFullYear())}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
}
function notCounted(path) {
  return NOT_COUNTED_PREFIXES.some((p) => path.startsWith(p));
}
function pathKind(path) {
  if (notCounted(path)) return null;
  if (path === FEED) return "feed";
  if (path.endsWith("/") || path.endsWith(".html")) return "page";
  return null;
}
function readerName(userAgent) {
  for (const [name, pattern] of READERS) if (pattern.test(userAgent)) return name;
  return "other";
}
function subscribers(userAgent) {
  const m = /(\d[\d,]*)\s+(?:subscribers?|readers?)\b/i.exec(userAgent);
  if (!m) return 0;
  const n = Number(m[1]?.replace(/,/g, ""));
  return Number.isSafeInteger(n) && n <= MAX_SUBSCRIBERS ? n : 0;
}
function isBot(userAgent) {
  return userAgent.trim() === "" || BOT.test(userAgent);
}
function referrerHost(referer, siteHost) {
  if (!referer) return "(none)";
  let host;
  try {
    host = new URL(referer).hostname.toLowerCase();
  } catch {
    return "(none)";
  }
  if (host === "") return "(none)";
  if (host === siteHost.toLowerCase()) return "(self)";
  return host.slice(0, MAX_HOST);
}
function country(request) {
  const c = request.cf?.country;
  return typeof c === "string" && /^[A-Z0-9]{2}$/.test(c) ? c : "XX";
}
function dataPoint(request, status, now) {
  if (request.method !== "GET") return null;
  if (status !== 200 && status !== 304) return null;
  const url = new URL(request.url);
  const path = url.pathname;
  const base = pathKind(path);
  if (base === null) return null;
  const userAgent = request.headers.get("user-agent") ?? "";
  let kind = base;
  let reader = "";
  let figure = 0;
  if (base === "feed") {
    reader = readerName(userAgent);
    figure = subscribers(userAgent);
    if (reader === "other" && isBot(userAgent)) kind = "bot";
  } else if (isBot(userAgent)) {
    kind = "bot";
  }
  return {
    blobs: [
      utcDay(now),
      kind,
      path.slice(0, MAX_PATH),
      referrerHost(request.headers.get("referer"), url.hostname),
      country(request),
      reader
    ],
    doubles: [1, figure],
    indexes: [kind]
  };
}
async function handle(request, env, now = () => /* @__PURE__ */ new Date()) {
  if (notCounted(new URL(request.url).pathname)) return env.ASSETS.fetch(request);
  const response = await env.ASSETS.fetch(request);
  try {
    const point = dataPoint(request, response.status, now());
    if (point && env.SITE_METRICS) env.SITE_METRICS.writeDataPoint(point);
  } catch {
  }
  return response;
}
var worker_default = {
  fetch: (request, env) => handle(request, env)
};
export {
  worker_default as default
};
