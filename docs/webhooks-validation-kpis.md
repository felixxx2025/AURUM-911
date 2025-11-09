# Webhook Validation and KPIs - Implementation Guide

## Overview

This document describes the implementation of enhanced webhook validation and comprehensive KPIs (Key Performance Indicators) for the AURUM-911 webhook system.

## Features Implemented

### 1. Enhanced Webhook Validation

#### Detailed Error Responses
When a webhook payload fails validation, the API now returns detailed error information:

```json
{
  "error": "invalid_payload",
  "details": [
    "documentId: Required",
    "amount: Expected number, received undefined"
  ]
}
```

#### Validation Metrics
New Prometheus metrics track validation failures:

- `integrations_inbound_webhooks_validation_errors_total{provider, event_type, error_type}` - Counter of validation errors by provider, event type, and error type

### 2. Comprehensive KPIs

#### New Metrics

1. **Validation Errors Counter**
   - Metric: `integrations_inbound_webhooks_validation_errors_total`
   - Labels: `provider`, `event_type`, `error_type`
   - Tracks validation failures with detailed categorization

2. **Success Rate Gauge**
   - Metric: `integrations_inbound_webhooks_success_rate`
   - Labels: `provider`
   - Tracks the success/verification rate per provider

3. **Verification Failures Counter**
   - Metric: `integrations_inbound_webhooks_verification_failures_total`
   - Labels: `provider`
   - Tracks HMAC signature verification failures

#### Enhanced Stats Endpoint

**Endpoint:** `GET /integrations/webhooks/stats`

**Query Parameters:**
- `provider` (optional): Filter by specific provider
- `window` (optional): Time window - `5m`, `1h`, `24h`, or `all` (default)

**Response Example:**
```json
{
  "window": "1h",
  "provider": "all",
  "overall": {
    "total": 150,
    "verified": 145,
    "unverified": 5,
    "verificationRate": 0.9667,
    "successRate": 0.9667
  },
  "providers": {
    "clicksign": {
      "total": 50,
      "verified": 48,
      "unverified": 2,
      "successRate": 0.96,
      "verificationRate": 0.96,
      "latestReceived": "2025-11-05T03:24:00.000Z",
      "oldestReceived": "2025-11-05T02:24:00.000Z"
    },
    "stripe": {
      "total": 100,
      "verified": 97,
      "unverified": 3,
      "successRate": 0.97,
      "verificationRate": 0.97,
      "latestReceived": "2025-11-05T03:24:00.000Z",
      "oldestReceived": "2025-11-05T02:24:00.000Z"
    }
  }
}
```

#### New Detailed KPIs Endpoint

**Endpoint:** `GET /integrations/webhooks/kpis`

**Query Parameters:**
- `provider` (optional): Filter by specific provider

**Response Example:**
```json
{
  "provider": "all",
  "timestamp": "2025-11-05T03:24:00.000Z",
  "kpis": {
    "last5m": {
      "totalRequests": 25,
      "verifiedRequests": 24,
      "unverifiedRequests": 1,
      "verificationRate": 0.96,
      "requestsPerMinute": 5.0
    },
    "last1h": {
      "totalRequests": 150,
      "verifiedRequests": 145,
      "unverifiedRequests": 5,
      "verificationRate": 0.9667,
      "requestsPerMinute": 2.5
    },
    "last24h": {
      "totalRequests": 3600,
      "verifiedRequests": 3480,
      "unverifiedRequests": 120,
      "verificationRate": 0.9667,
      "requestsPerMinute": 2.5
    }
  },
  "providers": {
    "clicksign": {
      "total": 1200,
      "verified": 1152,
      "verificationRate": 0.96,
      "last5mCount": 8
    },
    "stripe": {
      "total": 2400,
      "verified": 2328,
      "verificationRate": 0.97,
      "last5mCount": 17
    }
  },
  "summary": {
    "totalProviders": 2,
    "totalWebhooks": 3600,
    "totalVerified": 3480
  }
}
```

