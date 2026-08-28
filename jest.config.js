const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // Sem isso, depois de rodar "npm run build" o Jest passa a executar
  // também os testes compilados em dist/ junto com os .ts originais em
  // src/ — duplicando a suíte e causando falhas por acesso concorrente
  // aos mesmos arquivos JSON de teste.
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: false, // ativado via --coverage (npm run test:coverage) ou no CI
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/tests/**'],
  // Piso calculado com base na cobertura atual do projeto (72.55% / 66.51% / 69.2% / 73.52%),
  // com uma margem de segurança abaixo pra não quebrar o CI de imediato.
  // Aumente esses números aos poucos ao longo do projeto até chegar em 80%+
  // (diferencial "20+ testes ou coverage 80%+" do documento oficial).
  coverageThreshold: {
    global: {
      statements: 65,
      branches: 60,
      functions: 60,
      lines: 65,
    },
  },
};