# ── IAM policy document ───────────────────────────────────────────────────────

data "aws_iam_policy_document" "backend" {
  # DynamoDB — full CRUD on all backend tables
  statement {
    sid    = "DynamoDB"
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

  # AgentCore — only added when runtime ARNs are supplied
  dynamic "statement" {
    for_each = length(var.agentcore_runtime_arns) > 0 ? [1] : []
    content {
      sid       = "AgentCore"
      effect    = "Allow"
      actions   = ["bedrock-agentcore:InvokeAgentRuntime"]
      resources = var.agentcore_runtime_arns
    }
  }
}

# ── Managed policy ────────────────────────────────────────────────────────────

resource "aws_iam_policy" "backend" {
  name        = "${var.prefix}-backend"
  description = "Grants the ${var.prefix} backend service access to its DynamoDB tables and AgentCore runtimes."
  policy      = data.aws_iam_policy_document.backend.json
  tags        = var.tags
}

# ── IAM user ──────────────────────────────────────────────────────────────────

resource "aws_iam_user" "backend" {
  name = "${var.prefix}-backend"
  tags = merge(var.tags, { Name = "${var.prefix}-backend" })
}

resource "aws_iam_user_policy_attachment" "backend" {
  user       = aws_iam_user.backend.name
  policy_arn = aws_iam_policy.backend.arn
}

# ── Access key (stored in Terraform state — state bucket is encrypted) ────────

resource "aws_iam_access_key" "backend" {
  user = aws_iam_user.backend.name
}