## API Endpoints

### POST /integrations/webhooks/:provider

Receives webhooks from external providers.

**Enhanced Response Codes:**
- `202 Accepted` - Webhook received and validated successfully
- `400 Bad Request` - Validation failed (now includes detailed error information)

### GET /integrations/webhooks/stats

Retrieves webhook statistics with time-based filtering.

**Use Cases:**
- Monitor webhook traffic over different time periods
- Track verification rates by provider
- Identify problematic providers or time periods

### GET /integrations/webhooks/kpis

Retrieves detailed KPI metrics for dashboards and monitoring.

**Use Cases:**
- Real-time dashboard displays
- Rate-based alerting (requests per minute)
- Trend analysis across multiple time windows
- Provider performance comparison

## Monitoring and Alerting

### Recommended Prometheus Queries

**Validation Error Rate:**
```promql
rate(integrations_inbound_webhooks_validation_errors_total[5m])
```

**Verification Failure Rate by Provider:**
```promql
rate(integrations_inbound_webhooks_verification_failures_total[5m])
```

**Success Rate (requires recording rule):**
```promql
integrations_inbound_webhooks_success_rate
```

**Request Rate:**
```promql
rate(integrations_inbound_webhooks_total[5m])
```

**Latency Percentiles:**
```promql
histogram_quantile(0.95, rate(integrations_inbound_webhook_duration_seconds_bucket[5m]))
```

### Recommended Alerts

1. **High Validation Error Rate**
   - Alert when validation errors exceed 5% of total requests
   - `rate(integrations_inbound_webhooks_validation_errors_total[5m]) / rate(integrations_inbound_webhooks_total[5m]) > 0.05`

2. **Low Verification Rate**
   - Alert when verification rate drops below 90%
   - `integrations_inbound_webhooks_success_rate < 0.9`

3. **High Request Rate**
   - Alert when request rate exceeds expected thresholds
   - `rate(integrations_inbound_webhooks_total[5m]) > 100`

## Testing

Comprehensive test suite added in `src/__tests__/webhooks-validation-kpis.test.ts`:

- ✅ Validation error details
- ✅ Valid payload acceptance
- ✅ Stats endpoint with time windows
- ✅ KPI calculation accuracy
- ✅ Provider filtering
- ✅ Metrics exposure via Prometheus

Run tests:
```bash
npm test -- webhooks-validation-kpis.test.ts
```

## Best Practices

1. **Time Windows**: Use appropriate time windows for your use case:
   - `5m` for real-time monitoring
   - `1h` for operational dashboards
   - `24h` for daily reports
   - `all` for historical analysis

2. **Alerting**: Set up alerts based on your SLA requirements
   - Verification rate should typically be > 95%
   - Validation errors should be investigated immediately
   - Latency should be monitored for performance issues

3. **Dashboard Design**: 
   - Display KPIs for multiple time windows side-by-side
   - Show provider-specific metrics for troubleshooting
   - Include request rate graphs for capacity planning

## Performance Considerations

- Stats are calculated from in-memory logs (limited to 2000 entries)
- For long-term historical analysis, query the database directly
- KPI endpoint updates success rate gauges on each call
- Time-window filtering is efficient for typical workloads

## Future Enhancements

Potential improvements for future iterations:

1. Database-backed historical statistics
2. Latency percentile calculations (p50, p95, p99)
3. Retry metrics for failed deliveries
4. Custom time range support (beyond predefined windows)
5. Webhook delivery success tracking (not just verification)
6. Rate limiting metrics per provider
7. Payload size distribution metrics

## Related Documentation

- [Webhooks Documentation](webhooks.md) - Core webhook concepts and security
- [Integrations Schemas](../services/hrplus-api/src/contracts/integrations-schemas.ts) - Validation schemas for each connector
- [Metrics Documentation](../services/hrplus-api/src/metrics.ts) - Overall metrics infrastructure
