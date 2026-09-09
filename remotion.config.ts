import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";
import { resolve } from "node:path";

Config.overrideBundlerConfig((currentConfiguration) => {
  const tailwindConfiguration = enableTailwind(currentConfiguration);

  return {
    ...tailwindConfiguration,
    resolve: {
      ...tailwindConfiguration.resolve,
      alias: {
        ...(tailwindConfiguration.resolve?.alias ?? {}),
        "@": resolve(process.cwd(), "src"),
      },
    },
  };
});
