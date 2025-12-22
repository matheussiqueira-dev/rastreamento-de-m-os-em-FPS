# GestureStrike FPS Prototype

Este projeto consiste em um protótipo funcional de um jogo de tiro em primeira pessoa (FPS) executado inteiramente no navegador, onde o controle do personagem e as mecânicas de combate são operados exclusivamente por meio de gestos manuais capturados via webcam.

## Visão Geral

O sistema utiliza processamento de visão computacional em tempo real para mapear marcos das mãos e traduzi-los em comandos de entrada para um ambiente 3D. A tela é dividida em duas zonas virtuais: o lado esquerdo gerencia a locomoção (joystick virtual) e o lado direito controla os sistemas de armamento e combate.

## Tecnologias Utilizadas

*   React: Estrutura principal da interface e gerenciamento de estado.
*   Three.js / React Three Fiber: Motor de renderização 3D para o ambiente e lógica de jogo.
*   MediaPipe: Biblioteca de visão computacional para rastreamento de mãos de alta fidelidade.
*   Tailwind CSS: Estilização da interface de usuário e do HUD (Heads-Up Display).
*   Vibration API: Feedback tátil (haptics) para imersão durante disparos e movimentação.

## Comandos por Gestos

O protótipo exige o uso de ambas as mãos para uma experiência completa.

### Movimentação (Mão Esquerda)

A posição da mão em relação ao centro da zona esquerda determina a direção do movimento.

*   Mão para Cima: Avançar
*   Mão para Baixo: Recuar
*   Mão para Esquerda: Deslocamento lateral à esquerda (Strafe)
*   Mão para Direita: Deslocamento lateral à direita (Strafe)
*   Punho Fechado: Parar movimento

### Combate (Mão Direita)

O sistema reconhece poses específicas para simular a operação de uma arma de fogo.

*   Gesto de Arma (Indicador estendido e Polegar para cima): Mirar
*   Gesto de Arma + Dobrar o Indicador: Disparar
*   Gesto de Arma + Dedo Médio Estendido: Mira de precisão (Iron Sight)
*   Mão Aberta: Recarregar munição

## Funcionalidades de Jogo

*   Interface HUD Dinâmica: Monitoramento de saúde, pontuação e munição com estética futurista.
*   Inteligência Artificial: Inimigos com três estados distintos de comportamento (Patrulha, Alerta e Ataque).
*   Feedback Tátil: Vibrações sincronizadas com passos em diferentes superfícies e recuo da arma.
*   Motor de Análise Cinemática: Ferramenta integrada para processar capturas de tela e gerar sequências animadas de alta qualidade.

## Requisitos do Sistema

Para o correto funcionamento do protótipo, é necessário:

1.  Acesso à câmera (webcam).
2.  Iluminação adequada para o rastreamento preciso dos marcos manuais.
3.  Navegador moderno com suporte a WebGL e permissões de hardware ativadas.

## Créditos

Protótipo desenvolvido por Matheus Siqueira.