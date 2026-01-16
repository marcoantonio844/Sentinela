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
    .custom-div-icon { background: transparent; border: none; }
    .marker-pin {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 15px rgba(0,0,0,0.3); transition: all 0.5s;
    }
    .marker-pin img { width: 24px; height: 24px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5)); }
  `]
})
export class MapComponent implements AfterViewInit, OnChanges {
  private map!: L.Map;
  private markers: Map<number, L.Marker> = new Map();
  private followInterval: any;

  // Ícone de Caminhão Online (Nunca quebra)
  private truckIconUrl = 'https://cdn-icons-png.flaticon.com/512/741/741407.png';

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

    // Mapa Estilo CartoDB Dark (Visual Cyberpunk Limpo)
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

      // Cria o ícone personalizado usando HTML e a imagem online
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="marker-pin" style="background-color: ${color}cc; border: 2px solid ${color}">
            <img src="${this.truckIconUrl}" alt="Truck">
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      if (this.markers.has(driver.id)) {
        const marker = this.markers.get(driver.id)!;
        marker.setLatLng([lat, lng]);
        marker.setIcon(customIcon);
      } else {
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
        marker.bindPopup(`<b>${driver.vehicle}</b><br>${driver.name}`);
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

  // Métodos públicos para serem chamados pelo Pai
  public flyToDriver(lat: number, lng: number) {
    this.map.flyTo([lat, lng], 14, { duration: 1.5 });
  }

  public setFollowTarget(id: number | null) {
    this.followTargetId = id;
    this.handleFollowMode();
  }
}