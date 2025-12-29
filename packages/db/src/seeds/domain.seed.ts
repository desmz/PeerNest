import path from 'path';

import { generateDomainId } from '@peernest/core/utils/id-generator';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csvtojson';

async function main() {
  const csvDirPath = path.join(__dirname, 'csv');
  const filename = 'domain_dataset';
  const fileExt = 'csv';
  const csvFilePath = path.join(csvDirPath, `${filename}.${fileExt}`);

  console.log('Getting file from :' + csvFilePath);
  console.log();

  const headers = ['domain_id', 'domain_name'];
  const csvConfig = {
    headers,
    trim: true,
    ignoreEmpty: true,
  };
  const dataObj = await csv(csvConfig).fromFile(csvFilePath);

  console.log(dataObj);
  console.log();

  const formattedDataObj = dataObj.map((domain) => ({
    domain_id: generateDomainId(),
    domain_name: domain.domain_name,
  }));

  const outputCsvPath = path.join(__dirname, 'formatted', `formatted_${filename}.csv`);

  const csvWriter = createObjectCsvWriter({
    path: outputCsvPath,
    header: headers.map((header) => ({
      id: header,
      title: header,
    })),
  });

  await csvWriter.writeRecords(formattedDataObj);

  console.log('CSV written to:', outputCsvPath);
  console.log('Total rows: ', formattedDataObj.length);
  console.log();
}

main();
