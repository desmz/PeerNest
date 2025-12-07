import path from 'path';

import { generateRoleId } from '@peernest/core/utils/id-generator';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csvtojson';

async function main() {
  const csvDirPath = path.join(__dirname, 'csv');
  const filename = 'role_dataset';
  const fileExt = 'csv';
  const csvFilePath = path.join(csvDirPath, `${filename}.${fileExt}`);

  console.log(csvFilePath);

  const headers = ['role_id', 'role_name', 'role_rank'];
  const csvConfig = {
    headers,
    trim: true,
    ignoreEmpty: true,
  };
  const dataObj = await csv(csvConfig).fromFile(csvFilePath);

  console.log(dataObj);

  const formattedDataObj = dataObj.map((role) => ({
    role_id: generateRoleId(),
    role_name: role.role_name,
    role_rank: parseInt(role.role_rank),
  }));

  const outputCsvPath = path.join(__dirname, 'formatted', 'formatted_role_dataset.csv');

  const csvWriter = createObjectCsvWriter({
    path: outputCsvPath,
    header: headers.map((header) => ({
      id: header,
      title: header,
    })),
  });

  await csvWriter.writeRecords(formattedDataObj);

  console.log('CSV written to:', outputCsvPath);
}

main();
