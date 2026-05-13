locals {
  service_principal = {
    ecs-tasks = "ecs-tasks.amazonaws.com"
    ec2       = "ec2.amazonaws.com"
    lambda    = "lambda.amazonaws.com"
  }
}

# ── Assume-role policy (service or IAM user) ──────────────────────────────────

data "aws_iam_policy_document" "assume_role" {
  dynamic "statement" {
    for_each = var.compute_principal != "iam-user" ? [1] : []
    content {
      effect  = "Allow"
      actions = ["sts:AssumeRole"]
      principals {
        type        = "Service"
        identifiers = [local.service_principal[var.compute_principal]]
      }
    }
  }

  dynamic "statement" {
    for_each = var.compute_principal == "iam-user" && var.iam_user_arn != "" ? [1] : []
    content {
      effect  = "Allow"
      actions = ["sts:AssumeRole"]
      principals {
        type        = "AWS"
        identifiers = [var.iam_user_arn]
      }
    }
  }
}

resource "aws_iam_role" "backend" {
  name               = "${var.prefix}-backend"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  tags               = merge(var.tags, { Name = "${var.prefix}-backend" })
}

# ── DynamoDB ──────────────────────────────────────────────────────────────────

data "aws_iam_policy_document" "dynamodb" {
  statement {
    sid    = "TableAccess"
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
}

resource "aws_iam_role_policy" "dynamodb" {
  name   = "dynamodb"
  role   = aws_iam_role.backend.id
  policy = data.aws_iam_policy_document.dynamodb.json
}

# ── KMS ───────────────────────────────────────────────────────────────────────

data "aws_iam_policy_document" "kms" {
  statement {
    sid     = "TokenEncryption"
    effect  = "Allow"
    actions = ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey", "kms:DescribeKey"]
    resources = [aws_kms_key.backend.arn]
  }
}

resource "aws_iam_role_policy" "kms" {
  name   = "kms"
  role   = aws_iam_role.backend.id
  policy = data.aws_iam_policy_document.kms.json
}

# ── AgentCore (optional — only created when ARNs are supplied) ────────────────

data "aws_iam_policy_document" "agentcore" {
  count = length(var.agentcore_runtime_arns) > 0 ? 1 : 0

  statement {
    sid     = "InvokeAgentRuntime"
    effect  = "Allow"
    actions = ["bedrock-agentcore:InvokeAgentRuntime"]
    resources = var.agentcore_runtime_arns
  }
}

resource "aws_iam_role_policy" "agentcore" {
  count  = length(var.agentcore_runtime_arns) > 0 ? 1 : 0
  name   = "agentcore"
  role   = aws_iam_role.backend.id
  policy = data.aws_iam_policy_document.agentcore[0].json
}
