/* eslint-disable @typescript-eslint/naming-convention */
// import fs from 'fs';
import path from 'path';
// import { exit } from 'process';

import { generateNotificationTypeId } from '@peernest/core/utils/id-generator';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csvtojson';

const PREVIEW_ITEMS_NUMBER = 10;

// function getDataFromJson(): unknown[] {
//   let criteriaObj;
//   try {
//     criteriaObj = fs.readFileSync(
//       path.join(__dirname, 'json', 'notification_type-criteria.json'),
//       'utf8'
//     );
//   } catch (error) {
//     console.error('Failed to read the json file');
//     console.error(error);
//     exit(1);
//   }

//   console.log(criteriaObj);

//   return JSON.parse(criteriaObj);
// }

function getCsvFilePath(filename: string, isFormattedDir?: boolean) {
  const dirName = isFormattedDir ? 'formatted' : 'csv';
  const csvDirPath = path.join(__dirname, dirName);
  const fileExt = 'csv';
  const csvFilePath = path.join(csvDirPath, `${filename}.${fileExt}`);

  console.log('Getting file from :' + csvFilePath);
  console.log();

  return csvFilePath;
}

async function getDataFromCsv(filename: string, headers: string[], isFormattedDir?: boolean) {
  const includeRegex = new RegExp(headers.join('|'));
  const csvConfig = {
    headers,
    trim: true,
    ignoreEmpty: true,
    includeColumns: includeRegex,
  };
  const csvFilePath = getCsvFilePath(filename, isFormattedDir);

  const dataObj = await csv(csvConfig).fromFile(csvFilePath);

  // get the first 10 items
  console.log(dataObj.slice(0, PREVIEW_ITEMS_NUMBER));
  console.log();

  return dataObj;
}

async function main() {
  const mappingKey = 'notification_category_name';

  const headers = ['notification_type_id', 'notification_type_name', mappingKey];
  const filename = 'notification_type_dataset';
  const notificationTypeObj = await getDataFromCsv(filename, headers);

  const notificationCategoryObj = await getDataFromCsv(
    'formatted_notification_category_dataset',
    ['notification_category_id', mappingKey],
    true
  );

  // mapping
  const map = new Map<string, string>(
    notificationCategoryObj.map(({ notification_category_name, notification_category_id }) => [
      notification_category_name,
      notification_category_id,
    ])
  );

  // read json
  // const criteriaObj = getDataFromJson() as Array<{ title: string; otherCriteria: unknown }>;

  // const criteriaMap = new Map<string, unknown>(
  //   criteriaObj.map(({ title, ...otherCriteria }) => [title, otherCriteria])
  // );
  const appendedColumns = [
    'notification_type_notification_category_id',
    // 'notification_type_criteria',
    // 'notification_type_position',
  ];

  // formatting
  const formattedDataObj = notificationTypeObj.map(
    ({
      notification_category_name: mappingKey,
      notification_type_title: criteriaMappingKey,
      ...notification_type
    }) => {
      console.log(criteriaMappingKey);
      return {
        ...notification_type,
        notification_type_id: generateNotificationTypeId(),
        notification_type_notification_category_id: map.get(mappingKey) ?? '',
      };
    }
  );

  const outputCsvPath = path.join(__dirname, 'formatted', `formatted_${filename}.csv`);

  const redefinedHeaders = [...headers, ...appendedColumns].filter(
    (header) => header !== mappingKey
  );
  const csvWriter = createObjectCsvWriter({
    path: outputCsvPath,
    header: redefinedHeaders.map((header) => ({
      id: header,
      title: header,
    })),
  });

  await csvWriter.writeRecords(formattedDataObj);

  console.log('CSV written to:', outputCsvPath);
  console.log();
  console.log('Total rows: ', formattedDataObj.length);
  console.log();
  console.log(formattedDataObj.slice(0, PREVIEW_ITEMS_NUMBER));
  console.log();
}

main();
