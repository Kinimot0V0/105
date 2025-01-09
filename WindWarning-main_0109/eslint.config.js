import eslint from '@eslint/js'
import vuePlugin from 'eslint-plugin-vue'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
  // JavaScript 基础规则
  eslint.configs.recommended,

  // Vue 推荐规则
  ...vuePlugin.configs['flat/essential'],

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },

    plugins: {
      prettier: prettierPlugin
    },

    rules: {
      // Prettier 规则
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: false,
          printWidth: 120,
          trailingComma: 'none',
          endOfLine: 'auto'
        }
      ],

      // Vue 组件命名规则
      'vue/multi-word-component-names': [
        'warn',
        {
          ignores: ['index']
        }
      ],

      // 未定义变量规则
      'no-undef': 'error'
    }
  },

  // 忽略配置
  {
    ignores: ['**/dist', '**/node_modules', '**/.vite', '**/.nuxt', '**/.cache']
  }
]
