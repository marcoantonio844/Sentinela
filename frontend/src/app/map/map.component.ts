import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  template: `<div id="map" style="height: 100%; width: 100%; background-color: #1a1a1a;"></div>`,
  encapsulation: ViewEncapsulation.None, 
  styles: [`
    :host { display: block; height: 100%; }
    
    /* POPUPS ESTILIZADOS */
    .leaflet-popup-content-wrapper {
      background: rgba(15, 23, 42, 0.95);
      color: white; border-radius: 8px; border: 1px solid #3b82f6;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .leaflet-popup-tip { background: rgba(15, 23, 42, 0.95); border: 1px solid #3b82f6; border-top: none; border-left: none; }
    .leaflet-container a.leaflet-popup-close-button { color: #fff; }
  `]
})
export class MapComponent implements AfterViewInit {
  private map!: L.Map;
  
  private markers: { [id: number]: L.Marker } = {};
  private routeLines: { [id: number]: L.Polyline } = {};
  private routeCoords: { [id: number]: [number, number][] } = {};

  // NOVIDADE: ID do motorista que a câmera está seguindo
  private followTargetId: number | null = null; 

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      this.drawZones();
      this.loadDrivers();
      this.startMultiSimulation();
    }, 100);
  }

  private initMap(): void {
    if (this.map) { this.map.remove(); }
    
    const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' });
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' });

    this.map = L.map('map', {
      center: [-23.55052, -46.633309],
      zoom: 12,
      layers: [streetLayer],
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(this.map);

    const baseMaps = { "🗺️ Mapa": streetLayer, "🛰️ Satélite": satelliteLayer };
    L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(this.map);
  }

  private drawZones() {
    L.circle([-23.55052, -46.633309], { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, radius: 2000 }).addTo(this.map);
    L.circle([-23.6000, -46.6900], { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15, radius: 1500 }).addTo(this.map);
    L.circle([-23.5200, -46.5500], { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.15, radius: 1000 }).addTo(this.map);
  }

  private loadDrivers() {
    this.http.get<any[]>('http://localhost:3000/drivers')
      .subscribe({
        next: (drivers) => drivers.forEach(driver => this.addMarker(driver)),
        error: (err) => console.error(err)
      });
  }

  private addMarker(driver: any) {
    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });

    const marker = L.marker([driver.latitude, driver.longitude], { icon }).addTo(this.map);

    marker.bindPopup(`
      <div style="font-family: 'Segoe UI', sans-serif; min-width: 150px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <div style="font-size: 20px;">🚛</div>
          <div>
            <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #fff;">${driver.name}</h3>
            <div style="font-size: 11px; color: #94a3b8;">${driver.vehicle}</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 5px; border-radius: 4px; font-size: 11px; display: flex; justify-content: space-between;">
          <span>Status:</span>
          <span style="font-weight: bold; color: ${driver.status === 'EM_ROTA' ? '#4caf50' : '#f44336'}">
            ${driver.status === 'EM_ROTA' ? 'EM MOVIMENTO' : 'PARADO'}
          </span>
        </div>
      </div>
    `);
      
    this.markers[driver.id] = marker;

    if (driver.status === 'EM_ROTA') {
      this.routeCoords[driver.id] = [[driver.latitude, driver.longitude]];
      this.routeLines[driver.id] = L.polyline(this.routeCoords[driver.id], { 
        color: this.getRandomColor(driver.id), weight: 4, opacity: 0.8
      }).addTo(this.map);
    }
  }

  private startMultiSimulation() {
    setInterval(() => {
      Object.keys(this.markers).forEach(key => {
        const id = Number(key);
        const marker = this.markers[id];
        
        if (this.routeLines[id]) {
          const currentLatLng = marker.getLatLng();
          const latMove = id % 2 === 0 ? 0.0003 : -0.0002;
          const lngMove = id % 3 === 0 ? 0.0003 : -0.0003;
          
          const newLat = currentLatLng.lat + latMove + (Math.random() * 0.0001);
          const newLng = currentLatLng.lng + lngMove + (Math.random() * 0.0001);

          marker.setLatLng([newLat, newLng]);

          // Lógica da Câmera Espiã: Se estiver seguindo este ID, centraliza o mapa nele
          if (this.followTargetId === id) {
            this.map.panTo([newLat, newLng]);
          }

          const coords = this.routeCoords[id];
          coords.push([newLat, newLng]);
          this.routeLines[id].setLatLngs(coords);
          if (coords.length > 500) coords.shift(); 
        }
      });
    }, 2000); 
  }

  private getRandomColor(id: number): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[id % colors.length];
  }

  public flyToDriver(lat: number, lng: number) {
    this.map.flyTo([lat, lng], 16, { duration: 1.5 });
    Object.values(this.markers).forEach(marker => {
      const mLat = marker.getLatLng().lat;
      if (Math.abs(mLat - lat) < 0.0001) { marker.openPopup(); }
    });
  }

  // NOVIDADE: Função pública para ativar/desativar o modo seguir
  public setFollowTarget(id: number | null) {
    this.followTargetId = id;
  }
}