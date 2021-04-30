import express from "express";
import fetch from "node-fetch";
import axios from "axios";
import request from "request";

import path from "path";
import tracequest from "../src";
import targets from './lib/targets';

const app = express();
const port = 3000;

app.use(tracequest);
app.use(express.static(path.resolve(__dirname, "public")));

app.get("/node-fetch", async (req, res) => {
  await targets.compute();
  await fetch("https://example.com");

  return res.send({
    ok: true,
  });
});

app.get("/axios", async (req, res) => {
  await axios.get("https://example.com");

  return res.send({
    ok: true,
  });
});

app.get("/request", async (req, res) => {
  request("https://example.com", (err) => {
    res.send({
      ok: true,
    });
  });
});

app.listen(port, () => {
  console.log("Listening on", port);
});
