const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// 🔑 CREDENCIAIS
const partner_id = "18383580742";
const partner_key = "SVKIDYM7SDFMF6DRRKMWHSKGOOITWSAS";
const affiliate_id = "18383580742";

// 🔥 ROTA PRINCIPAL
app.post("/gerar-link", async (req, res) => {
  try {
    console.log("👉 requisição recebida");

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL não enviada" });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const path = "/api/v2/affiliate/link/create";

    const baseString = `${partner_id}${path}${timestamp}`;

    const sign = crypto
      .createHmac("sha256", partner_key)
      .update(baseString)
      .digest("hex");

    console.log("🔐 assinatura gerada");

    // ⏱️ TIMEOUT PRA NÃO TRAVAR
    const response = await axios.post(
      `https://open-api.shopee.com.br${path}?partner_id=${partner_id}&timestamp=${timestamp}&sign=${sign}`,
      {
        original_url: url,
        affiliate_id: affiliate_id
      },
      {
        timeout: 10000 // 10 segundos máximo
      }
    );

    console.log("✅ resposta recebida");

    const link = response.data?.data?.short_link;

    if (!link) {
      return res.status(500).json({
        error: "Shopee não retornou link"
      });
    }

    return res.json({ link });

  } catch (error) {
    console.log("❌ ERRO:", error.response?.data || error.message);

    // 🔥 RESPOSTA SEGURA (não trava front)
    return res.status(500).json({
      error: "Falha ao gerar link",
      detalhe: error.response?.data || error.message
    });
  }
});

// 🔥 TESTE DE SERVIDOR
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// 🚀 START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});