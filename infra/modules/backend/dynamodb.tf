locals {
  # Mirrors the TABLE_NAME constants in nodejs/backend/src/dynamo/entities/
  # pk = partition key, sk = sort key (null = no sort key), ttl_attr = TTL attribute name
  tables = {
    users        = { pk = "userId", sk = null,       ttl_attr = null        }
    oauth-tokens = { pk = "userId", sk = null,       ttl_attr = null        }
    sessions     = { pk = "sid",    sk = null,       ttl_attr = "expiresAt" }
    thread-meta  = { pk = "userId", sk = "threadId", ttl_attr = null        }
    sync-state   = { pk = "userId", sk = null,       ttl_attr = null        }
    agent-runs   = { pk = "userId", sk = "runId",    ttl_attr = "ttl"       }
  }
}

resource "aws_dynamodb_table" "tables" {
  for_each = local.tables

  name         = "${var.prefix}-${each.key}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = each.value.pk
  range_key    = each.value.sk

  attribute {
    name = each.value.pk
    type = "S"
  }

  dynamic "attribute" {
    for_each = each.value.sk != null ? [each.value.sk] : []
    content {
      name = attribute.value
      type = "S"
    }
  }

  dynamic "ttl" {
    for_each = each.value.ttl_attr != null ? [each.value.ttl_attr] : []
    content {
      attribute_name = ttl.value
      enabled        = true
    }
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.backend.arn
  }

  point_in_time_recovery {
    enabled = var.enable_pitr
  }

  tags = merge(var.tags, { Name = "${var.prefix}-${each.key}" })

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [tags]
  }
}
