terraform {
  required_version = "~> 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Bootstrap has no remote backend — it creates the backend that everything
  # else will use. Apply this once manually, then commit the state file
  # to the bucket it just created.
}
