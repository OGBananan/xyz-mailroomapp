locals {
  prefix = "xyz-mailroomapp"
  tags   = { env = "dev", project = "xyz-mailroomapp", managed_by = "terraform" }
}

module "frontend" {
  source = "../../modules/frontend"

  name = "${local.prefix}-dev"
  tags = local.tags
}

module "backend" {
  source = "../../modules/backend"

  prefix                = local.prefix
  compute_principal     = "ecs-tasks"
  agentcore_runtime_arn = var.agentcore_runtime_arn
  enable_pitr           = false   # off in dev — saves cost
  tags                  = local.tags
}
