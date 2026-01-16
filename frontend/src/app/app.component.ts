import { Component, ViewChild, OnInit, OnDestroy, Inject, HostListener } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // Mantido para evitar erros, mas não será usado na busca
import { MapComponent } from './map/map.component';
import { FormsModule } from '@angular/forms'; 

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MapComponent, FormsModule], 
  template: `
    <div class="login-screen" *ngIf="!isLoggedIn">
      <div class="login-bg"></div>
      <div class="login-overlay"></div>
      <div class="login-box">
        <div class="login-logo">
          <div class="logo-circle big">S</div>
          <h1>SENTINELA</h1>
          <span>ACESSO CORPORATIVO</span>
        </div>
        <div class="input-group">
          <label>ID DO OPERADOR</label>
          <input type="text" placeholder="admin@sentinela.com.br" value="admin@sentinela.com.br">
        </div>
        <div class="input-group">
          <label>SENHA DE ACESSO</label>
          <input type="password" placeholder="••••••••" value="123456">
        </div>
        <button class="login-btn" (click)="doLogin()">ENTRAR NO SISTEMA</button>
        <div class="login-footer">
          <small>v7.0 Edição Brasil • Sentinela Logística S.A.</small>
        </div>
      </div>
    </div>

    <div class="intro-overlay" *ngIf="showIntro" [class.fade-out]="startFadeOut">
      <video autoplay muted playsinline loop class="bg-video">
        <source src="https://videos.pexels.com/video-files/3125906/3125906-hd_1920_1080_25fps.mp4" type="video/mp4">
      </video>
      <div class="video-mask"></div>
      <div class="intro-content">
        <div class="intro-logo-box">
          <h1 class="intro-title">SENTINELA</h1>
          <span class="intro-sub">SISTEMA DE MONITORAMENTO NACIONAL</span>
        </div>
        <div class="loading-container"><div class="loading-bar"></div></div>
        <p class="loading-text">> ESTABELECENDO CONEXÃO VIA SATÉLITE...</p>
      </div>
    </div>

    <div class="context-menu" *ngIf="contextMenu.visible" 
         [style.top.px]="contextMenu.y" 
         [style.left.px]="contextMenu.x"
         (click)="$event.stopPropagation()">
      <div class="ctx-header">Ações: {{ contextMenu.driver?.name }}</div>
      <button (click)="selectDriver(contextMenu.driver); closeContextMenu()">🎯 Centralizar no Mapa</button>
      <button (click)="triggerAction('Ligar'); closeContextMenu()">📞 Ligar para Motorista</button>
      <button (click)="triggerAction('Mensagem'); closeContextMenu()">💬 Enviar Mensagem</button>
      <div class="ctx-divider"></div>
      <button class="ctx-danger" (click)="triggerAction('Bloquear'); closeContextMenu()">🔒 Bloqueio de Motor</button>
    </div>

    <div class="help-modal-overlay" *ngIf="showHelp" (click)="showHelp = false">
      <div class="help-modal" (click)="$event.stopPropagation()">
        <div class="help-header">
          <span>⌨️ COMANDOS E ATALHOS</span>
          <button (click)="showHelp = false">✕</button>
        </div>
        <div class="help-body">
          <div class="shortcut-row"><span class="key">/</span><span class="desc">Ir para Busca</span></div>
          <div class="shortcut-row"><span class="key">Esc</span><span class="desc">Fechar Janelas</span></div>
          <div class="shortcut-row"><span class="key">[</span><span class="desc">Menu Lateral</span></div>
          <div class="shortcut-row"><span class="key">F</span><span class="desc">Tela Cheia</span></div>
        </div>
        <div class="help-footer">Sentinela OS v7.0</div>
      </div>
    </div>

    <div class="system-hud" *ngIf="isLoggedIn && !sidebarCollapsed">
      <div class="hud-title">DIAGNÓSTICO DO SERVIDOR</div>
      <div class="hud-row"><span>CPU</span><div class="hud-bar"><div [style.width]="hudStats.cpu + '%'"></div></div><span class="hud-val">{{hudStats.cpu}}%</span></div>
      <div class="hud-row"><span>RAM</span><div class="hud-bar"><div [style.width]="hudStats.ram + '%'"></div></div><span class="hud-val">{{hudStats.ram}}%</span></div>
      <div class="hud-row"><span>LATÊNCIA</span><span class="hud-val ping">{{hudStats.ping}} ms</span></div>
      <div class="hud-code"><span>PERDA_PCT: 0.0%</span><span>CRIPTOGRAFIA: AES-256</span></div>
    </div>

    <div class="layout" *ngIf="isLoggedIn" (click)="closeContextMenu()">
      <div class="toast-container">
        <div *ngFor="let toast of toasts" class="toast" [class]="toast.type">
          <span class="toast-icon">{{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️' }}</span>
          <span>{{ toast.message }}</span>
        </div>
      </div>

      <header class="header">
        <div class="brand">
          <div class="logo-circle">S</div>
          <div class="logo-text glitch-hover"><h1>SENTINELA</h1><span>GESTÃO DE FROTAS v7.0</span></div>
        </div>
        
        <div class="system-status">
          <div class="radar-widget" title="Escaneando Satélite..."><div class="radar-sweep"></div></div>
          <div class="live-indicator"><span class="pulsing-dot"></span> AO VIVO</div>
          <button class="icon-btn" (click)="toggleMute()" [title]="isMuted ? 'Ativar Voz' : 'Desativar Voz'">{{ isMuted ? '🔇' : '🔊' }}</button>
          <button class="icon-btn" (click)="showHelp = true" title="Ajuda">?</button>
          <button class="action-btn-header" (click)="downloadReport()" title="Baixar Planilha">📥 Exportar</button>
          <button class="icon-btn" (click)="toggleFullscreen()" title="Tela Cheia">⛶</button>
          <div class="widget warning" *ngIf="countAlerts() > 0">⚠️ {{ countAlerts() }}</div>
          <div class="widget"><span class="icon">⛅</span> {{ weatherTemp }}°C</div>
          <div class="widget time">{{ currentTime | date:'HH:mm:ss' }}</div>
          <div class="user-badge"><div class="avatar">M</div></div>
        </div>
      </header>

      <div class="main-container">
        <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
          <button class="collapse-btn" (click)="toggleSidebar()">{{ sidebarCollapsed ? '➤' : '◀' }}</button>
          
          <div class="sidebar-content" [class.hidden]="sidebarCollapsed">
            <div class="kpi-section">
              <div class="kpi-card">
                <span class="label">Pontuação Seg.</span>
                <span class="value" [style.color]="averageSafety > 80 ? '#10b981' : '#f59e0b'">{{ averageSafety }}</span>
              </div>
              <div class="kpi-card highlight">
                <span class="label">Em Operação</span>
                <span class="value">{{ countActive() }} <small style="font-size: 10px; opacity: 0.6">/ {{ drivers.length }}</small></span>
              </div>
            </div>

            <div class="controls-section">
              <div class="search-box">
                <span class="search-icon">🔍</span>
                <input #searchInput type="text" placeholder="Buscar Veículo... ( / )" [(ngModel)]="searchTerm">
              </div>
              <div class="filter-pills">
                <button [class.active]="filterStatus === 'ALL'" (click)="setFilter('ALL')">Todos</button>
                <button [class.active]="filterStatus === 'EM_ROTA'" (click)="setFilter('EM_ROTA')">Em Rota</button>
                <button [class.active]="filterStatus === 'PARADO'" (click)="setFilter('PARADO')">Parados</button>
              </div>
            </div>
          </div>
          
          <div class="driver-list">
            <div *ngIf="isLoading">
              <div class="skeleton-item" *ngFor="let i of [1,2,3,4,5]">
                <div class="sk-avatar"></div>
                <div class="sk-lines" *ngIf="!sidebarCollapsed"><div class="sk-line long"></div><div class="sk-line short"></div></div>
              </div>
            </div>

            <div *ngIf="!isLoading">
              <div *ngFor="let driver of filteredDrivers()" 
                   class="driver-item" 
                   [class.active]="selectedDriver === driver"
                   (click)="selectDriver(driver)"
                   (contextmenu)="onRightClick($event, driver)" 
                   [title]="driver.name">
                <div class="driver-avatar">{{ driver.name.charAt(0) }}</div>
                <div class="driver-details" *ngIf="!sidebarCollapsed">
                  <div class="name">{{ driver.name }}</div>
                  <div class="vehicle">{{ driver.vehicle }}</div>
                </div>
                <div class="safety-score" *ngIf="!sidebarCollapsed"
                     [class.good]="driver.telemetry.safetyScore >= 90"
                     [class.med]="driver.telemetry.safetyScore < 90 && driver.telemetry.safetyScore >= 70"
                     [class.bad]="driver.telemetry.safetyScore < 70">{{ driver.telemetry.safetyScore }}</div>
                <div class="status-indicator">
                  <div class="dot" [class.pulse]="driver.status === 'EM_ROTA'"
                       [style.background-color]="driver.status === 'EM_ROTA' ? '#10b981' : '#ef4444'"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="terminal-container" *ngIf="!sidebarCollapsed">
            <div class="terminal-header"><span>🖥️ REGISTRO DO SISTEMA</span><span class="blinking-cursor">_</span></div>
            <div class="terminal-body">
              <div *ngFor="let log of logs" class="log-line">
                <span class="time">[{{ log.time }}]</span>
                <span [class]="'msg ' + log.type"> >> {{ log.message }}</span>
              </div>
            </div>
          </div>

          <div class="telemetry-overlay" *ngIf="selectedDriver && !sidebarCollapsed">
            <div class="telemetry-header">
              <div class="t-head-info">
                <h4>{{ selectedDriver.name }}</h4>
                <span class="sub-plate">{{ selectedDriver.vehicle }}</span>
              </div>
              <button class="close-btn" (click)="closePanel()">✕</button>
            </div>
            <div class="follow-control">
              <label class="switch"><input type="checkbox" [(ngModel)]="isFollowing" (change)="toggleFollow()"><span class="slider round"></span></label>
              <span class="switch-label">Seguir Câmera</span>
            </div>
            <div class="action-grid">
              <button class="act-btn" (click)="triggerAction('Ligar')">📞 <br>Ligar</button>
              <button class="act-btn" (click)="triggerAction('Mensagem')">💬 <br>Chat</button>
              <button class="act-btn danger" (click)="triggerAction('Bloquear')">🔒 <br>Bloquear</button>
            </div>
            <div class="telemetry-content">
              <div class="chart-container" *ngIf="selectedDriver.status === 'EM_ROTA'">
                <div class="chart-label">Velocidade (Tempo Real)</div>
                <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#eee" stroke-width="1" />
                  <polyline [attr.points]="getDriverChartPoints(selectedDriver)" fill="none" stroke="#3b82f6" stroke-width="2" vector-effect="non-scaling-stroke" />
                </svg>
              </div>
              <div class="gauge-row">
                <div class="gauge-info"><span>Velocidade</span><strong>{{ selectedDriver.telemetry.speed }} km/h</strong></div>
                <div class="progress-bar"><div class="fill speed" [style.width]="(selectedDriver.telemetry.speed / 120 * 100) + '%'"></div></div>
              </div>
              <div class="gauge-row">
                <div class="gauge-info"><span>Rotação (RPM)</span><strong>{{ selectedDriver.telemetry.rpm }}</strong></div>
                <div class="progress-bar"><div class="fill rpm" [style.width]="(selectedDriver.telemetry.rpm / 2500 * 100) + '%'"></div></div>
              </div>
              <div class="gauge-row">
                <div class="gauge-info"><span>Combustível</span><strong>{{ selectedDriver.telemetry.fuel.toFixed(1) }}%</strong></div>
                <div class="progress-bar"><div class="fill fuel" [style.width]="selectedDriver.telemetry.fuel + '%'"></div></div>
              </div>
              <div class="gauge-row">
                <div class="gauge-info"><span>Temp. Motor</span><strong>{{ selectedDriver.telemetry.temp }}°C</strong></div>
                <div class="progress-bar"><div class="fill temp" [style.width]="(selectedDriver.telemetry.temp / 120 * 100) + '%'"></div></div>
              </div>
            </div>
          </div>
        </aside>

        <main class="map-area">
          <app-map #mapRef></app-map>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { --bg-dark: #0f172a; --bg-sidebar: #ffffff; --primary: #3b82f6; --success: #10b981; --danger: #ef4444; --warning: #f59e0b; --text-main: #334155; --text-muted: #94a3b8; --border: #e2e8f0; }

    /* RADAR */
    .radar-widget { width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(16, 185, 129, 0.3); position: relative; overflow: hidden; background: rgba(0,20,0,0.5); display: flex; align-items: center; justify-content: center; }
    .radar-widget::after { content: ''; width: 4px; height: 4px; background: var(--success); border-radius: 50%; }
    .radar-sweep { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: conic-gradient(from 0deg, transparent 0deg, rgba(16, 185, 129, 0.5) 60deg, transparent 60deg); animation: radarSpin 2s linear infinite; border-radius: 50%; }
    @keyframes radarSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* HUD */
    .system-hud { position: absolute; bottom: 20px; right: 20px; width: 200px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(5px); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 10px; z-index: 50; pointer-events: none; font-family: 'Consolas', monospace; color: #fff; box-shadow: 0 5px 20px rgba(0,0,0,0.4); }
    .hud-title { font-size: 10px; color: var(--primary); font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; }
    .hud-row { display: flex; align-items: center; gap: 8px; font-size: 10px; margin-bottom: 5px; }
    .hud-row span { width: 50px; opacity: 0.7; }
    .hud-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
    .hud-bar div { height: 100%; background: var(--success); transition: width 0.5s; }
    .hud-val { width: 30px; text-align: right; font-weight: bold; color: var(--success); }
    .hud-val.ping { width: auto; color: var(--warning); }
    .hud-code { margin-top: 8px; font-size: 9px; color: rgba(255,255,255,0.3); display: flex; justify-content: space-between; }

    /* GLITCH */
    .glitch-hover:hover { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; color: var(--primary); cursor: default; }
    @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-2px, 2px) } 40% { transform: translate(-2px, -2px) } 60% { transform: translate(2px, 2px) } 80% { transform: translate(2px, -2px) } 100% { transform: translate(0) } }

    /* SCROLLBARS */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    .terminal-body::-webkit-scrollbar-track { background: #0f172a; }
    .terminal-body::-webkit-scrollbar-thumb { background: #334155; }

    /* CONTEXT MENU */
    .context-menu { position: fixed; z-index: 60000; background: white; width: 200px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); border-radius: 6px; border: 1px solid var(--border); overflow: hidden; animation: fadeIn 0.1s; }
    .ctx-header { background: #f8fafc; padding: 8px 12px; font-size: 11px; font-weight: bold; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    .context-menu button { width: 100%; text-align: left; padding: 10px 12px; background: none; border: none; font-size: 13px; color: var(--text-main); cursor: pointer; transition: 0.2s; }
    .context-menu button:hover { background: #f1f5f9; color: var(--primary); }
    .ctx-divider { height: 1px; background: var(--border); margin: 2px 0; }
    .context-menu button.ctx-danger { color: var(--danger); }
    .context-menu button.ctx-danger:hover { background: #fef2f2; }

    /* HELP */
    .help-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 50000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
    .help-modal { background: white; width: 400px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3); font-family: 'Segoe UI', sans-serif; }
    .help-header { background: var(--bg-dark); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 14px; }
    .help-header button { background: none; border: none; color: white; font-size: 16px; cursor: pointer; }
    .help-body { padding: 20px; }
    .shortcut-row { display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    .key { background: #f1f5f9; border: 1px solid #cbd5e1; border-bottom: 3px solid #cbd5e1; padding: 5px 10px; border-radius: 6px; font-weight: bold; font-family: 'Consolas', monospace; color: #334155; min-width: 30px; text-align: center; margin-right: 15px; }
    .desc { font-size: 13px; color: var(--text-main); }
    .help-footer { background: #f8fafc; padding: 10px; text-align: center; font-size: 10px; color: #94a3b8; }

    /* LOGIN */
    .login-screen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; z-index: 100000; overflow: hidden; background: #000; }
    .login-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop'); background-size: cover; background-position: center; transform: scaleX(-1); opacity: 0.5; }
    .login-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(59, 130, 246, 0.4)); }
    .login-box { position: relative; z-index: 2; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); padding: 40px; border-radius: 20px; width: 350px; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 20px 50px rgba(0,0,0,0.5); animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .login-logo { text-align: center; margin-bottom: 30px; color: white; }
    .logo-circle.big { width: 60px; height: 60px; background: var(--primary); border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 800; }
    .login-logo h1 { margin: 0; font-size: 24px; letter-spacing: 2px; }
    .login-logo span { font-size: 10px; letter-spacing: 4px; opacity: 0.7; }
    .input-group { margin-bottom: 20px; }
    .input-group label { display: block; color: rgba(255,255,255,0.7); font-size: 10px; letter-spacing: 1px; margin-bottom: 5px; }
    .input-group input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; color: white; outline: none; transition: 0.3s; box-sizing: border-box; }
    .input-group input:focus { border-color: var(--primary); background: rgba(0,0,0,0.5); }
    .login-btn { width: 100%; padding: 14px; background: var(--primary); border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; font-size: 14px; letter-spacing: 1px; transition: 0.3s; margin-bottom: 20px; }
    .login-btn:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }
    .login-footer { text-align: center; color: rgba(255,255,255,0.3); font-size: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; }

    /* INTRO */
    .intro-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999; display: flex; align-items: center; justify-content: center; background: #000; overflow: hidden; transition: opacity 1s ease-in-out; }
    .intro-overlay.fade-out { opacity: 0; pointer-events: none; }
    .bg-video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; }
    .video-mask { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 5, 20, 0.7); z-index: 2; }
    .intro-content { position: relative; z-index: 3; text-align: center; color: white; font-family: 'Segoe UI', sans-serif; }
    .intro-title { font-size: 80px; font-weight: 800; letter-spacing: 5px; margin: 0; background: linear-gradient(to right, #fff, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: tracking-in 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) both; }
    .intro-sub { display: block; font-size: 14px; letter-spacing: 10px; color: #94a3b8; margin-bottom: 30px; animation: fadeIn 2s ease-in; }
    .loading-container { width: 300px; height: 4px; background: rgba(255,255,255,0.2); margin: 0 auto; border-radius: 2px; overflow: hidden; }
    .loading-bar { width: 0%; height: 100%; background: #3b82f6; box-shadow: 0 0 10px #3b82f6; animation: loadBar 4s ease-in-out forwards; }
    .loading-text { margin-top: 15px; font-family: 'Consolas', monospace; font-size: 12px; color: #3b82f6; animation: blink 0.5s infinite; }
    
    @keyframes tracking-in { 0% { letter-spacing: -0.5em; opacity: 0; } 40% { opacity: 0.6; } 100% { opacity: 1; } }
    @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
    @keyframes loadBar { 0% { width: 0%; } 40% { width: 40%; } 70% { width: 60%; } 100% { width: 100%; } }

    /* LAYOUT */
    .layout { height: 100vh; display: flex; flex-direction: column; font-family: 'Segoe UI', sans-serif; background: #f1f5f9; }
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
    .toast { pointer-events: auto; background: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; min-width: 250px; animation: slideIn 0.3s ease-out; border-left: 5px solid; }
    .toast.success { border-left-color: var(--success); } .toast.error { border-left-color: var(--danger); } .toast.info { border-left-color: var(--primary); }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    .header { background: var(--bg-dark); color: white; height: 60px; display: flex; justify-content: space-between; align-items: center; padding: 0 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 20; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo-circle { width: 36px; height: 36px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; }
    .logo-text h1 { margin: 0; font-size: 18px; font-weight: 700; }
    .logo-text span { font-size: 10px; opacity: 0.6; letter-spacing: 2px; display: block; }
    .system-status { display: flex; gap: 16px; align-items: center; }
    .live-indicator { color: var(--success); font-size: 10px; font-weight: bold; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 8px; border-radius: 20px; background: rgba(16, 185, 129, 0.1); }
    .pulsing-dot { width: 6px; height: 6px; background: var(--success); border-radius: 50%; animation: pulse 1s infinite; }
    .icon-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: 0.2s; }
    .icon-btn:hover { background: rgba(255,255,255,0.2); }
    .action-btn-header { background: var(--success); border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 5px; transition: 0.2s; }
    .action-btn-header:hover { background: #059669; }
    .widget { background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; }
    .widget.warning { background: rgba(245, 158, 11, 0.2); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.3); }
    .widget.time { font-family: 'Courier New', monospace; letter-spacing: 1px; }
    .user-badge .avatar { width: 28px; height: 28px; background: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #064e3b; }

    .main-container { flex: 1; display: flex; overflow: hidden; }
    .sidebar { width: 360px; background: var(--bg-sidebar); display: flex; flex-direction: column; z-index: 10; border-right: 1px solid var(--border); box-shadow: 4px 0 24px rgba(0,0,0,0.05); position: relative; transition: width 0.3s ease; }
    .sidebar.collapsed { width: 70px; }
    .collapse-btn { position: absolute; right: -12px; top: 80px; width: 24px; height: 24px; background: white; border: 1px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-size: 10px; color: var(--text-main); }
    .collapse-btn:hover { background: #f8fafc; }

    .kpi-section { display: flex; gap: 12px; padding: 20px 20px 10px 20px; }
    .kpi-card { flex: 1; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 12px; text-align: center; }
    .kpi-card.highlight { background: #eff6ff; border-color: #bfdbfe; }
    .kpi-card .label { display: block; font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; }
    .kpi-card .value { font-size: 24px; font-weight: 700; color: var(--text-main); transition: color 0.5s; }
    .kpi-card.highlight .value { color: var(--primary); }

    .controls-section { padding: 10px 20px; border-bottom: 1px solid var(--border); }
    .search-box { position: relative; margin-bottom: 12px; }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity: 0.5; font-size: 14px; }
    .search-box input { width: 100%; padding: 10px 10px 10px 34px; border: 1px solid var(--border); border-radius: 6px; outline: none; transition: 0.2s; box-sizing: border-box; font-size: 13px; }
    .search-box input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .filter-pills { display: flex; gap: 8px; }
    .filter-pills button { flex: 1; border: 1px solid var(--border); background: white; padding: 6px; border-radius: 20px; font-size: 11px; cursor: pointer; color: var(--text-muted); transition: 0.2s; font-weight: 600; }
    .filter-pills button.active { background: var(--text-main); color: white; border-color: var(--text-main); }

    .driver-list { flex: 1; overflow-y: auto; padding: 10px 0; }
    .sidebar.collapsed .driver-item { padding: 12px 10px; justify-content: center; }
    .sidebar.collapsed .driver-avatar { width: 40px; height: 40px; font-size: 16px; margin: 0; }
    .sidebar.collapsed .status-indicator { position: absolute; bottom: 12px; right: 15px; }
    
    .driver-item { padding: 12px 20px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: 0.2s; border-left: 3px solid transparent; position: relative; }
    .driver-item:hover { background: #f8fafc; }
    .driver-item.active { background: #eff6ff; border-left-color: var(--primary); }
    .driver-avatar { width: 40px; height: 40px; background: #e2e8f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #64748b; flex-shrink: 0; }
    .driver-item.active .driver-avatar { background: #bfdbfe; color: var(--primary); }
    .driver-details { flex: 1; white-space: nowrap; overflow: hidden; }
    .driver-details .name { font-weight: 600; font-size: 14px; color: var(--text-main); }
    .driver-details .vehicle { font-size: 12px; color: var(--text-muted); }
    .safety-score { font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; margin-right: 10px; min-width: 20px; text-align: center; }
    .safety-score.good { background: #dcfce7; color: #166534; } .safety-score.med { background: #fef9c3; color: #854d0e; } .safety-score.bad { background: #fee2e2; color: #991b1b; }
    .status-indicator .dot { width: 10px; height: 10px; border-radius: 50%; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
    .dot.pulse { animation: pulse 2s infinite; }

    .skeleton-item { padding: 12px 20px; display: flex; gap: 15px; align-items: center; }
    .sk-avatar { width: 40px; height: 40px; background: #e2e8f0; border-radius: 10px; animation: shimmer 1.5s infinite; }
    .sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .sk-line { height: 10px; background: #e2e8f0; border-radius: 4px; animation: shimmer 1.5s infinite; }
    .sk-line.long { width: 70%; } .sk-line.short { width: 40%; }
    @keyframes shimmer { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

    .terminal-container { height: 140px; background: #0f172a; color: #33ff33; font-family: 'Consolas', monospace; font-size: 11px; display: flex; flex-direction: column; border-top: 1px solid #334155; }
    .terminal-header { background: #1e293b; color: #94a3b8; padding: 6px 12px; font-size: 10px; font-weight: 700; display: flex; justify-content: space-between; }
    .terminal-body { flex: 1; overflow-y: auto; padding: 8px 12px; display: flex; flex-direction: column-reverse; }
    .log-line { margin-bottom: 4px; line-height: 1.4; }
    .log-line .time { color: #64748b; margin-right: 8px; }
    .log-line .msg.alert { color: #f87171; } .log-line .msg.info { color: #4ade80; }

    .telemetry-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); border-top: 1px solid var(--border); box-shadow: 0 -10px 30px rgba(0,0,0,0.15); z-index: 20; padding: 20px; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .telemetry-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
    .telemetry-header h4 { margin: 0; color: var(--text-main); font-size: 16px; }
    .sub-plate { font-size: 12px; color: var(--text-muted); }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted); }
    
    .follow-control { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid var(--border); }
    .switch { position: relative; display: inline-block; width: 34px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
    input:checked + .slider { background-color: var(--primary); }
    input:checked + .slider:before { transform: translateX(14px); }
    .slider.round { border-radius: 34px; } .slider.round:before { border-radius: 50%; }
    .switch-label { font-size: 12px; font-weight: 600; color: var(--text-main); }

    .action-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 15px; }
    .act-btn { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; color: var(--text-main); transition: 0.2s; }
    .act-btn:hover { background: #e2e8f0; transform: translateY(-2px); }
    .act-btn.danger { color: #dc2626; background: #fef2f2; border-color: #fee2e2; } .act-btn.danger:hover { background: #fee2e2; }

    .chart-container { margin-bottom: 15px; padding: 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; }
    .chart-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
    
    .gauge-row { margin-bottom: 12px; }
    .gauge-info { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; color: var(--text-main); }
    .progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
    .fill.speed { background: var(--primary); } .fill.rpm { background: #8b5cf6; } .fill.fuel { background: var(--success); } .fill.temp { background: #f59e0b; }

    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .map-area { flex: 1; }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  showIntro: boolean = false;
  startFadeOut: boolean = false;
  showHelp: boolean = false;
  isMuted: boolean = false;

  contextMenu = { visible: false, x: 0, y: 0, driver: null as any };
  hudStats = { cpu: 12, ram: 45, ping: 24 }; 
  weatherTemp: number = 24;

  // DADOS DOS MOTORISTAS AGORA ESTÃO AQUI DENTRO (Offline Ready)
  drivers: any[] = []; 
  
  searchTerm: string = ''; 
  selectedDriver: any = null;
  filterStatus: 'ALL' | 'EM_ROTA' | 'PARADO' = 'ALL';
  currentTime: Date = new Date();
  isLoading: boolean = true;
  isFollowing: boolean = false;
  sidebarCollapsed: boolean = false;
  averageSafety: number = 95; 

  toasts: Toast[] = [];
  private timer: any;
  private logTimer: any;
  private physicsTimer: any; 
  private titleTimer: any;
  private hudTimer: any;
  
  private titleSwitch: boolean = false;

  logs: Array<{time: string, message: string, type: string}> = [];

  @ViewChild('mapRef') mapComponent!: MapComponent;
  @ViewChild('searchInput') searchInput!: any;

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {
    this.document.title = 'SENTINELA | Monitoramento de Frotas';
    // Removemos a chamada HTTP e colocamos os dados fixos abaixo
    setTimeout(() => { this.loadDrivers(); }, 1500);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.isLoggedIn) return;
    if (event.key === 'Escape') {
      if (this.contextMenu.visible) this.closeContextMenu();
      else if (this.showHelp) this.showHelp = false;
      else if (this.selectedDriver) this.closePanel();
      else if (this.sidebarCollapsed) this.toggleSidebar();
    }
    if (event.key === '/' && (event.target as HTMLElement).tagName !== 'INPUT') {
      event.preventDefault();
      this.searchInput.nativeElement.focus();
    }
    if (event.key === '[' && (event.target as HTMLElement).tagName !== 'INPUT') {
      this.toggleSidebar();
    }
    if (event.key.toLowerCase() === 'f' && (event.target as HTMLElement).tagName !== 'INPUT') {
      this.toggleFullscreen();
    }
  }

  ngOnInit() {
    this.timer = setInterval(() => this.currentTime = new Date(), 1000);
    this.startLogSimulation();
    this.physicsTimer = setInterval(() => { this.simulatePhysics(); }, 1000);
    this.titleTimer = setInterval(() => { this.updatePageTitle(); }, 1000);
    
    this.hudTimer = setInterval(() => {
      this.hudStats.cpu = Math.floor(Math.random() * (40 - 10) + 10);
      this.hudStats.ram = Math.floor(Math.random() * (60 - 40) + 40);
      this.hudStats.ping = Math.floor(Math.random() * (50 - 15) + 15);
    }, 2000);

    setInterval(() => { this.weatherTemp += Math.floor(Math.random() * 3) - 1; }, 10000);
  }

  onRightClick(event: MouseEvent, driver: any) {
    event.preventDefault(); 
    this.contextMenu = { visible: true, x: event.clientX, y: event.clientY, driver: driver };
  }

  closeContextMenu() {
    this.contextMenu.visible = false;
  }

  doLogin() {
    this.isLoggedIn = true;
    this.showIntro = true; 
    
    this.speak("Bem-vindo ao Sentinela. Sistema online.");

    setTimeout(() => {
      this.startFadeOut = true; 
      setTimeout(() => { this.showIntro = false; }, 1000);
    }, 4500);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    clearInterval(this.logTimer);
    clearInterval(this.physicsTimer);
    clearInterval(this.titleTimer);
    clearInterval(this.hudTimer);
  }

  speak(text: string) {
    if (this.isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt'));
    if(ptVoice) utterance.voice = ptVoice;
    utterance.volume = 1; utterance.rate = 1.1; 
    window.speechSynthesis.speak(utterance);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) { window.speechSynthesis.cancel(); this.showToast('Voz Desativada', 'info'); } 
    else { this.speak("Voz ativada."); this.showToast('Voz Ativada', 'success'); }
  }

  updatePageTitle() {
    if (this.countAlerts() > 0) {
      this.titleSwitch = !this.titleSwitch;
      this.document.title = this.titleSwitch ? `(⚠️ ${this.countAlerts()}) ALERTAS` : 'SENTINELA | FROTAS';
    } else {
      this.document.title = 'SENTINELA | FROTAS';
    }
  }

  // --- CARREGAMENTO DE DADOS (AGORA COM DADOS FIXOS PARA O PORTFÓLIO) ---
  loadDrivers() {
    // Simulando um delay de rede para parecer real
    this.isLoading = true;
    setTimeout(() => {
        // DADOS BRASILEIROS FIXOS
        this.drivers = [
            { id: 1, name: "Carlos Mendes", vehicle: "Scania R500 - BRA-2024", status: "EM_ROTA", latitude: -23.5505, longitude: -46.6333 }, // São Paulo
            { id: 2, name: "Fernanda Lima", vehicle: "Volvo FH 540 - RJX-9090", status: "EM_ROTA", latitude: -22.9068, longitude: -43.1729 }, // Rio de Janeiro
            { id: 3, name: "Roberto Rocha", vehicle: "Mercedes Actros - MGZ-1010", status: "PARADO", latitude: -19.9167, longitude: -43.9345 }, // Belo Horizonte
            { id: 4, name: "Paulo Souza", vehicle: "DAF XF 105 - SUL-5050", status: "EM_ROTA", latitude: -25.4284, longitude: -49.2733 }, // Curitiba
            { id: 5, name: "Mariana Silva", vehicle: "Iveco Stralis - BAH-3030", status: "EM_ROTA", latitude: -12.9777, longitude: -38.5016 } // Salvador
        ];
        this.hydrateDrivers();
        this.isLoading = false;
    }, 1000);
  }

  hydrateDrivers() {
    this.drivers.forEach(driver => {
      driver.telemetry = {
        speed: driver.status === 'EM_ROTA' ? 80 : 0,
        rpm: driver.status === 'EM_ROTA' ? 1500 : 0,
        fuel: Math.floor(Math.random() * 40) + 50,
        temp: 90,
        safetyScore: Math.floor(Math.random() * (100 - 80 + 1) + 80),
        speedHistory: [70, 72, 71, 75, 74, 78, 80]
      };
    });
  }

  simulatePhysics() {
    if (!this.drivers) return;
    let totalSafety = 0;
    this.drivers.forEach(driver => {
      if (driver.status === 'EM_ROTA') {
        const variation = Math.floor(Math.random() * 5) - 2;
        let newSpeed = driver.telemetry.speed + variation;
        if (newSpeed > 90) newSpeed = 90;
        if (newSpeed < 60) newSpeed = 60;
        driver.telemetry.speed = newSpeed;
        driver.telemetry.rpm = 1000 + (newSpeed * 12) + (Math.random() * 100);
        driver.telemetry.fuel -= 0.02;
        if (driver.telemetry.fuel < 0) driver.telemetry.fuel = 100;
        driver.telemetry.temp = 90 + (Math.random() * 4 - 2);
        driver.telemetry.speedHistory.push(newSpeed);
        if (driver.telemetry.speedHistory.length > 15) driver.telemetry.speedHistory.shift();
      } else {
        driver.telemetry.speed = 0;
        driver.telemetry.rpm = 0;
      }
      totalSafety += driver.telemetry.safetyScore;
    });
    this.averageSafety = Math.floor(totalSafety / this.drivers.length);
    if (Math.random() < 0.05) { this.randomizeStatus(); }
  }

  randomizeStatus() {
    const randomIdx = Math.floor(Math.random() * this.drivers.length);
    const driver = this.drivers[randomIdx];
    if (driver.status === 'EM_ROTA') {
      driver.status = 'PARADO';
      this.addLog(`${driver.name} finalizou rota.`, 'info');
    } else {
      driver.status = 'EM_ROTA';
      driver.telemetry.speed = 40;
      this.addLog(`${driver.name} iniciou nova rota.`, 'info');
    }
  }

  getDriverChartPoints(driver: any) {
    if (!driver.telemetry || !driver.telemetry.speedHistory) return '';
    return driver.telemetry.speedHistory.map((speed: number, index: number) => {
      const x = index * (100 / 15); 
      const y = 40 - ((speed - 40) * 0.8);
      return `${x},${y}`;
    }).join(' ');
  }

  selectDriver(driver: any) {
    this.selectedDriver = driver;
    if (this.sidebarCollapsed) { this.sidebarCollapsed = false; }
    this.isFollowing = false;
    this.mapComponent.setFollowTarget(null);
    this.mapComponent.flyToDriver(driver.latitude, driver.longitude);
  }

  closePanel() {
    this.selectedDriver = null;
    this.isFollowing = false;
    this.mapComponent.setFollowTarget(null);
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 300);
  }

  toggleFollow() {
    if (this.isFollowing && this.selectedDriver) {
      this.mapComponent.setFollowTarget(this.selectedDriver.id);
      this.showToast('Câmera Travada', 'info');
    } else {
      this.mapComponent.setFollowTarget(null);
    }
  }

  toggleFullscreen() {
    if (!this.document.fullscreenElement) {
      this.document.documentElement.requestFullscreen();
    } else {
      if (this.document.exitFullscreen) { this.document.exitFullscreen(); }
    }
  }

  downloadReport() {
    const headers = ['ID,Nome,Status,Velocidade,Combustivel'];
    const rows = this.drivers.map(d => `${d.id},"${d.name}",${d.status},${d.telemetry.speed},${d.telemetry.fuel.toFixed(1)}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Relatorio_Frota_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    this.showToast('Relatório baixado!', 'success');
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    const id = Date.now();
    this.toasts.push({ id, message, type });
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 3000);
  }

  countActive() { return this.drivers ? this.drivers.filter(d => d.status === 'EM_ROTA').length : 0; }
  countAlerts() { return this.logs.filter(l => l.type === 'alert').length; }
  setFilter(status: any) { this.filterStatus = status; }

  filteredDrivers() {
    if (!this.drivers) return [];
    return this.drivers.filter(d => {
      const matchesSearch = !this.searchTerm || d.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || d.vehicle.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.filterStatus === 'ALL' || d.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  triggerAction(action: string) {
    const driverName = this.selectedDriver?.name || 'Motorista';
    this.addLog(`Ação: ${action} > ${driverName}`, 'info');
    if (action === 'Bloquear') { this.showToast(`BLOQUEIO ENVIADO: ${driverName}`, 'error'); } 
    else { this.showToast(`${action}: Comando recebido`, 'success'); }
  }

  startLogSimulation() {
    this.addLog('Sentinela OS v7.0 Iniciado.', 'info');
    this.logTimer = setInterval(() => {
      const events = [
        { msg: 'Sincronizando satélites...', type: 'info' },
        { msg: 'ALERTA: Pressão Pneus (V03)', type: 'alert' },
        { msg: 'Backup na Nuvem: OK.', type: 'info' }
      ];
      const ev = events[Math.floor(Math.random() * events.length)];
      this.addLog(ev.msg, ev.type);
    }, 4500);
  }

  addLog(message: string, type: string) {
    const time = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    this.logs.unshift({ time, message, type });
    if (this.logs.length > 50) this.logs.pop();
    if (type === 'alert') { this.speak("Alerta: " + message.replace('ALERTA:', '')); }
  }
}