const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const partner_id = "18383580742";
const partner_key = "SVKIDYM7SDFMF6DRRKMWHSKGOOITWSAS";

// 🔐 GERADOR DE AUTH
function generateShopeeAuth(partner_id, partner_key) {
  const timestamp = Math.floor(Date.now() / 1000);

  const baseString = `${partner_id}${timestamp}`;

  const signature = crypto
    .createHmac("sha256", partner_key)
    .update(baseString)
    .digest("hex");

  return {
    authorization: `SHA256 Credential=${partner_id}, Signature=${signature}, Timestamp=${timestamp}`,
    timestamp
  };
}

// 🚀 ROTA
app.post("/gerar-link", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL não enviada" });
    }

    const auth = generateShopeeAuth(partner_id, partner_key);

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
          "Authorization": auth.authorization
        },
        timeout: 15000
      }
    );

    const link =
      response.data?.data?.generateShortLink?.shortLink;

    if (!link) {
      return res.status(500).json({
        error: "Shopee não retornou link",
        debug: response.data
      });
    }

    return res.json({ link });

  } catch (error) {
    console.log("❌ ERRO:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Falha ao gerar link",
      detalhe: error.response?.data || error.message
    });
  }
});

// 🧪 TESTE
app.get("/", (req, res) => {
  res.send("API Shopee GraphQL rodando 🚀");
});

// 🚀 START
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});