const js = require('@eslint/js')
const pluginVue = require('eslint-plugin-vue')
const globals = require('globals')

module.exports = [
  // liga.js ist ein mitgelieferter Icon-Font-Polyfill (IcoMoon), kein eigener Code
  { ignores: ['dist/**', 'node_modules/**', 'src/assets/fonts/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // App.vue greift über die Element-ID auf <div id="app"> zu
        app: 'readonly',
      },
    },
    rules: {
      // Bestehende Komponenten heißen "Skills" und "Gallographic"
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['*.config.js', 'babel.config.js'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } },
  },
]
