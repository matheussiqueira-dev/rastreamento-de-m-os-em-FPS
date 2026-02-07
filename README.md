# GestureStrike FPS

Protótipo de FPS em navegador controlado por gestos de mão com visão computacional em tempo real.

## Visão Geral do Projeto

O projeto transforma movimentos manuais capturados por webcam em comandos de jogo para um ambiente 3D em primeira pessoa.  
O objetivo é validar uma experiência de gameplay hands-free com foco em:

- baixa fricção de interação
- resposta visual/tátil imediata
- arquitetura preparada para evolução de produto

Público-alvo principal:

- estúdios e squads de P&D em interfaces naturais
- desenvolvedores de jogos web com interesse em visão computacional
- criadores de experiências imersivas sem periféricos tradicionais

## Tecnologias Utilizadas

- React 19 + TypeScript
- Vite 7
- Three.js + React Three Fiber + Drei
- MediaPipe Hands (via CDN)
- Gemini/Google GenAI (`@google/genai`) para geração cinematográfica opcional
- CSS customizado com design tokens (sem dependência de Tailwind runtime)

## Funcionalidades Principais

- Controle por gestos com duas mãos (movimento + combate)
- IA inimiga com estados `PATROLLING`, `ALERT`, `ATTACKING`
- HUD tático com telemetria de sessão em tempo real
- Dificuldades configuráveis (`Casual`, `Tactical`, `Insane`)
- Pausa de partida e resumo pós-jogo
- Calibração de rastreamento com sliders em tempo real
- Feedback háptico (quando suportado pelo navegador/dispositivo)
- Gerador de sequência cinematográfica por imagem + prompt

## Melhorias Implementadas (Refactor v2)

### Arquitetura e Código

- Estado de jogo reestruturado com reducer previsível
- Separação de configuração em `config/gameConfig.ts`
- Tipagem ampliada para dificuldade, estatísticas e calibração
- Remoção de código duplicado e componentes redundantes
- Eliminação de acoplamento frágil com `process.env` no client

### Performance e Escalabilidade

- Redução de re-render do loop 3D com sincronização periódica de inimigos
- Lazy loading de módulos pesados (`GameContainer`, `CinematicGenerator`)
- Split de chunks por domínio (`vendor-three`, `vendor-genai`)
- Melhoria na estabilidade de detecção com suavização configurável

### Segurança e Robustez

- Fluxo de API Key da geração cinematográfica tratado explicitamente
- Download de vídeo via `blob` (reduz exposição direta de URL com chave)
- Tratamento de erros de câmera e fallback de runtime

### UI/UX

- Redesign completo de menu, overlays, HUD e controles
- Hierarquia visual clara com tipografia e tokens visuais consistentes
- Melhor responsividade para desktop/mobile
- Opção de redução de movimento para conforto/acessibilidade

## Instalação e Uso

## Pré-requisitos

- Node.js 20+ (recomendado)
- Webcam disponível e permissão concedida no navegador
- Navegador com suporte WebGL

## Passos

```bash
npm install
npm run dev
```

Aplicação disponível em `http://localhost:3000`.

## Build de produção

```bash
npm run build
npm run preview
```

## Variáveis de ambiente (opcional)

Crie um arquivo `.env` (raiz do projeto):

```env
VITE_GEMINI_API_KEY=sua_chave_gemini
```

Se não definir no `.env`, você pode informar a chave diretamente no modal de geração cinematográfica.

## Estrutura do Projeto

```text
.
├── App.tsx
├── index.tsx
├── styles.css
├── types.ts
├── global.d.ts
├── config/
│   └── gameConfig.ts
├── components/
│   ├── CalibrationPanel.tsx
│   ├── CinematicGenerator.tsx
│   ├── GameContainer.tsx
│   ├── HUD.tsx
│   └── HandTracker.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Fluxo Principal de Jogo

1. Usuário define dificuldade e preferências no menu inicial.
2. Tracker ativa webcam e traduz landmarks em gestos.
3. Motor 3D consome gestos para movimento, tiro e recarga.
4. HUD apresenta métricas críticas (saúde, munição, precisão, onda).
5. Ao final, tela de resultados exibe desempenho consolidado.

## Boas Práticas Aplicadas

- Estado centralizado e imutável em pontos críticos
- Tipagem forte para evitar regressões comportamentais
- Lazy loading para diminuir custo de carregamento inicial
- CSS orientado a tokens para consistência visual
- Separação clara entre domínio (estado/config) e apresentação (UI)

## Possíveis Melhorias Futuras

- Matchmaking/co-op e placar online
- Persistência de perfil e calibração por usuário
- Replay com timeline de eventos por frame
- Integração com backend para geração cinematográfica server-side
- Testes automatizados (unit + e2e) para fluxos críticos

---

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
