module.exports = {
  env: {
    es6: true,
  },
  extends: [
    "eslint:recommended",
    // TypeScriptでチェックされる項目をLintから除外する設定
    "plugin:@typescript-eslint/recommended",
    // prettierのextendsは他のextendsより後に記述する
    "prettier",
    // 2021-02-21から記述不要
    // "prettier/@typescript-eslint",
  ],
  plugins: [
    "@typescript-eslint"
  ],
  // ESLintでTypescriptを解析する
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "sourceType": "module",
    // TypeScriptのLint時に参照するconfigファイルを指定
    "project": "./tsconfig.json"
  },
  // 上位ディレクトリにある親のeslintrcを参照しないようにする
  root: true,
  rules: {}
}