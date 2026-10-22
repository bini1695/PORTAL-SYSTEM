module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$', // Only look at .ts test files
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',   // Use ts-jest to compile TypeScript
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'], // Ignore the compiled JS files
};