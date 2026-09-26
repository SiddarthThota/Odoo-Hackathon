module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],

  rootDir: '..',

  testRegex: 'test/.*\\.spec\\.ts$',

  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            decorators: true,
            dynamicImport: true,
          },
          target: 'es2022',
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },

        module: {
          type: 'commonjs',
        },
      },
    ],
  },

  transformIgnorePatterns: [
    '/node_modules/(?!@nestjs/)',
  ],

  testEnvironment: 'node',

  clearMocks: true,

  collectCoverage: false,
};