# Imagens no MDX: largura responsiva (wsm / wlg)

As imagens aceitam parâmetros opcionais no título (a string entre aspas após a URL) para controlar a largura em função do viewport.

- `wsm=NN` → largura em % da largura do viewport (vw) quando a tela é menor que `md` (mobile)
- `wlg=NN` → largura em % da largura do viewport (vw) quando a tela é `md` ou maior (desktop)
- Alternativa compacta: `size=SM,LG` (equivalente a `wsm=SM wlg=LG`)

Se nenhum parâmetro for informado, a imagem mantém o comportamento padrão atual (fluida dentro do container, sem largura fixa).

Observação: os valores são clampados entre 0 e 100.

---

## Exemplos prontos para copiar

### 1) Sem parâmetros (comportamento atual)

```md
![Exemplo de biorreator de bancada](exemplo_biorreator.jpg)
```

### 2) 100% no mobile e 60% no desktop

```md
![Exemplo de biorreator de bancada](exemplo_biorreator.jpg "wsm=100 wlg=60")
```

### 3) Apenas desktop (mobile permanece padrão)

```md
![Legenda](exemplo.jpg "wlg=50")
```

### 4) Apenas mobile (desktop permanece padrão)

```md
![Legenda](exemplo.jpg "wsm=90")
```

### 5) Formato alternativo (equivalente ao item 2)

```md
![Legenda](exemplo.jpg "size=100,60")
```

---

## Notas de renderização

- A imagem mantém `max-width: 100%` e `height: auto`, portanto nunca “estoura” o container.
- Em telas ≥ `md`, se `wlg` não for informado mas `wsm` for, o valor de `wsm` é reaproveitado como fallback.
- Quando uma imagem aparece sozinha dentro de um parágrafo e possui `alt`, ela é promovida para `<figure>` com `<figcaption>` usando o texto do `alt`.

## Dicas

- Use `wlg` para evitar imagens muito grandes em telas largas (ex.: `wlg=60`).
- Use `wsm` se quiser reduzir a imagem no mobile (ex.: `wsm=90`).
- Se preferir escrever menos, use `size=SM,LG` (ex.: `size=100,60`).
