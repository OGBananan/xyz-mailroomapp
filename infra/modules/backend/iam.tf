locals {
  # Maps compute_principal input to the AWS service principal string
  service_principal = {
    ecs-tasks = "ecs-tasks.amazonaws.com"
    ec2       = "ec2.amazonaws.com"
    lambda    = "lambda.amazonaws.com"
  }
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = [local.service_principal[var.compute_principal]]
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
# Encrypt/decrypt for OAuth tokens. Key usage is also granted in kms.tf key
# policy — both must allow the action for it to succeed.

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

# ── AgentCore ─────────────────────────────────────────────────────────────────

data "aws_iam_policy_document" "agentcore" {
  statement {
    sid     = "InvokeAgentRuntime"
    effect  = "Allow"
    actions = ["bedrock-agentcore:InvokeAgentRuntime"]
    resources = [var.agentcore_runtime_arn]
  }
}

resource "aws_iam_role_policy" "agentcore" {
  name   = "agentcore"
  role   = aws_iam_role.backend.id
  policy = data.aws_iam_policy_document.agentcore.json
}
