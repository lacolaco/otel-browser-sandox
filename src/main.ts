import { bootstrapApplication } from "@angular/platform-browser";
import * as Sentry from "@sentry/angular-ivy";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

Sentry.init({
  dsn: "https://a9da6c07af5a10b86a16b55f08c99339@o4505734726549504.ingest.sentry.io/4506800643440640",
  integrations: [
    Sentry.browserTracingIntegration({
      traceFetch: false,
      traceXHR: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  // tracePropagationTargets: ["localhost"],
});

// register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/serviceWorker.js");
  });
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
