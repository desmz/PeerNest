import path from 'path';

import { generatePersonalGoalId } from '@peernest/core/utils/id-generator';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csvtojson';

const PREVIEW_ITEMS_NUMBER = 10;

async function main() {
  const csvDirPath = path.join(__dirname, 'csv');
  const filename = 'personal_goal_dataset';
  const fileExt = 'csv';
  const csvFilePath = path.join(csvDirPath, `${filename}.${fileExt}`);

  console.log('Getting file from :' + csvFilePath);
  console.log();

  const headers = [
    'personal_goal_id',
    'personal_goal_title',
    'personal_goal_name',
    'personal_goal_description',
  ];
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

  const appendedColumns = ['personal_goal_position'];
  const formattedDataObj = dataObj.map((personalGoal, idx) => {
    const { personal_goal_description: description } = personalGoal;

    const formattedDescription =
      description[description.length - 1] !== '.' ? description + '.' : description;

    return {
      ...personalGoal,
      personal_goal_id: generatePersonalGoalId(),
      personal_goal_description: formattedDescription,
      personal_goal_position: idx,
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
