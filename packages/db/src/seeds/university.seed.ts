import path from 'path';

import { generateUniversityId } from '@peernest/core/utils/id-generator';
import axios from 'axios';
import { createObjectCsvWriter } from 'csv-writer';

const PREVIEW_ITEMS_NUMBER = 10;

async function main() {
  const fileUrl =
    'https://raw.githubusercontent.com/Hipo/university-domains-list/refs/heads/master/world_universities_and_domains.json';

  console.log('Getting file from :' + fileUrl);
  console.log();

  const res = await axios.get(fileUrl);

  if (!res.data) {
    console.error('failed to fetch the data from ', fileUrl);
    return;
  }

  const headers = ['university_id', 'university_name', 'university_country'];

  // get the first 10 items
  const dataObj = res.data;
  console.log(dataObj.slice(0, PREVIEW_ITEMS_NUMBER));
  console.log();

  const idSet = new Set();

  // @ts-ignore
  const formattedDataObj = dataObj.map((university) => {
    let id = generateUniversityId();
    while (idSet.has(id)) {
      id = generateUniversityId();
    }

    return {
      university_id: id,
      university_name: university?.name ?? '',
      university_country: university?.country ?? '',
    };
  });

  const filename = 'university';
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
  console.log();
  console.log('Total rows: ', formattedDataObj.length);
  console.log();
  console.log(formattedDataObj.slice(0, PREVIEW_ITEMS_NUMBER));
  console.log();
}

main();
