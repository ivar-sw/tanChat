import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  typescript: true,
  ignores: ['src/routeTree.gen.ts', 'test-results/**'],
  rules: {
    'node/prefer-global/process': 'off',
    'antfu/top-level-function': 'off',
  },
}, {
  files: ['src/routes/**/*.tsx'],
  rules: {
    'react-refresh/only-export-components': 'off',
    'ts/no-use-before-define': 'off',
  },
})
