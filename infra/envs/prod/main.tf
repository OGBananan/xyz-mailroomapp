locals {
  prefix = "xyz-mailroomapp"
  tags   = { env = "prod", project = "xyz-mailroomapp", managed_by = "terraform" }
}

module "frontend" {
  source = "../../modules/frontend"

  name            = "${local.prefix}-prod"
  certificate_arn = var.certificate_arn
  aliases         = var.aliases
  tags            = local.tags
}

module "backend" {
  source = "../../modules/backend"

  prefix                = local.prefix
  compute_principal     = "ecs-tasks"
  agentcore_runtime_arn = var.agentcore_runtime_arn
  enable_pitr           = true   # on in prod — point-in-time recovery
  tags                  = local.tags
}
