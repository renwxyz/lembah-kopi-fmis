package docs

import "embed"

// FS contains the canonical OpenAPI contract served by Swagger UI.
//
//go:embed openapi.yaml
var FS embed.FS
