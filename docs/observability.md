# Observability Specification

Telemetry tracker for model metrics.

## Metrics Saved

* `provider`: LLM transport class name.
* `model`: Model version key.
* `promptTokens` & `completionTokens`: Cost markers.
* `latencyMs`: Duration tracker.
* `estimatedCost`: Standardized token pricing formula.
