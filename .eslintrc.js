module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  settings: {
    react: {
      version: 'detect'
    },
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "indent": [
      "error",
      2,
      { "SwitchCase": 1 }
    ],
    "linebreak-style": [
        "error",
        "unix"
    ],
    "quotes": [
        "error",
        "single"
    ],
    "semi": [
        "error",
        "never"
    ],
    "brace-style": [
        "error"
    ],
    "object-shorthand": [
        "error"
    ],
    "eol-last": [
        "error",
        "always"
    ],
    "spaced-comment": [
        "error",
        "always"
    ],
    "keyword-spacing": [
        "error"
    ],
    "no-multi-spaces": [
        "error"
    ],
    "block-spacing": [
        "error"
    ],
    "comma-spacing": [
        "error"
    ],
    "arrow-spacing": [
        "error"
    ],
    "rest-spread-spacing": [
        "error",
        "never"
    ],
    "space-before-blocks": [
        "error"
    ],
    "key-spacing": [
        "error"
    ],   
  },
}

