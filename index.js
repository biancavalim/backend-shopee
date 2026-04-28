const crypto = require("crypto");
const axios = require("axios");

const partner_id = "18383580742";
const partner_key = "SVKIDYM7SDFMF6DRRKMWHSKGOOITWSAS";

// 🔐 GERA AUTH CORRETO
function generateAuth(body, timestamp) {
  const path = "/graphql";

  // 1. HASH DO BODY (ESSENCIAL)
  const bodyHash = crypto
    .createHash("sha256")
    .update(body)
    .digest("hex");

  // 2. BASE STRING CORRETA
  const baseString =
    partner_id + path + timestamp + bodyHash;

  // 3. SIGNATURE
  const signature = crypto
    .createHmac("sha256", partner_key)
    .update(baseString)
    .digest("hex");

  // 4. HEADER FINAL (ORDEM IMPORTA)
  return `SHA256 Credential=${partner_id}, Timestamp=${timestamp}, Signature=${signature}`;
}

// 🚀 FUNÇÃO PRINCIPAL
async function gerarLink(url) {
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

  // ⚠️ IMPORTANTE: body EXATO enviado
  const body = JSON.stringify({ query });

  const auth = generateAuth(body, timestamp);

  const response = await axios.post(
    "https://open-api.affiliate.shopee.com.br/graphql",
    body,
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": auth
      },
      timeout: 15000
    }
  );

  return response.data;
}