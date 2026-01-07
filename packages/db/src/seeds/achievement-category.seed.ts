import path from 'path';

import { generateAchievementCategoryId } from '@peernest/core/utils/id-generator';
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
  // const mappingKey = 'wellness_factor_category_name';

  const headers = ['achievement_category_id', 'achievement_category_name'];
  const filename = 'achievement_category_dataset';
  const achievementCategoryObj = await getDataFromCsv(filename, headers);

  // const achievementCategoryCategoryObj = await getDataFromCsv(
  //   'formatted_wellness_factor_category_dataset',
  //   ['wellness_factor_category_id', mappingKey],
  //   true
  // );

  // const map = new Map<string, string>(
  //   achievementCategoryCategoryObj.map(
  //     ({ wellness_factor_category_name, wellness_factor_category_id }) => [
  //       wellness_factor_category_name,
  //       wellness_factor_category_id,
  //     ]
  //   )
  // );

  const appendedColumns = ['achievement_category_position'];

  const formattedDataObj = achievementCategoryObj.map((achievementCategory, idx) => {
    return {
      ...achievementCategory,
      achievement_category_id: generateAchievementCategoryId(),
      achievement_category_position: idx,
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
