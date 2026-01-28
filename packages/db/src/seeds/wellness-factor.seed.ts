/* eslint-disable @typescript-eslint/naming-convention */
import path from 'path';

import { generateWellnessFactorId } from '@peernest/core/utils/id-generator';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csvtojson';

const PREVIEW_ITEMS_NUMBER = 10;

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
  const mappingKey = 'wellness_factor_category_name';

  const headers = ['wellness_factor_id', 'wellness_factor_name', mappingKey];
  const filename = 'wellness_factor_dataset';
  const wellnessFactorObj = await getDataFromCsv(filename, headers);

  const wellnessFactorCategoryObj = await getDataFromCsv(
    'formatted_wellness_factor_category_dataset',
    ['wellness_factor_category_id', mappingKey],
    true
  );

  const map = new Map<string, string>(
    wellnessFactorCategoryObj.map(
      ({ wellness_factor_category_name, wellness_factor_category_id }) => [
        wellness_factor_category_name,
        wellness_factor_category_id,
      ]
    )
  );

  const appendedColumns = [
    'wellness_factor_position',
    'wellness_factor_wellness_factor_category_id',
  ];

  const formattedDataObj = wellnessFactorObj.map(
    ({ wellness_factor_category_name: mappingKey, ...otherWellnessFactor }, idx) => {
      return {
        ...otherWellnessFactor,
        wellness_factor_id: generateWellnessFactorId(),
        wellness_factor_position: idx,
        wellness_factor_wellness_factor_category_id: map.get(mappingKey) ?? '',
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
