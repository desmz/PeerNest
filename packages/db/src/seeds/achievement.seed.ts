/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs';
import path from 'path';
import { exit } from 'process';

import { generateAchievementId } from '@peernest/core/utils/id-generator';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csvtojson';

const PREVIEW_ITEMS_NUMBER = 10;

function getDataFromJson(): unknown[] {
  let criteriaObj;
  try {
    criteriaObj = fs.readFileSync(
      path.join(__dirname, 'json', 'achievement-criteria.json'),
      'utf8'
    );
  } catch (error) {
    console.error('Failed to read the json file');
    console.error(error);
    exit(1);
  }

  console.log(criteriaObj);

  return JSON.parse(criteriaObj);
}

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
  const mappingKey = 'achievement_category_name';

  const headers = [
    'achievement_id',
    'achievement_title',
    'achievement_description',
    mappingKey,
    'achievement_type',
    'achievement_is_active',
  ];
  const filename = 'achievement_dataset';
  const achievementObj = await getDataFromCsv(filename, headers);

  const achievementCategoryObj = await getDataFromCsv(
    'formatted_achievement_category_dataset',
    ['achievement_category_id', mappingKey],
    true
  );

  // mapping
  const map = new Map<string, string>(
    achievementCategoryObj.map(({ achievement_category_name, achievement_category_id }) => [
      achievement_category_name,
      achievement_category_id,
    ])
  );

  // read json
  const criteriaObj = getDataFromJson() as Array<{ title: string; otherCriteria: unknown }>;

  const criteriaMap = new Map<string, unknown>(
    criteriaObj.map(({ title, ...otherCriteria }) => [title, otherCriteria])
  );
  const appendedColumns = [
    'achievement_achievement_category_id',
    'achievement_criteria',
    'achievement_position',
  ];

  // formatting
  const formattedDataObj = achievementObj.map(
    (
      {
        achievement_category_name: mappingKey,
        achievement_title: criteriaMappingKey,
        achievement_is_active,
        ...otherAchievement
      },
      idx
    ) => {
      console.log(criteriaMappingKey);
      return {
        ...otherAchievement,
        achievement_id: generateAchievementId(),
        achievement_title: criteriaMappingKey,
        achievement_is_active: achievement_is_active === 'TRUE',
        achievement_achievement_category_id: map.get(mappingKey) ?? '',
        achievement_criteria: JSON.stringify(criteriaMap.get(criteriaMappingKey)) ?? null,
        achievement_position: idx,
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
