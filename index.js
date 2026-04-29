const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
app.use(express.json());

const partner_id = "18383580742";
const partner_key = "SVKIDYM7SDFMF6DRRKMWHSKGOOITWSAS";

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

app.post("/gerar-link", async (req, res) => {
  try {
    const { url } = req.body;

    const query = `
mutation {
  generateShortLink(input: {
    originUrl: "${url}",
    subIds: ["s1"]
  }) {
    shortLink
  }
}
`;

    const body = JSON.stringify({ query });

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

    const link =
      response.data?.data?.generateShortLink?.shortLink;

    return res.json({ link });

  } catch (error) {
    return res.status(500).json({
      error: "Falha",
      detalhe: error.response?.data || error.message
    });
  }
});

app.listen(3000, () => console.log("rodando"));