# Tracequest

Find out exactly what your backend is doing.

```typescript
import tracequest from "tracequest";

const app = express();
app.use(tracequest);

...

app.get("/", async (req, res) => {
  // Ah, I wish all these external
  // calls would always be just as easy to find...
  await Promise.all([
    queryDb(),
    enrichWithCRMData(),
    sendTelemetryToAThirdParty(),
    maybeGetFromCache(),
    setAnUnexpectedDeadlock(),
    overfetchFromARateLimitedAPI(),
    maybeFailBecauseOfDownstreamError(),
    queryDataWhichIsAlreadyAvailable(),
    doSomethingUseful(),
  ]);

  res.send({ ok: true });
});
```
