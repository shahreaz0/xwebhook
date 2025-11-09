import packageJSON from "../../package.json";
import type { AppOpenAPI } from "./types";

import { Scalar } from "@scalar/hono-api-reference";

export function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Al-Hira API",
      description: "Al-Hira organization API",
    },
  });

  app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
  });

  app.get(
    "/reference",
    Scalar({
      spec: {
        url: "/doc",
      },
    })
  );
}
