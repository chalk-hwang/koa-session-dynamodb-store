# koa-session-dynamodb-store

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/koa-session-dynamodb-store.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-session
[download-image]: https://img.shields.io/npm/dt/koa-session-dynamodb-store.svg?style=flat-square
[download-url]: https://npmjs.org/package/koa-

It is extension of [koa-session](https://github.com/koajs/session) that uses [DynamoDB](https://aws.amazon.com/dynamodb/) as session store inspired by [dynamodb-store](https://github.com/rafaelrpinto/dynamodb-store).

The project uses the following stack:

- ES2017
- Babel
- Eslint with AirBnB style
- Yarn
- Flow

## Installation

​
`yarn add koa-session-dynamodb-store`
or
`npm install --save koa-session-dynamodb-store`

## Usage

Usage within koa:

```javascript
const koaSession = require("koa-session");
const DynamoDBStore = require('koa-session-dynamodb-store');

app.use(koaSession({
    store: new DynamoDBStore(options),
    ...
}, app));
```

Usage within dynamodb-local:

```javascript
const koaSession = require("koa-session");
const DynamoDBStore = require('koa-session-dynamodb-store');

const dynamoDBStoreOptions = {
  dynamoConfig: {
    region: 'local',
    endpoint: 'http://localhost:8000',
    accessKeyId: "dummyKey",
    secretAccessKey: "dummyKey"
  };
}
;
app.use(koaSession({
    store: new DynamoDBStore(dynamoDBStoreOptions),
    ...
}, app));
```

## Options

```
{
  "table": {
    "name": "<NAME OF THE DYNAMO TABLE>", // default,  sessions
    "hashKey": "<NAME OF THE ID FIELD>", // default, sessionId
    "ttlKey": "<NAME OF THE DYNAMO TTL FIELD>", // default, expires
    "useTtlExpired": "<BOOLEAN>", // default, true
    "readCapacityUnits": "<NUMBER>", // default,: 5
    "writeCapacityUnits": "<NUMBER>" // default, 5
  },
  "dynamoConfig": {
    "accessKeyId": "<AWS ACCESS KEY>", // default
    "secretAccessKey": "<AWS ACCESS KEY SECRET>", // default
    "region": "<AWS REGION>", // default, If you are using the local version of DynamoDB, it must be a word that starts with local.
    "endpoint": "<DYNAMO ENDPOINT>" // default
  }
}
```

The `table` configuration is optional. The missing properties will be replaced by [defaults](https://github.com/DGURI/koa-session-dynamodb-store/blob/master/lib/constants.js).

Changing the `table.ttlKey` property may be ignored if the TTL attribute of DynamoDB is enabled. In this case, use the TTL property of DynamoDB as a priority.

If you have recently changed the value of `table.useTtlExpired`, the DynamoDB service will return an error. This will not work, please try again later.

Changing the `readCapacityUnits` and `writeCapacityUnits` frequently can also cause the DynamoDB service to return an error.

Please refer to the [AWS DynamoDB Development Guide](https://docs.aws.amazon.com/ko_kr/amazondynamodb/latest/developerguide/Programming.Errors.html) for details of the above error.

The `dynamoConfig` can be optional if the following environment variables are set: **AWS_ACCESS_KEY_ID**, **AWS_SECRET_ACCESS_KEY** and **AWS_REGION** (which are present on Lambda Functions running on AWS). All properties from [AWS.DynamoDB constructor](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property) can be informed in this structure.
