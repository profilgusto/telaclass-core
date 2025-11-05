# Componente ExternalLink

Componente para renderizar cards bonitos destacando links externos no conteúdo MDX.

## Características

- 🎨 Layout consistente com o componente `FileDownload`
- 🖼️ Busca automática do favicon do site
- 🔄 Fallback com ícone do Lucide React quando não encontra o favicon
- ⚙️ Opção para desabilitar a busca do favicon
- 📱 Responsivo e acessível
- 🎯 Abre links em nova aba com `target="_blank"` e `rel="noopener noreferrer"`

## Parâmetros

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|--------|-----------|
| `url` | `string` | ✅ Sim | - | URL do site externo |
| `title` | `string` | ❌ Não | URL | Título do link a ser exibido no card |
| `variant` | `'default' \| 'compact'` | ❌ Não | `'default'` | Variante visual do componente |
| `showFavicon` | `boolean` | ❌ Não | `true` | Habilita/desabilita a busca do favicon |
| `className` | `string` | ❌ Não | - | Classes CSS adicionais |

## Uso no MDX

### Exemplo básico

```mdx
<ExternalLink url="https://docs.ros.org" title="Documentação do ROS" />
```

### Sem título personalizado (usa a URL)

```mdx
<ExternalLink url="https://www.python.org" />
```

### Desabilitando o favicon

```mdx
<ExternalLink url="https://github.com" title="GitHub" showFavicon={false} />
```

### Variante compacta (apenas botão)

```mdx
<ExternalLink url="https://stackoverflow.com" title="Stack Overflow" variant="compact" />
```

## Como funciona

1. **Extração do domínio**: O componente extrai o domínio da URL fornecida
2. **Busca do favicon**: Utiliza o serviço do Google Favicons para buscar o ícone do site
3. **Fallback**: Se a busca falhar ou `showFavicon={false}`, usa o ícone `ExternalLink` do Lucide React
4. **Renderização**: Cria um card com:
   - Ícone (favicon ou fallback)
   - Título do link
   - Domínio (abaixo do título)
   - Botão "Visitar" com ícone de link externo

## Variantes

### Default (Card completo)
- Card com ícone, título, domínio e botão
- Ideal para destacar links importantes
- Layout responsivo (coluna em mobile, linha em desktop)

### Compact (Apenas botão)
- Botão centralizado com ícone e texto
- Ideal para links inline ou menos destaque
- Ocupa menos espaço vertical

## Acessibilidade

- ✅ Atributos `aria-label` descritivos
- ✅ Ícones marcados com `aria-hidden="true"`
- ✅ Abertura segura com `rel="noopener noreferrer"`
- ✅ Botão desabilitado quando URL não é fornecida

## Exemplo visual

O componente renderiza um card similar ao `FileDownload`, mas otimizado para links externos:

```
┌────────────────────────────────────────────────┐
│  [🌐]  Documentação do ROS         [Visitar →] │
│        docs.ros.org                             │
└────────────────────────────────────────────────┘
```
