# GestureStrike FPS Frontend

Aplicação frontend de um FPS web controlado por gestos manuais, com renderização 3D em tempo real, painel tático e experiência orientada a usabilidade.

## Visão Geral do Frontend

Este projeto entrega uma experiência de gameplay no navegador em que:

- a webcam captura landmarks das mãos com MediaPipe
- os gestos são convertidos em comandos de movimentação/combate
- o motor 3D exibe a cena FPS com HUD em tempo real
- o usuário pode calibrar o rastreamento e ajustar preferências de UX/performance

Público-alvo:

- usuários finais que querem interação hands-free
- times de produto/engenharia explorando interfaces naturais
- desenvolvedores frontend/game web interessados em visão computacional aplicada

## Stack e Tecnologias

- `React 19`
- `TypeScript`
- `Vite 7`
- `Three.js`
- `@react-three/fiber`
- `@react-three/drei`
- `@google/genai` (módulo opcional de geração cinematográfica)
- `MediaPipe Hands` (via CDN)
- CSS customizado com tokens de design (`styles.css`)

## Análise Técnica Aplicada

Durante a revisão frontend, os principais pontos endereçados foram:

- simplificação do fluxo de estado com reducer previsível
- redução de acoplamento entre UI e regras de gameplay
- remoção de código duplicado/morto (`VeoAnimator`)
- melhora de renderização com split de chunks e lazy loading
- reforço de acessibilidade semântica e navegação por teclado
- melhorias de SEO técnico no `index.html`

## Otimizações e Refactor

### Arquitetura

- Estado centralizado em `App.tsx` com ações explícitas.
- Configurações de gameplay extraídas para `config/gameConfig.ts`.
- Tipagem de domínio expandida em `types.ts`.

### Performance

- `React.lazy` para `GameContainer` e `CinematicGenerator`.
- Manual chunks no Vite (`vendor-three`, `vendor-genai`).
- Modo Performance para reduzir custo de render em dispositivos limitados.
- Loop de tracker pausado com baixa frequência quando o jogo não está ativo.

### Acessibilidade e UX

- `aria` em diálogos e regiões críticas.
- `skip link` para navegação rápida por teclado.
- foco visível padronizado (`:focus-visible`).
- `aria-live` para status operacional.
- painel de ajuda com gestos + atalhos (`H`, `?`, `P`, `C`, `Esc`).
- persistência de preferências (dificuldade, haptics, redução de movimento, performance, calibração).

### SEO Técnico

- `meta description`, `robots`, `theme-color`
- metatags Open Graph/Twitter
- `noscript` de fallback

## Novas Funcionalidades Implementadas

1. Persistência de preferências no `localStorage`
- melhora continuidade da experiência entre sessões
- reduz fricção de reconfiguração

2. Painel de ajuda contextual
- reduz curva de aprendizado dos gestos e atalhos
- aumenta usabilidade em sessões curtas

3. Modo Performance
- reduz carga visual/GPU mantendo jogabilidade
- melhora experiência em notebooks e máquinas mais simples

## Estrutura do Projeto

```txt
.
├── App.tsx
├── index.tsx
├── index.html
├── styles.css
├── types.ts
├── global.d.ts
├── hooks/
│   └── usePersistentState.ts
├── config/
│   └── gameConfig.ts
├── components/
│   ├── CalibrationPanel.tsx
│   ├── CinematicGenerator.tsx
│   ├── GameContainer.tsx
│   ├── HandTracker.tsx
│   ├── HelpPanel.tsx
│   └── HUD.tsx
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Setup e Execução

## Pré-requisitos

- `Node.js` 20+
- webcam habilitada
- navegador com WebGL

## Instalação

```bash
npm install
```

## Ambiente de desenvolvimento

```bash
npm run dev
```

Aplicação em `http://localhost:3000`.

## Build de produção

```bash
npm run build
npm run preview
```

## Variável opcional

```env
VITE_GEMINI_API_KEY=sua_chave
```

Se não informar no `.env`, a chave pode ser inserida no modal cinematográfico.

## Boas Práticas Adotadas

- componentização orientada a responsabilidade
- tokenização visual para consistência do design system
- tratamento de erro de câmera e fallback de módulos
- controle de estado previsível e tipado
- UI responsiva com comportamento mobile/desktop
- foco em acessibilidade e teclado

## Melhorias Futuras

- testes automatizados (unitários + e2e)
- persistência de histórico de partidas (leaderboard local/remoto)
- internacionalização (`pt-BR` / `en`)
- observabilidade frontend (Sentry + Web Vitals)
- backend para geração cinematográfica sem chave exposta no client

---

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
