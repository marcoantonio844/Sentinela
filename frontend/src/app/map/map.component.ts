import { Component, AfterViewInit, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None, 
  template: `<div id="map" style="height: 100%; width: 100%;"></div>`,
  styles: [`
    html, body { margin: 0; padding: 0; height: 100%; }
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class MapComponent implements AfterViewInit, OnChanges {
  private map!: L.Map;
  private markers: Map<number, L.CircleMarker> = new Map(); // Mudamos para CircleMarker
  private followInterval: any;

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
    if (this.map) { this.map.remove(); }

    this.map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([-23.5505, -46.6333], 10);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    setTimeout(() => { this.map.invalidateSize(); }, 500);
  }

  private updateMarkers(): void {
    if (!this.map) return;

    this.drivers.forEach(driver => {
      const lat = driver.latitude;
      const lng = driver.longitude;
      
      // Cores Neon bem visíveis
      const color = driver.status === 'EM_ROTA' ? '#00ff00' : '#ff0000'; 

      if (this.markers.has(driver.id)) {
        const marker = this.markers.get(driver.id)!;
        marker.setLatLng([lat, lng]);
        // Atualiza a cor se mudou o status
        marker.setStyle({ fillColor: color, color: '#fff' });
      } else {
        // AQUI É A MUDANÇA: USAMOS CIRCLEMARKER. 
        // ISSO NÃO É IMAGEM, É CÓDIGO. TEM QUE APARECER.
        const marker = L.circleMarker([lat, lng], {
          radius: 10,       // Tamanho da bolinha
          fillColor: color, // Cor interna (Verde/Vermelho)
          color: '#ffffff', // Cor da borda (Branco)
          weight: 2,        // Grossura da borda
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(this.map);

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