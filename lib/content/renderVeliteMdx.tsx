import type { ReactNode } from "react";
import * as jsxRuntime from "react/jsx-runtime";

type VeliteMdxModule = {
  default: (props?: { components?: Record<string, unknown> }) => ReactNode;
};

export function renderVeliteMdx(body: string, components?: Record<string, unknown>): ReactNode {
  if (typeof body !== "string" || body.trim().length === 0) {
    return null;
  }

  try {
    const run = new Function(body) as (runtime: typeof jsxRuntime) => VeliteMdxModule;
    const module = run(jsxRuntime);

    if (!module || typeof module.default !== "function") {
      return null;
    }

    return module.default({ components });
  } catch {
    return null;
  }
}
