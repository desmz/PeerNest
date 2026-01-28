import path from 'path';

import { generateWellnessSymptomCategoryId } from '@peernest/core/utils/id-generator';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csvtojson';

const PREVIEW_ITEMS_NUMBER = 10;

async function main() {
  const csvDirPath = path.join(__dirname, 'csv');
  const filename = 'wellness_symptom_category_dataset';
  const fileExt = 'csv';
  const csvFilePath = path.join(csvDirPath, `${filename}.${fileExt}`);

  console.log('Getting file from :' + csvFilePath);
  console.log();

  const headers = ['wellness_symptom_category_id', 'wellness_symptom_category_name'];
  const includeRegex = new RegExp(headers.join('|'));
  const csvConfig = {
    headers,
    trim: true,
    ignoreEmpty: true,
    includeColumns: includeRegex,
  };

  const dataObj = await csv(csvConfig).fromFile(csvFilePath);

  // get the first 10 items
  console.log(dataObj.slice(0, PREVIEW_ITEMS_NUMBER));
  console.log();

  const appendedColumns = ['wellness_symptom_category_position'];
  const formattedDataObj = dataObj.map((wellnessSymptomCategory, idx) => {
    return {
      ...wellnessSymptomCategory,
      wellness_symptom_category_id: generateWellnessSymptomCategoryId(),
      wellness_symptom_category_position: idx,
    };
  });

  const outputCsvPath = path.join(__dirname, 'formatted', `formatted_${filename}.csv`);

  const redefinedHeaders = [...headers, ...appendedColumns];
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
