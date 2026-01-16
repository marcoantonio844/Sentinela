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
    /* Remove borda padrão do leaflet para ícones div */
    .custom-div-icon { background: transparent; border: none; }
    
    /* Círculo do marcador */
    .marker-pin {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 15px rgba(0,0,0,0.3);
      transition: all 0.5s ease;
    }
    
    /* O ícone do caminhão (SVG) */
    .marker-pin svg {
      width: 24px; height: 24px;
      fill: white; /* Cor do ícone */
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
    }
  `]
})
export class MapComponent implements AfterViewInit, OnChanges {
  private map!: L.Map;
  private markers: Map<number, L.Marker> = new Map();
  private followInterval: any;

  // Ícone de Caminhão em Código (SVG) - Não quebra nunca!
  private truckSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  `;

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

    // Mapa Estilo CartoDB (Visual Limpo)
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
      // Define a cor baseada no status
      const color = driver.status === 'EM_ROTA' ? '#10b981' : (driver.status === 'PARADO' ? '#ef4444' : '#f59e0b');

      // Monta o ícone com o SVG dentro
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="marker-pin" style="background-color: ${color}; border: 3px solid white;">
            ${this.truckSvg}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });

      if (this.markers.has(driver.id)) {
        const marker = this.markers.get(driver.id)!;
        marker.setLatLng([lat, lng]);
        marker.setIcon(customIcon);
      } else {
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
        marker.bindPopup(`
          <div style="text-align:center;">
            <strong style="font-size:14px; color:#333;">${driver.vehicle}</strong><br>
            <span style="font-size:12px; color:#666;">${driver.name}</span>
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