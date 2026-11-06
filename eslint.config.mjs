import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'src/routes.ts', 'generators/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      // Empty interfaces are used by tsoa to name the DTOs
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }]
    }
  }
);
