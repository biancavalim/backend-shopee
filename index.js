const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// 🔑 CREDENCIAIS
const partner_id = "18383580742";
const partner_key = "SVKIDYM7SDFMF6DRRKMWHSKGOOITWSAS";

// 🔥 ROTA GERAR LINK
app.post("/gerar-link", async (req, res) => {
  try {
    console.log("👉 Requisição recebida");

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL não enviada" });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const path = "/api/v2/affiliate/link/create";

    // 🔐 assinatura correta Shopee
    const baseString = `${partner_id}${path}${timestamp}`;

    const sign = crypto
      .createHmac("sha256", partner_key)
      .update(baseString)
      .digest("hex");

    const fullUrl = `https://partner.shopeemobile.com${path}`;

    console.log("🔗 Chamando Shopee API...");

    const response = await axios.post(
      `${fullUrl}?partner_id=${partner_id}&timestamp=${timestamp}&sign=${sign}`,
      {
        original_url: url,
        affiliate_id: partner_id
      },
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Resposta Shopee:", response.data);

    const link =
      response.data?.data?.short_link ||
      response.data?.data?.link;

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

// 🔥 TESTE
app.get("/", (req, res) => {
  res.send("API Shopee rodando 🚀");
});

// 🚀 START
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});