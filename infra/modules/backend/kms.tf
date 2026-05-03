data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "kms_key" {
  # Root account retains full access so the key is never orphaned
  statement {
    sid    = "RootFullAccess"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }

  # Optional admin roles — rotate, disable, schedule deletion
  dynamic "statement" {
    for_each = length(var.kms_admin_role_arns) > 0 ? [1] : []
    content {
      sid    = "KeyAdministrators"
      effect = "Allow"
      principals {
        type        = "AWS"
        identifiers = var.kms_admin_role_arns
      }
      actions = [
        "kms:Create*", "kms:Describe*", "kms:Enable*", "kms:List*", "kms:Put*",
        "kms:Update*", "kms:Revoke*", "kms:Disable*", "kms:Get*", "kms:Delete*",
        "kms:ScheduleKeyDeletion", "kms:CancelKeyDeletion",
      ]
      resources = ["*"]
    }
  }

  # The backend role itself can use the key for encrypt/decrypt
  statement {
    sid    = "BackendKeyUsage"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.backend.arn]
    }
    actions   = ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey", "kms:DescribeKey"]
    resources = ["*"]
  }
}

resource "aws_kms_key" "backend" {
  description             = "CMK for ${var.prefix} — OAuth token encryption"
  enable_key_rotation     = true
  deletion_window_in_days = 30
  policy                  = data.aws_iam_policy_document.kms_key.json
  tags                    = merge(var.tags, { Name = "${var.prefix}-backend" })

  lifecycle { prevent_destroy = true }
}

resource "aws_kms_alias" "backend" {
  name          = "alias/${var.prefix}-backend"
  target_key_id = aws_kms_key.backend.key_id
}
