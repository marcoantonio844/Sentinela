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
  `]
})
export class MapComponent implements AfterViewInit, OnChanges {
  private map!: L.Map;
  private markers: Map<number, L.Marker> = new Map();
  private followInterval: any;

  // SVG DO CAMINHÃO (DEFINIDO COMO STRING PARA NÃO QUEBRAR)
  private truckSvg = `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: white; filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.5));">
      <path d="M20,8H17V4H3C1.9,4 1,4.9 1,6V17H3C3,18.66 4.34,20 6,20C7.66,20 9,18.66 9,17H15C15,18.66 16.34,20 18,20C19.66,20 21,18.66 21,17H23V12L20,8M6,18.5C5.17,18.5 4.5,17.83 4.5,17C4.5,16.17 5.17,15.5 6,15.5C6.83,15.5 7.5,16.17 7.5,17C7.5,17.83 6.83,18.5 6,18.5M18,18.5C17.17,18.5 16.5,17.83 16.5,17C16.5,16.17 17.17,15.5 18,15.5C18.83,15.5 19.5,16.17 19.5,17C19.5,17.83 18.83,18.5 18,18.5M17,12V9.5H19.5L21.46,12H17Z" />
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

      // AQUI ESTÁ A MÁGICA: CSS INLINE (DENTRO DO HTML) PARA O ANGULAR NÃO BLOQUEAR
      const customIcon = L.divIcon({
        className: 'custom-div-icon', // Classe vazia para tirar borda padrão
        html: `
          <div style="
            background-color: ${color};
            width: 40px; 
            height: 40px; 
            border-radius: 50%;
            display: flex; 
            align-items: center; 
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
          ">
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
          <div style="text-align:center; font-family: sans-serif;">
            <strong style="color: #333; font-size: 14px;">${driver.vehicle}</strong><br>
            <span style="color: #666; font-size: 12px;">${driver.name}</span>
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