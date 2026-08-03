import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the barbecue list page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Rachides entre amigos<\/title>/i);
  assert.match(html, /Rachides entre amigos/);
  assert.match(html, /Café da tarde/);
  assert.match(html, /Nome do evento/);
  assert.match(html, /Adicionar produto/);
  assert.match(html, /Farinha de trigo/);
  assert.match(html, /Leite/);
  assert.match(html, /Fermento/);
  assert.match(html, /Coco ralado/);
  assert.match(html, /Manteiga sem sal/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /content="https:\/\/esdraaline\.github\.io\/lista-churrasco-familia\/preview-whatsapp\.jpg"/);
  assert.match(html, /name="twitter:image"/);
  assert.doesNotMatch(html, /Churrasco de domingo/);
  assert.doesNotMatch(html, /Tomate está na lista/i);
  assert.doesNotMatch(html, /novos produtos entram no campo/i);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
});

test("ships the WhatsApp preview image", async () => {
  const image = await stat(new URL("../public/preview-whatsapp.jpg", import.meta.url));
  assert.ok(image.size > 100_000);
  assert.ok(image.size < 250_000);
});

test("GitHub Pages build contains grocery status tabs", async () => {
  const html = await readFile(new URL("../docs/index.html", import.meta.url), "utf8");
  assert.match(html, /Rachides entre amigos/);
  assert.match(html, /Café da tarde/);
  assert.match(html, /Nome do evento/);
  assert.match(html, /rachides-event-title-v2/);
  assert.match(html, /lista-churrasco-github-pages-v3-cafe/);
  assert.match(html, /Farinha de trigo/);
  assert.match(html, /Leite/);
  assert.match(html, /Fermento/);
  assert.match(html, /Coco ralado/);
  assert.match(html, /Manteiga sem sal/);
  assert.match(html, /Exportar imagem/);
  assert.match(html, /exportShoppingImage/);
  assert.match(html, /exportBillImage/);
  assert.match(html, /shareOrDownloadCanvas/);
  assert.match(html, /Minhas compras/);
  assert.match(html, /Concluídas/);
  assert.match(html, /Adiadas/);
  assert.match(html, /Dividir conta/);
  assert.match(html, /postponeItem/);
  assert.match(html, /unpostponeItem/);
  assert.match(html, /calculateBill/);
  assert.match(html, /createUniqueId/);
  assert.match(html, /normalizeParticipants/);
  assert.match(html, /Quem pagou tudo\?/);
  assert.match(html, /Escolha o pagante/);
  assert.match(html, /Colocar total nesse pagante/);
  assert.match(html, /Calcular divisão/);
  assert.match(html, /Usar soma dos pagamentos/);
  assert.match(html, /Acerto sugerido/);
  assert.match(html, /Desmarcar concluídos/);
  assert.doesNotMatch(html, /payer-josemar|payer-valdemir|payer-alifer/);
  assert.doesNotMatch(html, /Josemar|Valdemir|Alifer/);
  assert.doesNotMatch(html, /Churrasco de domingo/);
  assert.doesNotMatch(html, /Contra-filé|Cupim|Tomate|Carvão|Guaraná/);
  assert.doesNotMatch(html, /payer-\$\{Date\.now\(\)\}|extra-\$\{Date\.now\(\)\}/);
  assert.doesNotMatch(html, /splitCount:\s*"3"/);
  assert.doesNotMatch(html, /Rotina|Agenda/);
});

test("removes the temporary starter preview from the product source", async () => {
  const [page, layout, packageJson, appEntries] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readdir(new URL("../app/", import.meta.url)),
  ]);

  assert.match(page, /baseItems/);
  assert.match(page, /id: "farinha-trigo"/);
  assert.match(page, /Manteiga sem sal/);
  assert.match(page, /function addItem/);
  assert.doesNotMatch(page, /detergente/i);
  assert.doesNotMatch(layout, /Starter Project|codex-preview|_sites-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.ok(!appEntries.includes("_sites-preview"));
});
