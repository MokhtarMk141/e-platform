require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const { Prisma, PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_OUTPUT_PATH = path.join(__dirname, 'database-backup.js');
const DEFAULT_BACKUP_PATH = DEFAULT_OUTPUT_PATH;

function getModelMeta() {
  return Prisma.dmmf.datamodel.models.map((model) => {
    const delegate = model.name.charAt(0).toLowerCase() + model.name.slice(1);
    const dependencies = model.fields
      .filter(
        (field) =>
          field.kind === 'object' &&
          field.relationFromFields?.length &&
          field.type !== model.name,
      )
      .map((field) => field.type);
    const selfRelationFields = model.fields
      .filter(
        (field) =>
          field.kind === 'object' &&
          field.relationFromFields?.length &&
          field.type === model.name,
      )
      .flatMap((field) => field.relationFromFields);
    const idFields = model.fields.filter((field) => field.isId).map((field) => field.name);

    return {
      name: model.name,
      delegate,
      dependencies: [...new Set(dependencies)],
      selfRelationFields: [...new Set(selfRelationFields)],
      idFields,
    };
  });
}

function getTopologicalOrder(models) {
  const remaining = new Map(models.map((model) => [model.name, new Set(model.dependencies)]));
  const resolved = new Set();
  const order = [];

  while (remaining.size) {
    const ready = [...remaining.entries()]
      .filter(([, deps]) => [...deps].every((dep) => resolved.has(dep)))
      .map(([name]) => name)
      .sort();

    if (!ready.length) {
      order.push(...[...remaining.keys()].sort());
      break;
    }

    for (const name of ready) {
      order.push(name);
      resolved.add(name);
      remaining.delete(name);
    }
  }

  return order;
}

function serialize(value, indent = 0) {
  const spacing = '  '.repeat(indent);
  const childSpacing = '  '.repeat(indent + 1);

  if (value instanceof Date) {
    return `new Date(${JSON.stringify(value.toISOString())})`;
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return '[]';
    }

    return `[\n${value
      .map((item) => `${childSpacing}${serialize(item, indent + 1)}`)
      .join(',\n')}\n${spacing}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value);

    if (!entries.length) {
      return '{}';
    }

    return `{\n${entries
      .map(([key, item]) => `${childSpacing}${JSON.stringify(key)}: ${serialize(item, indent + 1)}`)
      .join(',\n')}\n${spacing}}`;
  }

  return JSON.stringify(value);
}

function getWhereUnique(row, idFields) {
  if (idFields.length !== 1) {
    throw new Error(`Restore currently expects a single-field id. Received: ${idFields.join(', ')}`);
  }

  return { [idFields[0]]: row[idFields[0]] };
}

async function backupDatabase(outputArg) {
  const outputPath = path.resolve(outputArg || DEFAULT_OUTPUT_PATH);
  const models = getModelMeta();
  const modelOrder = getTopologicalOrder(models);
  const data = {};
  const counts = {};

  for (const modelName of modelOrder) {
    const model = models.find((entry) => entry.name === modelName);
    const rows = await prisma[model.delegate].findMany();
    data[modelName] = rows;
    counts[modelName] = rows.length;
  }

  const fileContents = `module.exports = ${serialize({
    generatedAt: new Date(),
    modelOrder,
    counts,
    data,
  })};\n`;

  await fs.writeFile(outputPath, fileContents, 'utf8');

  console.log(`Backup written to ${outputPath}`);
  console.table(counts);
}

async function restoreDatabase(backupArg) {
  const backupPath = path.resolve(backupArg || DEFAULT_BACKUP_PATH);
  const backup = require(backupPath);
  const models = getModelMeta();
  const modelMetaByName = new Map(models.map((model) => [model.name, model]));
  const modelOrder = backup.modelOrder || Object.keys(backup.data || {});
  const deleteOrder = [...modelOrder].reverse();

  console.log(`Restoring backup from ${backupPath}`);

  for (const modelName of deleteOrder) {
    const meta = modelMetaByName.get(modelName);
    if (!meta) {
      continue;
    }

    await prisma[meta.delegate].deleteMany();
  }

  for (const modelName of modelOrder) {
    const meta = modelMetaByName.get(modelName);
    const rows = backup.data?.[modelName] || [];

    if (!meta || !rows.length) {
      continue;
    }

    const rowsWithoutSelfRefs = rows.map((row) => {
      if (!meta.selfRelationFields.length) {
        return row;
      }

      const clone = { ...row };

      for (const fieldName of meta.selfRelationFields) {
        clone[fieldName] = null;
      }

      return clone;
    });

    await prisma[meta.delegate].createMany({
      data: rowsWithoutSelfRefs,
    });

    if (!meta.selfRelationFields.length) {
      continue;
    }

    for (const row of rows) {
      const selfRefUpdate = meta.selfRelationFields.reduce((acc, fieldName) => {
        acc[fieldName] = row[fieldName] ?? null;
        return acc;
      }, {});

      if (Object.values(selfRefUpdate).every((value) => value === null)) {
        continue;
      }

      await prisma[meta.delegate].update({
        where: getWhereUnique(row, meta.idFields),
        data: selfRefUpdate,
      });
    }
  }

  console.log('Database restored successfully.');
}

async function main() {
  const command = (process.argv[2] || 'backup').toLowerCase();
  const fileArg = process.argv[3];

  if (command === 'backup') {
    await backupDatabase(fileArg);
    return;
  }

  if (command === 'restore') {
    await restoreDatabase(fileArg);
    return;
  }

  throw new Error('Unknown command. Use "backup" or "restore".');
}

main()
  .catch((error) => {
    console.error('Backup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
