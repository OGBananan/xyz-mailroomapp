module "frontend" {
  source = "./modules/frontend"

  certificate_arn = var.certificate_arn
}
