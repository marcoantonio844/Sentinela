import 'zone.js';  // <--- ESSA É A LINHA QUE FALTAVA! (Adicione ela)
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));