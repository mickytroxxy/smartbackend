"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var index_exports = {};
__export(index_exports, {
  createRealtimeClient: () => createRealtimeClient
});
module.exports = __toCommonJS(index_exports);
var import_realtime_api_beta = require("@openai/realtime-api-beta");
var import_ws = require("ws");
function createRealtimeClient(options) {
  const params = new URLSearchParams({
    call_type: options.call.type,
    call_id: options.call.id,
    api_key: options.streamApiKey
  });
  const url = `${options.baseUrl.replace(
    "https://",
    "wss://"
  )}/video/connect_agent?${params.toString()}`;
  const client = new import_realtime_api_beta.RealtimeClient({
    url,
    apiKey: options.openAiApiKey,
    dangerouslyAllowAPIKeyInBrowser: true,
    debug: options.debug ?? false
  });
  client.realtime.streamToken = options.streamUserToken;
  client.realtime.model = options.model;
  patchRealtimeApi(client.realtime);
  return client;
}
function patchRealtimeApi(realtime) {
  realtime.connect = async function({ model } = {}) {
    if (this.isConnected()) {
      throw new Error(`Already connected`);
    }
    const modelToUse = model || this.model;
    const ws = new import_ws.WebSocket(`${this.url}${modelToUse ? `?model=${modelToUse}` : ""}`, [], {
      finishRequest: (_request) => {
        const request = _request;
        request.setHeader("Authorization", `Bearer ${this.apiKey}`);
        request.setHeader("OpenAI-Beta", "realtime=v1");
        request.setHeader("Stream-Authorization", this.streamToken);
        request.end();
      }
    });
    return new Promise((resolve, reject) => {
      ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === "error") {
          this.disconnect(ws);
          reject(message);
        }
        this.receive(message.type, message);
        resolve(true);
      });
      const connectionErrorHandler = () => {
        this.disconnect(ws);
        reject(new Error(`Could not connect to "${this.url}"`));
      };
      ws.on("error", connectionErrorHandler);
      ws.on("open", () => {
        this.log(`Connected to "${this.url}"`);
        ws.removeListener("error", connectionErrorHandler);
        ws.on("error", () => {
          this.disconnect(ws);
          this.log(`Error, disconnected from "${this.url}"`);
          this.dispatch("close", { error: true });
        });
        ws.on("close", () => {
          this.disconnect(ws);
          this.log(`Disconnected from "${this.url}"`);
          this.dispatch("close", { error: false });
          reject(new Error("Closed without any messages"));
        });
        this.ws = ws;
      });
    });
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createRealtimeClient
});
