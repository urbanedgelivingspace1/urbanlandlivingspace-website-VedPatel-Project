# Integration tests

Integration suites begin after M2 creates a disposable schema. Every stateful suite must enter
through `npm run test:integration`, which rejects production-shaped environment configuration.
