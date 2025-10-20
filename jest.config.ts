export default {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'test',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        '**/*.(t|j)s',
        '!**/*.spec.ts',
        '!**/*.e2e-spec.ts',
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
};
