"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type CategoryId = "carnes" | "bebidas" | "salada" | "sobremesa" | "extras";

type Item = {
  id: string;
  name: string;
  qty: string;
  icon: string;
  category: CategoryId;
  checked: boolean;
};

const categories: Record<
  CategoryId,
  { title: string; subtitle: string; icon: string; accent: string }
> = {
  carnes: {
    title: "Carnes & Fogo",
    subtitle: "o principal da brasa",
    icon: "🥩",
    accent: "#ff6a22",
  },
  bebidas: {
    title: "Bebidas & Tempero",
    subtitle: "gelado, cítrico e certeiro",
    icon: "🍹",
    accent: "#9bd85f",
  },
  salada: {
    title: "Salada",
    subtitle: "alface e tomate já garantidos",
    icon: "🥗",
    accent: "#55b978",
  },
  sobremesa: {
    title: "Sobremesa",
    subtitle: "mousse de maracujá com chocolate",
    icon: "🍮",
    accent: "#f4bd37",
  },
  extras: {
    title: "Itens adicionados",
    subtitle: "o que a família lembrar na hora",
    icon: "➕",
    accent: "#6fb7ff",
  },
};

const baseItems: Item[] = [
  {
    id: "contra-file",
    name: "Contra-filé",
    qty: "1,5 kg",
    icon: "🍖",
    category: "carnes",
    checked: false,
  },
  {
    id: "cupim",
    name: "Cupim",
    qty: "1,5 kg",
    icon: "🍖",
    category: "carnes",
    checked: false,
  },
  {
    id: "linguica",
    name: "Linguiça Perdigão",
    qty: "1 kg",
    icon: "🌭",
    category: "carnes",
    checked: false,
  },
  {
    id: "carvao",
    name: "Carvão",
    qty: "4 kg",
    icon: "⚫",
    category: "carnes",
    checked: false,
  },
  {
    id: "limao",
    name: "Limão",
    qty: "8 un.",
    icon: "🍋",
    category: "bebidas",
    checked: false,
  },
  {
    id: "coca-zero",
    name: "Coca-Cola Zero",
    qty: "2 L",
    icon: "🥤",
    category: "bebidas",
    checked: false,
  },
  {
    id: "h2oh",
    name: "H2OH",
    qty: "2 L",
    icon: "💧",
    category: "bebidas",
    checked: false,
  },
  {
    id: "guarana",
    name: "Guaraná",
    qty: "2 L",
    icon: "🥤",
    category: "bebidas",
    checked: false,
  },
  {
    id: "alface",
    name: "Alface",
    qty: "2 pés",
    icon: "🥬",
    category: "salada",
    checked: false,
  },
  {
    id: "tomate",
    name: "Tomate",
    qty: "5 un.",
    icon: "🍅",
    category: "salada",
    checked: false,
  },
  {
    id: "maracuja",
    name: "Maracujá",
    qty: "4 un.",
    icon: "💛",
    category: "sobremesa",
    checked: false,
  },
  {
    id: "leite-condensado",
    name: "Leite condensado",
    qty: "2 latas",
    icon: "🥛",
    category: "sobremesa",
    checked: false,
  },
  {
    id: "creme-leite",
    name: "Creme de leite",
    qty: "2 latas",
    icon: "🍶",
    category: "sobremesa",
    checked: false,
  },
  {
    id: "chocolate-amargo",
    name: "Chocolate amargo",
    qty: "200 g",
    icon: "🍫",
    category: "sobremesa",
    checked: false,
  },
];

const storageKey = "lista-churrasco-premium-v2";

function mergeStoredItems(storedItems: Item[]) {
  const storedById = new Map(storedItems.map((item) => [item.id, item]));
  const restoredBase = baseItems.map((item) => ({
    ...item,
    checked: storedById.get(item.id)?.checked ?? item.checked,
  }));
  const extras = storedItems.filter(
    (item) => !baseItems.some((baseItem) => baseItem.id === item.id),
  );

  return [...restoredBase, ...extras];
}

