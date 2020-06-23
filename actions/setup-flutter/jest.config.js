module.exports = {
  clearMocks: true,
  globals: { "ts-jest": { packageJson: "package.json" } },
  moduleFileExtensions: ["js", "ts"],
  reporters: ["jest-silent-reporter"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  testRunner: "jest-circus/runner",
  transform: { "^.+\\.ts$": "ts-jest" },
};
