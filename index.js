const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
app.use(express.json());

const partner_id = "18383580742";
const partner_key = "SVKIDYM7SDFMF6DRRKMWHSKGOOITWSAS";

// 🔐 AUTH
function generateAuth(body, timestamp) {
  const path = "/graphql";

  const bodyHash = crypto
    .createHash("sha256")
    .update(body)
    .digest("hex");

  const baseString =
    partner_id + path + timestamp + bodyHash;

  const signature = crypto
    .createHmac("sha256", partner_key)
    .update(baseString)
    .digest("hex");

  return `SHA256 Credential=${partner_id}, Timestamp=${timestamp}, Signature=${signature}`;
}

// 🚀 ROTA PRINCIPAL
app.post("/gerar-link", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL não enviada" });
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const query = `
mutation {
  generateShortLink(input: {
    originUrl: "${url}",
    subIds: ["s1","s2","s3","s4","s5"]
  }) {
    shortLink
  }
}
`;

    const body = JSON.stringify({ query });

    const auth = generateAuth(body, timestamp);

    const response = await