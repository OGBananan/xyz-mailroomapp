# Naming convention: {prefix}-{service_name}
# prefix      = reverse-domain project id  (e.g. xyz-mailroomapp  → mailroomapp.xyz)
# service_name = what this service IS       (e.g. nestjs-api)
# Result:      xyz-mailroomapp-nestjs-api  — unambiguous in any AWS account

locals {
  service_id = "${var.prefix}-${var.service_name}"
}

# ── IAM policy document ───────────────────────────────────────────────────────

data "aws_iam_policy_document" "backend" {
  statement {
    sid    = "DynamoDBTableAccess"
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan",
    ]
    resources = [for t in aws_dynamodb_table.tables : t.arn]
  }

  dynamic "statement" {
    for_each = length(var.agentcore_runtime_arns) > 0 ? [1] : []
    content {
      sid       = "BedrockAgentCoreInvoke"
      effect    = "Allow"
      actions   = ["bedrock-agentcore:InvokeAgentRuntime"]
      resources = var.agentcore_runtime_arns
    }
  }
}

# ── Managed policy ────────────────────────────────────────────────────────────

resource "aws_iam_policy" "backend" {
  name        = "${local.service_id}-policy"
  description = "Grants ${local.service_id} access to its DynamoDB tables and (optionally) AgentCore runtimes."
  policy      = data.aws_iam_policy_document.backend.json
  tags        = merge(var.tags, { Name = "${local.service_id}-policy" })
}

# ── IAM user ──────────────────────────────────────────────────────────────────

resource "aws_iam_user" "backend" {
  name = local.service_id
  path = "/${var.prefix}/"
  tags = merge(var.tags, { Name = local.service_id })
}

resource "aws_iam_user_policy_attachment" "backend" {
  user       = aws_iam_user.backend.name
  policy_arn = aws_iam_policy.backend.arn
}

# ── Access key ────────────────────────────────────────────────────────────────

resource "aws_iam_access_key" "backend" {
  user = aws_iam_user.backend.name
}
