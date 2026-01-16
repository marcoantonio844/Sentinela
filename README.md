# 🚛 SENTINELA - Sistema de Gestão de Frotas v1.0

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

> **Um painel de controle logístico avançado (War Room) com simulação de telemetria em tempo real, interface futurista e feedback por voz.**

---

## 🚀 Sobre o Projeto

O **SENTINELA** é uma aplicação Frontend desenvolvida em Angular que simula um sistema operacional de monitoramento de frotas de alta complexidade. O objetivo foi criar uma experiência imersiva que vai além de um CRUD simples, implementando física simulada, mapas interativos e uma UI reativa.

O sistema opera com um **Motor de Física no Frontend** que calcula, segundo a segundo, o consumo de combustível, variação de RPM e velocidade dos caminhões, criando um cenário vivo e dinâmico.

## ✨ Funcionalidades Principais

### 🧠 Inteligência & Simulação
- **Motor de Física em Tempo Real:** Simulação de velocidade, RPM, temperatura do motor e consumo de combustível variando a cada segundo.
- **Módulo de Voz (TTS):** O sistema "fala" alertas críticos e dá boas-vindas utilizando a API de síntese de voz do navegador (em Português).
- **KPIs Dinâmicos:** Cálculo automático de média de segurança e status da frota.

### 🗺️ Mapeamento & Rastreamento
- **Mapa Interativo (Leaflet):** Renderização de veículos com ícones personalizados rotacionados conforme a direção.
- **Câmera de Perseguição:** Funcionalidade de "Seguir Veículo" que trava a câmera no caminhão em movimento.
- **Radar de Varredura:** Widget visual simulando busca por satélite.

### 🎨 UI/UX Avançada (Cyberpunk Style)
- **Intro Cinematográfica:** Vídeo de abertura com transição suave para o painel.
- **HUD de Diagnóstico:** Monitoramento flutuante de uso de CPU/RAM (simulado) com estética hacker.
- **Efeitos Visuais:** Glitch no logo, scrollbars personalizadas e animações de pulso.
- **Clima Dinâmico:** Simulação de mudança de temperatura ambiente.

### ⌨️ Produtividade
- **Atalhos de Teclado:**
  - `F`: Tela Cheia.
  - `/`: Focar na busca.
  - `[`: Recolher menu lateral.
  - `ESC`: Fechar modais.
- **Menu de Contexto (Clique Direito):** Menu personalizado ao clicar nos motoristas com ações rápidas.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Angular 17+ (Standalone Components).
- **Mapas:** Leaflet & OpenStreetMap.
- **Estilização:** CSS3 Avançado (Keyframes, Glassmorphism, Transitions).
- **Backend (Mock):** JSON Server (para simular a API REST).

---

## ⚙️ Como Rodar o Projeto

Este projeto consiste em duas partes: o Frontend (Angular) e o Backend Simulado (JSON Server).

### Pré-requisitos
- Node.js instalado.
- Angular CLI instalado (`npm install -g @angular/cli`).
