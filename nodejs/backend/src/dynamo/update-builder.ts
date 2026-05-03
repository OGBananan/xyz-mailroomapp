/**
 * Builds a DynamoDB UpdateExpression (SET only) from a plain partial object.
 * Keys with undefined values are skipped.
 *
 * All attribute names are aliased to avoid conflicts with DDB reserved words.
 */
export interface UpdateExpressionParts {
  UpdateExpression:            string
  ExpressionAttributeNames:   Record<string, string>
  ExpressionAttributeValues:  Record<string, unknown>
}

export interface UpdateOptions {
  /** Optional condition expression (raw DDB syntax using the same name/value aliases). */
  condition?:       string
  conditionNames?:  Record<string, string>
  conditionValues?: Record<string, unknown>
}

export function buildUpdateExpression(
  updates: Record<string, unknown>,
  opts: UpdateOptions = {},
): UpdateExpressionParts & { ConditionExpression?: string } {
  const setParts: string[]             = []
  const names:    Record<string, string>  = { ...opts.conditionNames }
  const values:   Record<string, unknown> = { ...opts.conditionValues }

  let i = 0
  for (const [key, val] of Object.entries(updates)) {
    if (val === undefined) continue
    const n = `#f${i}`
    const v = `:v${i}`
    names[n] = key
    values[v] = val
    setParts.push(`${n} = ${v}`)
    i++
  }

  if (setParts.length === 0) throw new Error('buildUpdateExpression: no fields to update')

  return {
    UpdateExpression:           `SET ${setParts.join(', ')}`,
    ExpressionAttributeNames:   names,
    ExpressionAttributeValues:  values,
    ...(opts.condition ? { ConditionExpression: opts.condition } : {}),
  }
}
