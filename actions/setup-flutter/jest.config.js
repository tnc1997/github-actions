module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["js", "ts"],
  reporters: ["jest-silent-reporter"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  testRunner: "jest-circus/runner",
  transform: { "^.+\\.ts$": "ts-jest" },
};
