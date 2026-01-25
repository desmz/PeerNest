import { Flex, Kbd, MultiSelect, TextInput } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { spotlight, Spotlight } from '@mantine/spotlight';
import {
  GET_INTERESTS_URL,
  GET_PERSONAL_GOALS_URL,
  TFindUsersQueryParams,
  TGetInterestsVo,
  TGetPersonalGoalsVo,
} from '@peernest/contract';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router';

import { buildUserSpotlightActions } from '@/features/spotlight/build-user-actions';
import { usersFilterAtom } from '@/features/user/atoms/users-filter.atom';
import { useFindUsersForSpotlight } from '@/features/user/hooks/use-find-users';
import api from '@/lib/api-client';

import classes from './appShellHeaderPeerMatching.module.css';

export async function getPersonalGoals() {
  return await api.get<TGetPersonalGoalsVo>(GET_PERSONAL_GOALS_URL);
}

export async function getInterests() {
  return await api.get<TGetInterestsVo>(GET_INTERESTS_URL);
}

export default function AppShellHeaderPeerMatching() {
  const navigate = useNavigate();
  const usersQueryForSpotlight = useFindUsersForSpotlight();
  const [findUsersQueryParams, setFindUsersQueryParams] =
    useAtom<TFindUsersQueryParams>(usersFilterAtom);

  const { data: personalGoalsData } = useQuery({
    queryKey: ['personalGoals'],
    queryFn: async () => {
      return (await getPersonalGoals()).data;
    },
  });
  const { data: interestsData } = useQuery({
    queryKey: ['interests'],
    queryFn: async () => {
      return (await getInterests()).data;
    },
  });

  const personalGoalOptions = personalGoalsData?.map((goal) => ({
    label: goal.personalGoalTitle,
    value: goal.personalGoalId,
  }));

  const interestOptions = interestsData?.map((interest) => ({
    label: interest.interestName,
    value: interest.interestId,
  }));

  useHotkeys([
    ['mod+K', () => spotlight.open()],
    ['Escape', () => spotlight.close()],
  ]);

  const spotlightActions = buildUserSpotlightActions(
    usersQueryForSpotlight.data?.users ?? [],
    navigate
  );

  return (
    <Flex justify={'space-between'} w={'100%'}>
      <Flex gap={16}>
        <MultiSelect
          placeholder='Interests'
          data={interestOptions ?? []}
          rightSection={<IconChevronDown size={16} />}
          rightSectionPointerEvents='none'
          className={classes.selectOneChevron}
          multiple
          searchable
          value={findUsersQueryParams.interestIds ?? []}
          onChange={(values) =>
            setFindUsersQueryParams((prev: TFindUsersQueryParams) => ({
              ...prev,
              interestIds: values?.length ? values : undefined,
            }))
          }
        />
        <MultiSelect
          placeholder='Goals'
          data={personalGoalOptions ?? []}
          rightSection={<IconChevronDown size={16} />}
          rightSectionPointerEvents='none'
          className={classes.selectOneChevron}
          searchable
          value={findUsersQueryParams.goalIds ?? []}
          onChange={(values) =>
            setFindUsersQueryParams((prev: TFindUsersQueryParams) => ({
              ...prev,
              goalIds: values.length ? values : undefined,
            }))
          }
        />
      </Flex>
      <Flex>
        <Spotlight
          actions={spotlightActions}
          nothingFound='No users found...'
          highlightQuery
          closeOnEscape
          closeOnClickOutside
          scrollable
          searchProps={{
            leftSection: <IconSearch size={16} />,
            placeholder: 'Search User',
          }}
          classNames={{
            actionLabel: classes.actionLabel,
          }}
        />
        <TextInput
          className={classes.search}
          leftSection={<IconSearch size={16} />}
          placeholder='Search User'
          w={240}
          rightSectionWidth={90}
          rightSection={
            <Kbd className={classes.kbdSingle}>
              Ctrl <span className={classes.kbdPlus}>+</span> K
            </Kbd>
          }
          readOnly
          onClick={() => spotlight.open()}
          styles={{
            input: { cursor: 'pointer' },
          }}
        />
      </Flex>
    </Flex>
  );
}
