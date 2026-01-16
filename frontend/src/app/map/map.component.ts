import { Component, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div id="map" style="height: 100%; width: 100%;"></div>`,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
    
    /* Estilo do Marcador */
    ::ng-deep .custom-div-icon {
      background: transparent;
      border: none;
    }
    
    ::ng-deep .marker-pin {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      border: 3px solid white;
      transition: all 0.5s ease;
      position: relative;
    }

    /* Efeito de Pulso (Onda) */
    ::ng-deep .marker-pin::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid white;
      opacity: 0;
      animation: pulse 2s infinite;
    }

    /* Imagem do Caminhão */
    ::ng-deep .truck-icon {
      width: 26px;
      height: 26px;
      object-fit: contain;
      filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(1.6); opacity: 0; }
    }
  `]
})
export class MapComponent implements AfterViewInit, OnChanges {
  private map!: L.Map;
  private markers: Map<number, L.Marker> = new Map();
  private followInterval: any;

  // ÍCONE BLINDADO (Base64) - O navegador lê isso como uma imagem nativa.
  private truckBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0yMCA4aC0zVjRIM2MtMS4xIDAtMiAuOS0yIDJ2MTFoMmMwIDEuNjYgMS4zNCAzIDMgM3MzLTEuMzQgMy0zaDZjMCAxLjY2IDEuMzQgMyAzIDNzMy0xLjM0IDMtM2gydi01bC0zLTR6TTYgMTguNWMtLjgzIDAtMS41LS42Ny0xLjUtMS41cy42Ny0xLjUgMS41LTEuNSAxLjUuNjcgMS41IDEuNS0uNjcgMS41LTEuNSAxLjV6bTEzLjUtOWwxLjk2IDIuNUgxN1Y5LjVoMi41em0tMS41IDljLS44MyAwLTEuNS0uNjctMS41LTEuNXMuNjctMS41IDEuNS0xLjUgMS41LjY3IDEuNSAxLjUtLjY3IDEuNS0xLjUgMS41eiIvPjwvc3ZnPg==";

  @Input() drivers: any[] = [];
  @Input() followTargetId: number | null = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['drivers'] && this.drivers) {
      this.updateMarkers();
    }
    if (changes['followTargetId']) {
      this.handleFollowMode();
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([-23.5505, -46.6333], 10);

    // Mapa Estilo Dark (Cyberpunk)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
  }

  private updateMarkers(): void {
    if (!this.map) return;

    this.drivers.forEach(driver => {
      const lat = driver.latitude;
      const lng = driver.longitude;
      const color = driver.status === 'EM_ROTA' ? '#10b981' : (driver.status === 'PARADO' ? '#ef4444' : '#f59e0b');

      // Cria o ícone usando Classes CSS (Melhor performance)
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="marker-pin" style="background-color: ${color}">
            <img src="${this.truckBase64}" class="truck-icon" alt="Truck" />
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -25]
      });

      if (this.markers.has(driver.id)) {
        const marker = this.markers.get(driver.id)!;
        marker.setLatLng([lat, lng]);
        marker.setIcon(customIcon);
      } else {
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
        marker.bindPopup(`
          <div style="text-align:center; font-family: 'Segoe UI', sans-serif;">
            <strong style="color: #1e293b; font-size: 14px;">${driver.vehicle}</strong><br>
            <span style="color: #64748b; font-size: 12px;">${driver.name}</span>
          </div>
        `);
        this.markers.set(driver.id, marker);
      }
    });
  }

  private handleFollowMode() {
    if (this.followInterval) clearInterval(this.followInterval);

    if (this.followTargetId) {
      this.followInterval = setInterval(() => {
        const driver = this.drivers.find(d => d.id === this.followTargetId);
        if (driver && this.map) {
          this.map.flyTo([driver.latitude, driver.longitude], 15, { animate: true, duration: 1 });
        }
      }, 1000);
    }
  }

  public flyToDriver(lat: number, lng: number) {
    this.map.flyTo([lat, lng], 14, { duration: 1.5 });
  }

  public setFollowTarget(id: number | null) {
    this.followTargetId = id;
    this.handleFollowMode();
  }
}