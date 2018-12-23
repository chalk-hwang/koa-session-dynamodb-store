# koa-session-dynamodb-store

![](https://img.shields.io/npm/dt/koa-session-dynamodb-store.svg?style=flat-square)

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
}));
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
}));
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

The `table` configuration is optional. The missing properties will be replaced by [defaults](https://github.com/DGURI/koa-session-dynamodb-store/blob/master/lib/constants.js). `readCapacityUnits` and `writeCapacityUnits` are only used if the table is created by this store.

The `dynamoConfig` can be optional if the following environment variables are set: **AWS_ACCESS_KEY_ID**, **AWS_SECRET_ACCESS_KEY** and **AWS_REGION** (which are present on Lambda Functions running on AWS). All properties from [AWS.DynamoDB constructor](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property) can be informed in this structure.
