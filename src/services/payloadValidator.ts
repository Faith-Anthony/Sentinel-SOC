/**
 * Payload validation service for incoming real-time data
 * Ensures data integrity and prevents UI crashes from malformed data
 * Phase 4: Production-grade validation and error handling
 */

import type {
  ThreatEvent,
  ActivityFeedItem,
  MetricCard,
  TimeSeriesPoint,
  ValidationResult,
  ValidationSchema,
} from '@/types/dashboard'

/**
 * Default validation schema for all incoming data types
 */
const defaultSchema: ValidationSchema = {
  threatEvent: {
    requiredFields: ['id', 'timestamp', 'severity', 'type', 'source', 'description', 'status'],
    severityValues: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    statusValues: ['ACTIVE', 'MITIGATED', 'RESOLVED'],
  },
  activityFeedItem: {
    requiredFields: ['id', 'timestamp', 'type', 'title', 'description'],
    typeValues: ['alert', 'event', 'metric', 'system'],
  },
  metricCard: {
    requiredFields: ['id', 'title', 'value'],
    valueRange: { min: 0, max: Infinity },
  },
}

/**
 * Validates a threat event payload
 */
export function validateThreatEvent(data: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Threat event must be an object'] }
  }

  const event = data as Record<string, unknown>
  const schema = defaultSchema.threatEvent!

  // Check required fields
  for (const field of schema.requiredFields) {
    if (!(field in event)) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Validate types
  if (typeof event.id !== 'string') errors.push('id must be a string')
  if (typeof event.timestamp !== 'number' || event.timestamp <= 0) {
    errors.push('timestamp must be a positive number')
  }
  if (typeof event.severity !== 'string' || !schema.severityValues.includes(event.severity as string)) {
    errors.push(`severity must be one of: ${schema.severityValues.join(', ')}`)
  }
  if (typeof event.type !== 'string' || event.type.length === 0) {
    errors.push('type must be a non-empty string')
  }
  if (typeof event.source !== 'string' || event.source.length === 0) {
    errors.push('source must be a non-empty string')
  }
  if (typeof event.description !== 'string') {
    errors.push('description must be a string')
  }
  if (typeof event.status !== 'string' || !schema.statusValues.includes(event.status as string)) {
    errors.push(`status must be one of: ${schema.statusValues.join(', ')}`)
  }

  // Optional fields validation
  if (event.affectedSystems && !Array.isArray(event.affectedSystems)) {
    warnings.push('affectedSystems should be an array')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Validates an activity feed item payload
 */
export function validateActivityFeedItem(data: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Activity feed item must be an object'] }
  }

  const item = data as Record<string, unknown>
  const schema = defaultSchema.activityFeedItem!

  // Check required fields
  for (const field of schema.requiredFields) {
    if (!(field in item)) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Validate types
  if (typeof item.id !== 'string') errors.push('id must be a string')
  if (typeof item.timestamp !== 'number' || item.timestamp <= 0) {
    errors.push('timestamp must be a positive number')
  }
  if (typeof item.type !== 'string' || !schema.typeValues.includes(item.type as string)) {
    errors.push(`type must be one of: ${schema.typeValues.join(', ')}`)
  }
  if (typeof item.title !== 'string' || item.title.length === 0) {
    errors.push('title must be a non-empty string')
  }
  if (typeof item.description !== 'string') {
    errors.push('description must be a string')
  }

  // Ensure read is boolean
  if ('read' in item && typeof item.read !== 'boolean') {
    warnings.push('read should be a boolean')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Validates a metric card payload
 */
export function validateMetricCard(data: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Metric card must be an object'] }
  }

  const metric = data as Record<string, unknown>
  const schema = defaultSchema.metricCard!

  // Check required fields
  for (const field of schema.requiredFields) {
    if (!(field in metric)) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Validate types
  if (typeof metric.id !== 'string') errors.push('id must be a string')
  if (typeof metric.title !== 'string' || metric.title.length === 0) {
    errors.push('title must be a non-empty string')
  }
  if (typeof metric.value !== 'number' && typeof metric.value !== 'string') {
    errors.push('value must be a number or string')
  }

  // Optional fields validation
  if ('unit' in metric && typeof metric.unit !== 'string') {
    warnings.push('unit should be a string')
  }
  if ('trend' in metric && !['up', 'down', 'stable'].includes(metric.trend as string)) {
    warnings.push('trend should be up, down, or stable')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Validates a time-series data point
 */
export function validateTimeSeriesPoint(data: unknown): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Time series point must be an object'] }
  }

  const point = data as Record<string, unknown>

  if (typeof point.timestamp !== 'number' || point.timestamp <= 0) {
    errors.push('timestamp must be a positive number')
  }
  if (typeof point.value !== 'number') {
    errors.push('value must be a number')
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Safely parses and validates incoming JSON payload
 */
export function validateAndParsePayload(
  payload: string,
  type: 'threatEvent' | 'activityFeedItem' | 'metricCard'
): { data: unknown; result: ValidationResult } | null {
  try {
    const data = JSON.parse(payload)

    let result: ValidationResult

    switch (type) {
      case 'threatEvent':
        result = validateThreatEvent(data)
        break
      case 'activityFeedItem':
        result = validateActivityFeedItem(data)
        break
      case 'metricCard':
        result = validateMetricCard(data)
        break
    }

    return { data, result }
  } catch (error) {
    return null
  }
}

/**
 * Batch validate multiple items with error accumulation
 */
export function validateBatch<T>(
  items: T[],
  validator: (item: T) => ValidationResult
): {
  validItems: T[]
  invalidItems: { item: T; errors: string[] }[]
  hasErrors: boolean
} {
  const validItems: T[] = []
  const invalidItems: { item: T; errors: string[] }[] = []

  for (const item of items) {
    const result = validator(item)
    if (result.isValid) {
      validItems.push(item)
    } else {
      invalidItems.push({ item, errors: result.errors })
    }
  }

  return {
    validItems,
    invalidItems,
    hasErrors: invalidItems.length > 0,
  }
}

/**
 * Sanitize and normalize threat event data
 */
export function sanitizeThreatEvent(event: Partial<ThreatEvent>): ThreatEvent | null {
  const result = validateThreatEvent(event)
  if (!result.isValid) return null

  const safeEvent = event as ThreatEvent

  return {
    id: String(safeEvent.id).substring(0, 100),
    timestamp: Math.max(0, safeEvent.timestamp),
    severity: safeEvent.severity,
    type: String(safeEvent.type).substring(0, 100),
    source: String(safeEvent.source).substring(0, 50),
    description: String(safeEvent.description).substring(0, 500),
    status: safeEvent.status,
    affectedSystems: Array.isArray(safeEvent.affectedSystems)
      ? safeEvent.affectedSystems.map((s) => String(s).substring(0, 50))
      : undefined,
    actionTaken: safeEvent.actionTaken ? String(safeEvent.actionTaken).substring(0, 500) : undefined,
  }
}

/**
 * Sanitize and normalize activity feed item data
 */
export function sanitizeActivityFeedItem(item: Partial<ActivityFeedItem>): ActivityFeedItem | null {
  const result = validateActivityFeedItem(item)
  if (!result.isValid) return null

  const safeItem = item as ActivityFeedItem

  return {
    id: String(safeItem.id).substring(0, 100),
    timestamp: Math.max(0, safeItem.timestamp),
    type: safeItem.type,
    title: String(safeItem.title).substring(0, 200),
    description: String(safeItem.description).substring(0, 500),
    severity: safeItem.severity || 'info',
    read: Boolean(safeItem.read),
    actionUrl: safeItem.actionUrl ? String(safeItem.actionUrl).substring(0, 500) : undefined,
  }
}
