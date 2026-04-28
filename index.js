const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🚀 ROTA PRINCIPAL
app.post("/gerar-link", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL não enviada" });
    }

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
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    console.log("📦 RESPOSTA SHOPEE:", JSON.stringify(response.data, null, 2));

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
  res.send("API Shopee rodando 🚀");
});

// 🚀 START
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});