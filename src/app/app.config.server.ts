import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideTranslateLoader } from '@ngx-translate/core';
import { TranslateServerLoader } from './translate-server.loader';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideTranslateLoader(TranslateServerLoader),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
