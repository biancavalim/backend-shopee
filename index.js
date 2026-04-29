const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
app.use(express.json());

const partner_id = "18383580742";
const partner_key = "SVKIDYM7SDFMF6DRRKMWHSKGOOITWSAS";

function generateAuth(body, timestamp) {
  const path = "/graphql";

  // 🔥 HASH DO BODY EXATO
  const bodyHash = crypto
    .createHash("sha256")
    .update(body, "utf8")
    .digest("hex");

  // 🔥 BASE STRING EXATA
  const baseString = `${partner_id}${path}${timestamp}${bodyHash}`;

  const signature = crypto
    .createHmac("sha256", partner_key)
    .update(baseString, "utf8")
    .digest("hex");

  return `SHA256 Credential=${partner_id}, Timestamp=${timestamp}, Signature=${signature}`;
}

app.post("/gerar-link", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL não enviada" });
    }

    // 🔥 STRING SEM QUEBRA ERRADA
    const query = `mutation { generateShortLink(input: { originUrl: "${url}", subIds: ["s1"] }) { shortLink } }`;

    // 🔥 BODY EXATO
    const body = JSON.stringify({
      query: query
    });

    const timestamp = Math.floor(Date.now() / 1000);

    const auth = generateAuth(body, timestamp);

    const response = await axios.post(
      "https://open-api.affiliate.shopee.com.br/graphql",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": auth
        }
      }
    );

    return res.json(response.data);

  } catch (error) {
    return res.status(500).json({
      error: "Falha",
      detalhe: error.response?.data || error.message
    });
  }
});

app.listen(3000, () => console.log("rodando"));