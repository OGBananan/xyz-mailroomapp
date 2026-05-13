module "frontend" {
  source = "./modules/frontend"

  certificate_arn = var.certificate_arn
}

module "backend" {
  source = "./modules/backend"

  prefix                 = var.backend_prefix
  agentcore_runtime_arns = var.backend_agentcore_runtime_arns
  enable_pitr            = var.backend_enable_pitr
  tags                   = var.tags
}
