const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
app.use(express.json());

const partner_id = "18383580742";
const partner_key = "SVKIDYM7SDFMF6DRRKMWHSKGOOITWSAS";

function generateAuth(timestamp) {
  const path = "/graphql";

  const baseString =
    partner_id + path + timestamp;

  const signature = crypto
    .createHmac("sha256", partner_key)
    .update(baseString)
    .digest("hex");

  return `SHA256 Credential=${partner_id}, Timestamp=${timestamp}, Signature=${signature}`;
}

app.post("/gerar-link", async (req, res) => {
  try {
    const { url } = req.body;

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

    const response = await axios.post(
      "https://open-api.affiliate.shopee.com.br/graphql",
      { query },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": generateAuth(timestamp)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("rodando"));