export default function Home() {
  const [items, setItems] = useState(baseItems);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      setItems(mergeStoredItems(JSON.parse(saved)));
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const checkedCount = items.filter((item) => item.checked).length;
  const progress = Math.round((checkedCount / items.length) * 100);
  const missingItems = useMemo(
    () => items.filter((item) => !item.checked).map((item) => item.name),
    [items],
  );

  function toggleItem(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setItems((current) => [
      ...current,
      {
        id: `extra-${Date.now()}`,
        name,
        qty: newQty.trim() || "a combinar",
        icon: "🛒",
        category: "extras",
        checked: false,
      },
    ]);
    setNewName("");
    setNewQty("");
    setShareStatus("Item adicionado.");
  }

  function resetList() {
    setItems(baseItems);
    setShareStatus("Lista limpa.");
  }

  async function shareList() {
    const text = [
      "Lista do churrasco:",
      ...items.map((item) => `${item.checked ? "✓" : "□"} ${item.name} - ${item.qty}`),
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: "Lista do Churrasco", text });
        setShareStatus("Lista compartilhada.");
        return;
      }

      await navigator.clipboard.writeText(text);
      setShareStatus("Lista copiada.");
    } catch {
      setShareStatus("Não consegui compartilhar agora.");
    }
  }

  return (
    <main className="shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero__glow" />
        <div className="eyebrow">
          <span aria-hidden="true">🔥</span>
          Churrasco de domingo
        </div>
        <h1 id="page-title">Lista do Churrasco</h1>
        <p>9 pessoas · 07 adultos + 02 crianças · pronta para mostrar no celular.</p>

        <div className="hero__stats" aria-label="Resumo da lista">
          <div>
            <strong>{items.length}</strong>
            <span>itens</span>
          </div>
          <div>
            <strong>{checkedCount}</strong>
            <span>comprados</span>
          </div>
          <div>
            <strong>{missingItems.length}</strong>
            <span>faltando</span>
          </div>
        </div>
      </section>

      <section className="progress-card" aria-label="Progresso da compra">
        <div>
          <span>Progresso</span>
          <strong>
            {checkedCount} de {items.length}
          </strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <form className="add-form" onSubmit={addItem}>
        <label htmlFor="new-product">Adicionar produto</label>
        <div className="add-form__row">
          <input
            id="new-product"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Ex.: pão de alho"
            autoComplete="off"
          />
          <input
            aria-label="Quantidade"
            className="qty-input"
            value={newQty}
            onChange={(event) => setNewQty(event.target.value)}
            placeholder="Qtd."
            autoComplete="off"
          />
          <button type="submit">Adicionar</button>
        </div>
      </form>

      {(
        ["carnes", "bebidas", "salada", "sobremesa", "extras"] as CategoryId[]
      ).map((categoryId) => {
        const categoryItems = items.filter((item) => item.category === categoryId);
        if (categoryItems.length === 0) return null;
        const category = categories[categoryId];

        return (
          <section
            className="category"
            key={categoryId}
            style={{ "--accent": category.accent } as CSSProperties}
          >
            <header className="category__header">
              <div className="category__icon">{category.icon}</div>
              <div>
                <h2>{category.title}</h2>
                <p>{category.subtitle}</p>
              </div>
            </header>

            <div className="items">
              {categoryItems.map((item) => (
                <button
                  className={`item ${item.checked ? "item--checked" : ""}`}
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  type="button"
                  aria-pressed={item.checked}
                >
                  <span className="check" aria-hidden="true">
                    {item.checked ? "✓" : ""}
                  </span>
                  <span className="item__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="item__name">{item.name}</span>
                  <span className="item__qty">{item.qty}</span>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      <section className="note">
        <strong>Tomate está na lista.</strong>
        <span>
          Fica em Salada junto com o alface. Os novos produtos entram no campo
          acima e ficam salvos neste aparelho.
        </span>
      </section>

      <div className="actions" aria-label="Ações da lista">
        <button type="button" onClick={shareList}>
          Compartilhar
        </button>
        <button type="button" className="secondary" onClick={resetList}>
          Limpar marcações
        </button>
      </div>

      <p className="status" role="status">
        {shareStatus || "Toque nos itens para marcar o que já foi comprado."}
      </p>
    </main>
  );
}
