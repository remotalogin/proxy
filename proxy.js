import { Rawali } from "rawali";
import fetch from "node-fetch";
import cheerio from "cheerio";

const app = new Rawali();

// Função pra reescrever os links da página
function reescreverLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  $("a").each((i, el) => {
    const href = $(el).attr("href");
    if (href && href.startsWith("http")) {
      $(el).attr("href", `/navegar?url=${encodeURIComponent(href)}`);
    } else if (href && href.startsWith("/")) {
      const fullUrl = new URL(href, baseUrl).href;
      $(el).attr("href", `/navegar?url=${encodeURIComponent(fullUrl)}`);
    }
  });
  return $.html();
}

// Layout básico HTML + CSS embutido
function layout(titulo, conteudo) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>${titulo}</title>
      <style>
        body { font-family: sans-serif; background: #f3f3f3; margin: 0; padding: 0; }
        .container { max-width: 900px; margin: 20px auto; padding: 20px; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        input { width: 70%; padding: 8px; }
        button { padding: 8px 16px; background: #007BFF; border: none; color: white; cursor: pointer; }
        button:hover { background: #0056b3; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Navegador Proxy 🌐</h1>
        ${conteudo}
      </div>
    </body>
    </html>
  `;
}

// Página inicial
app.get("/", (req, res) => {
  const form = `
    <form action="/navegar" method="get">
      <input name="url" placeholder="Digite a URL (https://...)" required />
      <button type="submit">Ir</button>
    </form>
  `;
  res.send(layout("Início", form));
});

// Página de navegação via proxy
app.get("/navegar", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.send("URL inválida");

  try {
    const resposta = await fetch(url);
    const html = await resposta.text();
    const reescrito = reescreverLinks(html, url);

    const barraBusca = `
      <form action="/navegar" method="get">
        <input name="url" value="${url}" />
        <button type="submit">Ir</button>
      </form>
      <p style="font-size: 12px; color: #555;">Conectado com internet do servidor</p>
    `;

    res.send(layout("Navegando", barraBusca + reescrito));
  } catch (e) {
    res.send(layout("Erro", `<p>Erro ao acessar o site: ${e.message}</p>`));
  }
});

app.listen(3000, () => {
  console.log("🧭 Navegador proxy rodando em http://localhost:3000");
});
