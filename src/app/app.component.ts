import { Component } from "@angular/core";
import * as Sentry from "@sentry/browser";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [],
  template: `
    <h1>Welcome to {{ title }}!</h1>

    <div>
      <button (click)="sendRequest()">Send a request</button>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = "otel-browser-sandbox";

  sendRequest() {
    Sentry.startSpan({ name: "sendRequest" }, async () => {
      await fetch("https://randomuser.me/api/")
        .then((response) => response.json())
        .then((data) => {
          console.log(data.results[0]);
        });
    });
  }
}
