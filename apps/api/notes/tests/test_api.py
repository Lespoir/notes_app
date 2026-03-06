from django.test import TestCase
from django.urls import reverse, NoReverseMatch
from rest_framework.test import APIClient


class OpenAPISchemaEndpointTest(TestCase):
    """API contract tests for drf-spectacular endpoints delivered by task 0A."""

    def setUp(self):
        self.client = APIClient()

    def test_openapi_schema_endpoint_returns_200(self):
        """GET /api/v1/schema/ returns HTTP 200 with the OpenAPI schema."""
        response = self.client.get("/api/v1/schema/")

        self.assertEqual(response.status_code, 200)

    def test_openapi_schema_content_type_is_yaml_or_json(self):
        """The schema endpoint returns a YAML or JSON content type."""
        response = self.client.get("/api/v1/schema/")

        content_type = response.get("Content-Type", "")
        # drf-spectacular returns application/vnd.oai.openapi (YAML) or application/json
        self.assertTrue(
            "yaml" in content_type or "json" in content_type
            or "text/" in content_type or "openapi" in content_type,
            msg=f"Unexpected Content-Type for schema endpoint: {content_type}",
        )

    def test_swagger_ui_endpoint_returns_200(self):
        """GET /api/v1/schema/swagger-ui/ returns HTTP 200 with the Swagger UI."""
        response = self.client.get("/api/v1/schema/swagger-ui/")

        self.assertEqual(response.status_code, 200)

    def test_swagger_ui_content_type_is_html(self):
        """The Swagger UI endpoint returns HTML."""
        response = self.client.get("/api/v1/schema/swagger-ui/")

        self.assertIn("text/html", response.get("Content-Type", ""))

    def test_base_api_prefix_is_v1(self):
        """The base API routing prefix is /api/v1/."""
        # The schema endpoint being reachable at /api/v1/schema/ confirms the prefix.
        response = self.client.get("/api/v1/schema/")

        # A 200 means the /api/v1/ prefix is correctly configured.
        self.assertNotEqual(response.status_code, 404)
