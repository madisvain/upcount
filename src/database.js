const { createRxDatabase, addRxPlugin } = require('rxdb');
const { RxDBQueryBuilderPlugin } = require('rxdb/plugins/query-builder');
const { RxDBDevModePlugin } = require('rxdb/plugins/dev-mode');
const { addPouchPlugin, getRxStoragePouch } = require('rxdb/plugins/pouchdb');

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBDevModePlugin);
addPouchPlugin(require('pouchdb-adapter-idb'));

const clientSchema = {
  title: 'client schema',
  version: 0,
  primaryKey: 'name',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
    },
    address: {
      type: 'string',
    },
    emails: {
      type: 'string',
    },
    phone: {
      type: 'string',
    },
    vatin: {
      type: 'string',
    },
    website: {
      type: 'string',
    },
  },
  required: ['name'],
};

const invoiceSchema = {
  title: 'invoice schema',
  version: 0,
  primaryKey: 'number',
  type: 'object',
  properties: {
    number: {
      type: 'string',
      maxLength: 100,
    },
    client: {
      ref: 'client',
      type: 'string',
    },
    currency: {
      type: 'string',
      maxLength: 3,
      default: 'EUR',
    },
    date: {
      type: 'string',
      format: 'date',
    },
    due_date: {
      type: 'string',
      format: 'date',
    },
    customer_note: {
      type: 'string',
    },
    line_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
          },
          quantity: {
            type: 'number',
          },
          price: {
            type: 'number',
          },
          tax: {
            ref: 'tax',
            type: 'string',
          },
        },
      },
    },
  },
  required: ['number', 'client', 'currency', 'date'],
};

const organizationSchema = {
  title: 'organization schema',
  version: 0,
  primaryKey: 'name',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
    },
    address: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    phone: {
      type: 'string',
    },
    registration_number: {
      type: 'string',
    },
    bank_name: {
      type: 'string',
    },
    iban: {
      type: 'string',
    },
    vatin: {
      type: 'string',
    },
    website: {
      type: 'string',
    },
    currency: {
      type: 'string',
      maxLength: 3,
      default: 'EUR',
    },
    minimum_fraction_digits: {
      type: 'number',
      minimum: 0,
      maximum: 10,
      default: 2,
    },
    due_days: {
      type: 'number',
      minimum: 0,
      default: 7,
    },
    overdue_charge: {
      type: 'number',
      minimum: 0,
    },
    notes: {
      type: 'string',
      maxLength: 3,
      default: 'Thank you for your business',
    },
  },
  required: ['name'],
};

const taxRateSchema = {
  title: 'tax rate schema',
  version: 0,
  primaryKey: 'name',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
    },
    description: {
      type: 'string',
    },
    percentage: {
      type: 'number',
      minimum: 0,
      maximum: 100,
    },
  },
  required: ['name'],
};

const createDatabase = async (name, adapter) => {
  console.log('creating database ...');
  const db = await createRxDatabase({
    name,
    storage: getRxStoragePouch(adapter),
  });

  console.log('creating collections ...');
  await db.addCollections({
    clients: {
      schema: clientSchema,
    },
    invoices: {
      schema: invoiceSchema,
    },
    organizations: {
      schema: organizationSchema,
    },
    tax_rates: {
      schema: taxRateSchema,
    },
  });

  return db;
};

module.exports = {
  createDatabase,
};
