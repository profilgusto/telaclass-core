# Layouts de Slides - Documentação

Esta funcionalidade permite controlar o layout dos slides em apresentações MDX através de comandos especiais.

## Como Usar

### Comandos Disponíveis

- `---sldlayout1`: Layout vertical (padrão) - texto e imagens em sequência vertical
- `---sldlayout2`: Layout horizontal - texto à esquerda, imagens à direita

### Sintaxe

Os comandos de layout devem ser colocados em uma linha própria no arquivo MDX:

```mdx
## Título do Slide

Conteúdo do slide...

---sldbrk

---sldlayout2

## Próximo Slide com Layout Horizontal

Este slide usará o layout horizontal.

![](imagem.png "Descrição da imagem")
```

### Comportamento

1. **Herança de Layout**: Uma vez definido, o layout se aplica a todos os slides seguintes até que um novo comando de layout seja encontrado.

2. **Layout Padrão**: Se nenhum comando for especificado, o layout padrão (vertical) será usado.

3. **Apenas em Modo Apresentação**: Os layouts especiais só são aplicados no modo de apresentação. No modo texto, o conteúdo é renderizado normalmente.

## Layouts Disponíveis

### Layout 1 - Vertical (Padrão)
- Texto e imagens são renderizados sequencialmente na vertical
- Comportamento tradicional dos slides
- Usado por padrão quando nenhum layout é especificado

### Layout 2 - Horizontal
- Divide o slide em duas colunas
- Texto fica na coluna da esquerda
- Imagens ficam na coluna da direita
- Layout responsivo (em telas pequenas volta para vertical)

## Detecção de Imagens

O sistema automaticamente identifica e separa:
- Elementos `<img>`
- Elementos `<figure>`
- Componentes de imagem customizados
- Parágrafos contendo apenas imagens

## Exemplo Completo

```mdx
# Apresentação sobre SCADA

## Introdução
<!-- Este slide usa layout padrão (vertical) -->

SCADA significa Supervisory Control and Data Acquisition.

![](intro-scada.png "Introdução ao SCADA")

---sldbrk

---sldlayout2

## Arquitetura do Sistema
<!-- Este e os próximos slides usarão layout horizontal -->

O sistema SCADA possui os seguintes componentes:

- Sensores e atuadores
- Unidades remotas (RTUs)
- Sistema de comunicação
- Centro de controle

![](arquitetura.png "Arquitetura SCADA")
![](componentes.png "Componentes do sistema")

---sldbrk

## Benefícios
<!-- Continua usando layout horizontal -->

Principais vantagens do SCADA:

- Monitoramento remoto
- Controle centralizado
- Histórico de dados
- Alarmes e notificações

![](beneficios.png "Benefícios do SCADA")

---sldbrk

---sldlayout1

## Conclusão
<!-- Volta para o layout vertical -->

O SCADA é essencial para automação industrial moderna.

![](conclusao.png "Conclusão")
```

## Notas Técnicas

- Os comandos de layout são processados no pipeline MDX durante a compilação
- A separação de conteúdo (texto vs imagens) é feita dinamicamente no React
- O sistema é totalmente compatível com o código existente
- Não há impacto na performance pois a lógica é simples e eficiente