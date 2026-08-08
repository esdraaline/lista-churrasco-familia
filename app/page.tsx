"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type CategoryId = "cafe" | "extras";

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
  cafe: {
    title: "Café da tarde",
    subtitle: "ingredientes para comprar agora",
    icon: "☕",
    accent: "#ff6a22",
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
    id: "farinha-trigo",
    name: "Farinha de trigo",
    qty: "1 un.",
    icon: "🌾",
    category: "cafe",
    checked: false,
  },
  {
    id: "leite",
    name: "Leite",
    qty: "1 un.",
    icon: "🥛",
    category: "cafe",
    checked: false,
  },
  {
    id: "fermento",
    name: "Fermento",
    qty: "1 un.",
    icon: "🧁",
    category: "cafe",
    checked: false,
  },
  {
    id: "coco-ralado",
    name: "Coco ralado",
    qty: "1 pacote",
    icon: "🥥",
    category: "cafe",
    checked: false,
  },
  {
    id: "manteiga-sem-sal",
    name: "Manteiga sem sal",
    qty: "1 pote pequeno",
    icon: "🧈",
    category: "cafe",
    checked: false,
  },
];

const storageKey = "lista-churrasco-premium-v3-cafe";
const eventStorageKey = "rachides-event-title-v2";
const defaultEventTitle = "Café da tarde";
let idSequence = 0;

function createUniqueId(prefix: string) {
  idSequence += 1;
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${idSequence.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

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
  const [eventTitle, setEventTitle] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const savedEventTitle = window.localStorage.getItem(eventStorageKey);
    // Hidratação a partir do localStorage precisa acontecer depois da montagem:
    // este componente é pré-renderizado no servidor, que não tem acesso ao
    // localStorage. Ler no inicializador do useState faria o HTML do servidor
    // (vazio) divergir do primeiro render do cliente (valor salvo), causando
    // erro de hidratação no input controlado abaixo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEventTitle(savedEventTitle || defaultEventTitle);
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

  useEffect(() => {
    const normalizedTitle = eventTitle.trim();
    if (normalizedTitle) {
      window.localStorage.setItem(eventStorageKey, normalizedTitle);
    } else {
      window.localStorage.removeItem(eventStorageKey);
    }
  }, [eventTitle]);

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
        id: createUniqueId("extra"),
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

  function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEventTitle((current) => current.trim());
    setShareStatus(eventTitle.trim() ? "Evento salvo." : "Nome do evento limpo.");
  }

  async function shareList() {
    const shareTitle = eventTitle.trim() || defaultEventTitle || "Rachides entre amigos";
    const text = [
      shareTitle,
      "Lista de compras:",
      ...items.map((item) => `${item.checked ? "✓" : "□"} ${item.name} - ${item.qty}`),
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text });
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
          <span aria-hidden="true">💸</span>
          Rachides entre amigos
        </div>
        <h1 id="page-title">Rachides entre amigos</h1>
        <p>
          {eventTitle.trim()
            ? `Evento: ${eventTitle.trim()}`
            : "Compras e conta do encontro, tudo no celular."}
        </p>

        <form className="event-editor" onSubmit={saveEvent}>
          <label htmlFor="event-title">Nome do evento</label>
          <div className="event-editor__row">
            <input
              id="event-title"
              value={eventTitle}
              onChange={(event) => setEventTitle(event.target.value)}
              placeholder="Ex.: janta na vovó Zé"
              autoComplete="off"
            />
            <button type="submit">Salvar</button>
          </div>
        </form>

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
        ["cafe", "extras"] as CategoryId[]
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
