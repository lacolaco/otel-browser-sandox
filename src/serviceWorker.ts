/// <reference lib="WebWorker" />
import {
  TextMapGetter,
  TextMapSetter,
  context,
  propagation,
  trace,
} from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { BasicTracerProvider } from "@opentelemetry/sdk-trace-base";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
import * as Sentry from "@sentry/browser";
import {
  SentrySampler,
  SentrySpanProcessor,
  setupEventContextTrace,
} from "@sentry/opentelemetry";

declare const self: ServiceWorkerGlobalScope;

function setupFetchTracer() {
  console.log("setupFetchTracer");

  // https://github.com/getsentry/sentry-javascript/tree/develop/packages/opentelemetry
  Sentry.init({
    dsn: "https://a9da6c07af5a10b86a16b55f08c99339@o4505734726549504.ingest.sentry.io/4506800643440640",
    tracesSampleRate: 1.0, //  Capture 100% of the transactions,
  });
  const client = Sentry.getClient()!;
  setupEventContextTrace(client);

  const provider = new BasicTracerProvider({
    sampler: new SentrySampler(client), // respect sentry's sampling decision
  });
  provider.addSpanProcessor(new SentrySpanProcessor()); // export spans to Sentry
  provider.register({
    propagator: new W3CTraceContextPropagator(), // extract|inject w3c trace context
  });

  self.addEventListener("fetch", (event) => {
    // extract context from main thread
    const ctxExtracted = propagation.extract(
      context.active(),
      event.request.headers,
      swHeadersTextGetterSetter
    );

    // start fetch span
    const span = trace.getTracer("fetch-tracer").startSpan(
      "fetch",
      {
        attributes: {
          [SemanticAttributes.HTTP_URL]: event.request.url,
          [SemanticAttributes.HTTP_METHOD]: event.request.method.toUpperCase(),
        },
      },
      ctxExtracted
    );
    const ctxWithFetchSpan = trace.setSpan(ctxExtracted, span);

    // propagate trace context to the server
    const headersWithTraceContext = new Headers(event.request.headers);
    propagation.inject(
      ctxWithFetchSpan,
      headersWithTraceContext,
      swHeadersTextGetterSetter
    );
    const request = new Request(event.request, {
      headers: headersWithTraceContext,
    });

    const response = fetch(request).finally(() => {
      span.end();
    });
    event.respondWith(response);
  });
}

setupFetchTracer();

const swHeadersTextGetterSetter: TextMapGetter<Headers> &
  TextMapSetter<Headers> = {
  keys: (carrier: Headers): string[] => Object.keys(carrier),
  get: (carrier: Headers, key) => carrier.get(key) ?? undefined,
  set: (carrier: Headers, key, value) => carrier.set(key, value),
};
