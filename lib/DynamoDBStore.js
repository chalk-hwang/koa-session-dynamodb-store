// @flow
import AWS from 'aws-sdk'; // eslint-disable-line
import {
  DEFAULT_TABLE_NAME,
  DEFAULT_RCU,
  DEFAULT_WCU,
  DEFAULT_CALLBACK,
  DEFAULT_HASH_KEY,
  DEFAULT_TTL_KEY,
  DEFAULT_USE_TTL_EXPIRED,
  API_VERSION,
} from './constants';
import { toSecondsEpoch, debug } from './utils';

export default class DynamoDBStore {
  dynamoService: AWS.DynamoDB;

  documentClient: AWS.DynamoDB.DocumentClient;

  tableName: string;

  hashKey: string;

  ttlKey: string;

  readCapacityUnits: number;

  writeCapacityUnits: number;

  isLocal: boolean;

  useTtlExpired: boolean;

  /**
   * Constructor.
   * @param  {Object} options Options is for configuring the store.
   * @param  {Function} callback Optional callback for table creation.
   */
  constructor(options?: Object = {}, callback?: Function = DEFAULT_CALLBACK) {
    debug('Initializing store', options);

    this.setOptions(options);

    const dynamoConfig = options.dynamoConfig || {};

    // dynamodb client configuration
    this.dynamoService = new AWS.DynamoDB({
      ...dynamoConfig,
      apiVersion: API_VERSION,
    });

    this.documentClient = new AWS.DynamoDB.DocumentClient({
      service: this.dynamoService,
    });

    // creates the table if necessary
    this.createTableIfDontExists(callback);
  }

  setOptions(options: Object): void {
    const { table = {}, dynamoConfig: { region = '' } = {} } = options;

    const {
      name = DEFAULT_TABLE_NAME,
      hashKey = DEFAULT_HASH_KEY,
      ttlKey = DEFAULT_TTL_KEY,
      readCapacityUnits = DEFAULT_RCU,
      writeCapacityUnits = DEFAULT_WCU,
      useTtlExpired = DEFAULT_USE_TTL_EXPIRED,
    } = table;

    Object.assign(this, {
      tableName: name,
      hashKey,
      ttlKey,
      readCapacityUnits: Number(readCapacityUnits),
      writeCapacityUnits: Number(writeCapacityUnits),
      isLocal: region.indexOf('local') >= 0,
      useTtlExpired,
    });
  }

  /**
   * Checks if the sessions table already exists.
   */
  async isTableCreated(): Promise<any> {
    try {
      // attempt to get details from a table
      const desc = await this.dynamoService
        .describeTable({
          TableName: this.tableName,
        })
        .promise();
      return desc;
    } catch (tableNotFoundError) {
      // Table does not exist
      // There is no error code on AWS error that we could match
      // so its safer to assume the error is because the table does not exist than
      // trying to match the message that could change
      return null;
    }
  }

  /**
   * Creates the session table.
   */
  createTable(): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      KeySchema: [{ AttributeName: this.hashKey, KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: this.hashKey, AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: this.readCapacityUnits,
        WriteCapacityUnits: this.writeCapacityUnits,
      },
    };
    return this.dynamoService.createTable(params).promise();
  }

  updateTable(): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      ProvisionedThroughput: {
        ReadCapacityUnits: this.readCapacityUnits,
        WriteCapacityUnits: this.writeCapacityUnits,
      },
    };
  }

  /**
   * Set TTL Field in DynamoDB.
   * (It does not work with DynamoDB Local.)
   *
   * @returns {Promise<any>}
   * @memberof DynamoDBStore
   */
  async setTtlField(): Promise<any> {
    const { tableName, ttlKey } = this;
    const params = {
      TableName: tableName,
      TimeToLiveSpecification: {
        AttributeName: ttlKey,
        Enabled: this.useTtlExpired,
      },
    };
    return this.dynamoService.updateTimeToLive(params).promise();
  }

  /**
   * Creates the session table. Does nothing if it already exists.
   * @param  {Function} callback Callback to be invoked at the end of the execution.
   */
  async createTableIfDontExists(callback: Function): Promise<void> {
    try {
      const exists = await this.isTableCreated();

      if (exists) {
        debug(`Table ${this.tableName} already exists`);

        if (!this.isLocal) {
          await this.setTtlField();
        }
      } else {
        debug(`Creating table ${this.tableName}...`);
        await this.createTable();

        if (!this.isLocal) {
          await this.setTtlField();
        }
      }

      callback();
    } catch (createTableError) {
      debug(`Error creating table ${this.tableName}`, createTableError);
      callback(createTableError);
    }
  }

  /**
   * Retrieves a session from dynamo.
   *
   * @param {string} id
   * @returns {Object}
   * @memberof DynamoDBStore
   */
  async get(id: string): Object {
    const { tableName, hashKey } = this;
    try {
      console.log(tableName);
      return await this.documentClient
        .get({
          Key: {
            [hashKey]: id,
          },
          TableName: tableName,
        })
        .promise()
        .then((result) => {
          if (result.Item && result.Item.session) {
            return result.Item.session;
          }
          return result.Item;
        });
    } catch (err) {
      throw new Error('Unable to get session.');
    }
  }

  /**
   * Stores a session.
   *
   * @param {string} id
   * @param {Object} session
   * @param {number} maxAge
   * @memberof DynamoDBStore
   */
  async set(id: string, session: Object, maxAge: number): Promise<any> {
    const { tableName, hashKey, ttlKey } = this;
    const Item = {
      session,
    };

    Item[hashKey] = id;
    Item[ttlKey] = toSecondsEpoch(this.getExpirationDate(maxAge));
    const params = { TableName: tableName, Item };
    return this.documentClient.put(params).promise();
  }

  /**
   * Calculates the session expiration date.
   * @param  {number} maxAge
   * @return {Date}      the session expiration date.
   */
  getExpirationDate(maxAge: number): Date {
    const expirationDate = Date.now() + maxAge;
    return new Date(expirationDate);
  }

  async destroy(id): Promise<any> {
    const { tableName, hashKey } = this;
    return this.documentClient
      .delete({
        Key: {
          [hashKey]: id,
        },
        TableName: tableName,
      })
      .promise();
  }
}
