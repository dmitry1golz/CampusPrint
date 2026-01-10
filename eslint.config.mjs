import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    ignores: ["target/", "dist/", "node_modules/"]
  }
);