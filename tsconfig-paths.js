const {
  compilerOptions: { paths, outDir, rootDir, baseUrl },
} = require("./tsconfig.json");
const tsConfigPaths = require("tsconfig-paths");

/**
 * Replaces `rootDir` with `outDir`. in the path definitions.
 * @dev
 * I could swear that this wasn't necessary before, I wonder why the
 * paths don't resolve without doing this anymore.
 */
const pathRewrites = Object.entries(paths).reduce((acc, [key, pathArr]) => {
  const alteredPaths = pathArr.map((path) =>
    path.replace(new RegExp(`^${rootDir}`), outDir)
  );
  acc[key] = alteredPaths;
  return acc;
}, {});

console.log(
  JSON.stringify({
    level: "debug",
    message: "tsconfig-paths settings",
    metadata: {
      originalPaths: paths,
      pathRewrites,
    },
  })
);

tsConfigPaths.register({
  baseUrl,
  paths: pathRewrites,
});
