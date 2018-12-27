const DynamoDBStore = require('../dist/DynamoDBStore').default;

jest.mock('aws-sdk');

const ResourceNotFoundException = new Error();
ResourceNotFoundException.code = 'ResourceNotFoundException';

const RESOURCE_NOT_FOUND_EXCEPTION = Promise.reject(ResourceNotFoundException);

describe('DynamoDBStore/isTableCreated', () => {
  let store;
  let describeTable;
  let describeTimeToLive;
  const TABLE_NAME = 'session-table-name';

  beforeEach(() => {
    store = new DynamoDBStore({ table: { name: TABLE_NAME } });

    describeTable = { describe: 'attributes' };

    describeTimeToLive = { ttl: 'attributes' };

    store.dynamoService.describeTable = jest.fn(
      () => ({
        promise: () => Promise.resolve(describeTable),
      }),
    );

    store.dynamoService.describeTimeToLive = jest.fn(
      () => ({
        promise: () => Promise.resolve(describeTimeToLive),
      }),
    );
  });

  it('should call describeTable', async () => {
    await store.isTableCreated();
    expect(store.dynamoService.describeTable.mock.calls).toEqual([[{ TableName: TABLE_NAME }]]);
  });

  it('should provide describeTable results', async () => {
    const result = await store.isTableCreated();
    expect(result).toMatchObject({ describeTable });
  });

  it('should throw describeTable errors', () => {
    const describeTableError = { describe: 'Error' };
    describeTable = Promise.reject(describeTableError);
    return expect(store.isTableCreated()).rejects.toEqual(describeTableError);
  });

  it('should call describeTable', async () => {
    await store.isTableCreated();
    expect(store.dynamoService.describeTimeToLive.mock.calls)
      .toEqual([[{ TableName: TABLE_NAME }]]);
  });

  it('should return null on ResourceNotFoundException exception for describeTable', () => {
    describeTable = RESOURCE_NOT_FOUND_EXCEPTION;
    return expect(store.isTableCreated()).resolves.toEqual(null);
  });

  it('should provide describeTimeToLive results', async () => {
    const result = await store.isTableCreated();
    expect(result).toMatchObject({ describeTimeToLive });
  });

  it('should throw describeTimeToLive errors', () => {
    const ttlError = { ttl: 'Error' };
    describeTimeToLive = Promise.reject(ttlError);
    return expect(store.isTableCreated()).rejects.toEqual(ttlError);
  });

  it('should return null on ResourceNotFoundException exception for describeTimeToLive', () => {
    describeTimeToLive = RESOURCE_NOT_FOUND_EXCEPTION;
    return expect(store.isTableCreated()).resolves.toEqual(null);
  });
});
