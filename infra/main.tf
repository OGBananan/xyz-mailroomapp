locals {
  prefix = "xyz-mailroomapp"
  name   = "${local.prefix}-${var.env}"
  tags   = { env = var.env, project = local.prefix, managed_by = "terraform" }
}

module "frontend" {
  source = "./modules/frontend"

  name            = local.name
  certificate_arn = var.certificate_arn
  aliases         = var.aliases
  tags            = local.tags
}

module "backend" {
  source = "./modules/backend"

  prefix                = local.prefix
  compute_principal     = "ecs-tasks"
  agentcore_runtime_arn = var.agentcore_runtime_arn
  enable_pitr           = var.enable_pitr
  tags                  = local.tags
}
