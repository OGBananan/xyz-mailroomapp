module "frontend" {
  source = "./modules/frontend"

  certificate_arn = var.certificate_arn
}

module "backend" {
  source = "./modules/backend"

  prefix                 = var.backend_prefix
  service_name           = var.backend_service_name
  agentcore_runtime_arns = var.backend_agentcore_runtime_arns
  enable_pitr            = var.backend_enable_pitr
  tags                   = var.tags
}
