const DynamoDBStore = require('../dist/DynamoDBStore').default;

jest.mock('aws-sdk');

describe('DynamoDBStore/constructor', () => {
    it('should a be constructor', () => {
        expect(new DynamoDBStore()).toBeInstanceOf(DynamoDBStore);
    });

    describe('DynamoDBStore:autoCreateTable', () => {
        let createTableIfDontExists;
        let originFn;

        beforeEach(() => {
            originFn = DynamoDBStore.prototype.createTableIfDontExists;
            createTableIfDontExists = jest.fn(() => {});
            DynamoDBStore.prototype.createTableIfDontExists = createTableIfDontExists;
        });

        afterEach(() => {
            DynamoDBStore.prototype.createTableIfDontExists = originFn;
        });

        it('should not provide autoCreateTable functionality by default', () => {
            new DynamoDBStore();
            expect(createTableIfDontExists.mock.calls.length).toEqual(0);
        });

        it('should provide autoCreateTable functionality on  demand', () => {
            new DynamoDBStore({autoCreateTable: true});
            expect(createTableIfDontExists.mock.calls.length).toEqual(1);
        });
    })
});