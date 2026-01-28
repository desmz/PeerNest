import { Box, Flex, Text } from '@mantine/core';
import { GET_MY_PERCHER_URL, type TGetMyPerchersVo } from '@peernest/contract';
import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api-client';

import classes from './counselorManagePage.module.css';
import PercherCard from './percherCard';

async function getPerchers() {
  return api.get<TGetMyPerchersVo>(GET_MY_PERCHER_URL);
}

export default function CounselorMangePage() {
  const query = useQuery({
    queryKey: ['perchers'],
    queryFn: async () => {
      const res = await getPerchers();
      return res.data;
    },
  });

  if (query.isPending) return <Text>Loading…</Text>;

  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : String(query.error);
    return <Text c='red'>An error has occurred: {msg}</Text>;
  }

  const perchers = query.data.counselorUsers;

  return (
    <Box className={classes.page}>
      <Flex gap='sm' direction={'column'}>
        {perchers.map((percher) => (
          <PercherCard percher={percher} />
        ))}
      </Flex>
    </Box>
  );
}
