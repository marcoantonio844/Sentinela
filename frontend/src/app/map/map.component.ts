import { Component, AfterViewInit, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  // ESTA LINHA ABAIXO É A MÁGICA QUE FALTAVA. ELA DESLIGA O BLOQUEIO DE CSS DO ANGULAR.
  encapsulation: ViewEncapsulation.None,
  template: `<div id="map" style="height: 100%; width: 100%;"></div>`,
  styles: [`
    html, body { margin: 0; padding: 0; height: 100%; }
    :host { display: block; height: 100%; width: 100%; }
    
    /* Força o ícone a ter tamanho, caso o Leaflet falhe */
    .leaflet-div-icon {
      background: transparent;
      border: none;
    }
  `]
})
export class MapComponent implements AfterViewInit, OnChanges {
  private map!: L.Map;
  private markers: Map<number, L.Marker> = new Map();
  private followInterval: any;

  // IMAGENS DIRETAS DO GITHUB (Garantia de funcionamento 100%)
  private iconGreen = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private iconRed = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private iconOrange = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

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
    // Garante que o container do mapa está limpo antes de criar
    if (this.map) { this.map.remove(); }

    this.map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([-23.5505, -46.6333], 10);

    // Mapa Padrão (OpenStreetMap) - É o mais compatível que existe
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    
    // Força o mapa a recalcular o tamanho (corrige telas cinzas)
    setTimeout(() => { this.map.invalidateSize(); }, 500);
  }

  private updateMarkers(): void {
    if (!this.map) return;

    this.drivers.forEach(driver => {
      const lat = driver.latitude;
      const lng = driver.longitude;

      // Escolhe o pino baseado na cor
      let selectedIcon = this.iconOrange;
      if (driver.status === 'EM_ROTA') selectedIcon = this.iconGreen;
      if (driver.status === 'PARADO') selectedIcon = this.iconRed;

      if (this.markers.has(driver.id)) {
        const marker = this.markers.get(driver.id)!;
        marker.setLatLng([lat, lng]);
        marker.setIcon(selectedIcon);
      } else {
        const marker = L.marker([lat, lng], { icon: selectedIcon }).addTo(this.map);
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

  public flyToDriver(lat: number, lng: number) {
    this.map.flyTo([lat, lng], 14, { duration: 1.5 });
  }

  public setFollowTarget(id: number | null) {
    this.followTargetId = id;
    this.handleFollowMode();
  }
}