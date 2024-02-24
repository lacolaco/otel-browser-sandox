import { APP_INITIALIZER, ApplicationConfig } from "@angular/core";
import { Router, provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { TraceService } from "@sentry/angular-ivy";

function provideSentryTraceService() {
  return [
    {
      provide: TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [TraceService],
      multi: true,
    },
  ];
}

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideSentryTraceService()],
};
