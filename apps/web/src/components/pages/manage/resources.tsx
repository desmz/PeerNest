import type { ReactNode } from 'react';

import { ActionIcon, Box, Button, Divider, Group, Paper, Tabs, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

const PAGE_PADDING_Y = 24;
const CONTENT_MAX_WIDTH = 760;

type TChipItem = { label: string };

function ChipRow({ items, showPlus = false }: { items: TChipItem[]; showPlus?: boolean }) {
  return (
    <Group gap={8} wrap='wrap'>
      {items.map((x) => (
        <Button
          key={x.label}
          variant='light'
          color='gray.6'
          radius='sm'
          size='xs'
          styles={{
            root: { height: 24, paddingLeft: 10, paddingRight: 10, fontWeight: 600 },
            label: { fontSize: 11 },
          }}>
          {x.label}
        </Button>
      ))}

      {showPlus ? (
        <ActionIcon
          variant='light'
          color='gray.6'
          radius='sm'
          size={24}
          styles={{ root: { minWidth: 28 } }}>
          <IconPlus size={14} />
        </ActionIcon>
      ) : null}
    </Group>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text fw={700} size='sm' mt={2} mb={10}>
      {children}
    </Text>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return (
    <Text fw={700} size='xs' mt={12} mb={8} c='black'>
      {children}
    </Text>
  );
}

function PillRow({
  items,
  color,
  showPlus = true,
}: {
  items: TChipItem[];
  color: 'green' | 'blue';
  showPlus?: boolean;
}) {
  return (
    <Group gap={10} wrap='wrap'>
      {items.map((x) => (
        <Button
          key={x.label}
          radius='xl'
          size='xs'
          color={color}
          styles={{
            root: { height: 26, paddingLeft: 12, paddingRight: 12, fontWeight: 700 },
            label: { fontSize: 11 },
          }}>
          {x.label}
        </Button>
      ))}

      {showPlus ? (
        <ActionIcon
          variant='light'
          color='gray'
          radius='sm'
          size={26}
          styles={{ root: { background: '#f1f3f5' } }}>
          <IconPlus size={14} />
        </ActionIcon>
      ) : null}
    </Group>
  );
}

export default function ResourcePage() {
  const feelingsRow1: TChipItem[] = [
    { label: 'Unsured' },
    { label: 'Happy' },
    { label: 'Grateful' },
    { label: 'Confident' },
    { label: 'Optimistic' },
    { label: 'Super' },
    { label: 'Loved' },
    { label: 'Hopeful' },
    { label: 'Meh' },
    { label: 'Anxious' },
  ];

  const feelingsRow2: TChipItem[] = [
    { label: 'Awful' },
    { label: 'Sick' },
    { label: 'Upset' },
    { label: 'Scared' },
    { label: 'Excited' },
    { label: 'Afraid' },
    { label: 'Guilty' },
    { label: 'Lonely' },
    { label: 'Angry' },
  ];

  const symptomsMental: TChipItem[] = [
    { label: 'Anxiety' },
    { label: 'Depression' },
    { label: 'Dissociation' },
    { label: 'Irritability' },
    { label: 'Mood swings' },
    { label: 'Sense of dread' },
  ];

  const symptomsCognitive: TChipItem[] = [
    { label: 'Difficulty concentrating' },
    { label: 'Brain fog' },
    { label: 'Forgetfulness' },
    { label: 'Pessimism' },
    { label: 'Racing thoughts' },
    { label: 'Heartburn' },
  ];

  const symptomsDigestive: TChipItem[] = [
    { label: 'Indigestion' },
    { label: 'Nausea' },
    { label: 'Stomach cramps' },
    { label: 'Acid reflux' },
    { label: 'Bloating' },
    { label: 'Abdominal pain' },
  ];

  const symptomsPain: TChipItem[] = [
    { label: 'Arthritis' },
    { label: 'Back (lower) pain' },
    { label: 'Back (upper) pain' },
    { label: 'Chest pain' },
    { label: 'Eye pain' },
    { label: 'Generalized pain' },
  ];

  const symptomsOther: TChipItem[] = [
    { label: 'Dizziness' },
    { label: 'Dry Mouth' },
    { label: 'High blood pressure' },
    { label: 'Seizure' },
    { label: 'Night sweats' },
    { label: 'Heart palpitations' },
  ];

  const factorsLifestyle: TChipItem[] = [
    { label: 'Alcohol' },
    { label: 'Caffeine' },
    { label: 'Stress' },
    { label: 'Air travel' },
    { label: 'Social media' },
    { label: 'Time outside' },
  ];

  const factorsWork: TChipItem[] = [
    { label: 'Video calls' },
    { label: 'Commute to work' },
    { label: 'Night shift' },
    { label: 'On-call shift' },
    { label: 'Work late' },
  ];

  const factorsBehavior: TChipItem[] = [
    { label: 'Ruminating past events' },
    { label: 'Overthinking future events' },
    { label: 'Overly self-critical' },
    { label: 'Needing constant distractions' },
    { label: 'Procrastination' },
    { label: 'Oversensitivity' },
  ];

  const factorsSocial: TChipItem[] = [
    { label: 'Family' },
    { label: 'Friends' },
    { label: 'Partner' },
    { label: 'Co-workers' },
  ];

  const factorsCare: TChipItem[] = [
    { label: 'Make my bed' },
    { label: 'Brush teeth' },
    { label: 'Take a shower' },
    { label: 'Floss teeth' },
    { label: 'Have a bath' },
    { label: 'Moisturize' },
  ];

  const sleepFactors: TChipItem[] = [
    { label: 'Blue light blocking glasses' },
    { label: 'Device in bed' },
    { label: 'Early bedtime' },
    { label: 'Late bedtime' },
    { label: 'Cat in bedroom' },
    { label: 'Ear plugs' },
  ];

  // Forum Discussions (Interests / Goals)
  const interests: TChipItem[] = [
    { label: 'Home Improvement' },
    { label: 'Acroyoga' },
    { label: 'Baking' },
    { label: 'Chess' },
    { label: 'CrossFit' },
    { label: 'Drawing' },
    { label: 'Flower Arranging' },
    { label: 'Golf' },
    { label: 'Jogging' },
    { label: 'Singing' },
    { label: 'Yoga' },
    { label: 'Reading' },
    { label: 'Ukulele' },
    { label: 'Sculpting' },
  ];

  const goals: TChipItem[] = [
    { label: "Master's Foundation" },
    { label: 'Grade Booster' },
    { label: 'Study Squad Captain' },
    { label: 'Bookworm Challenge' },
    { label: 'Conference Presenter' },
    { label: 'Interview Master' },
    { label: 'Skill-Up Scholar' },
    { label: 'Mentee Match' },
    { label: 'Event Organizer' },
    { label: 'Blood Donor' },
    { label: 'Club Founder' },
    { label: 'Stage Star' },
    { label: 'Web Designer' },
  ];

  return (
    <Box py={PAGE_PADDING_Y} style={{ width: '100%', textAlign: 'left' }}>
      <Tabs defaultValue='mood' keepMounted={false} style={{ width: '100%' }}>
        {/* Tabs header strip (full width), but the tabs themselves are left-aligned */}
        <Box style={{ width: '100%', borderBottom: '1px solid #e9ecef' }}>
          <Box px={24}>
            {/* px={24} should match your AppShell.Main padding */}
            <Tabs.List style={{ justifyContent: 'flex-start', gap: 24 }}>
              <Tabs.Tab value='forum'>Forum Discussions</Tabs.Tab>
              <Tabs.Tab value='mood'>Mood &amp; Wellness</Tabs.Tab>
            </Tabs.List>
          </Box>
        </Box>

        {/* MOOD */}
        <Tabs.Panel value='mood'>
          <Box maw={CONTENT_MAX_WIDTH} mx='auto' mt={16}>
            <Paper radius='md' p={24}>
              <SectionTitle>Add feelings</SectionTitle>
              <ChipRow items={feelingsRow1} />
              <Box mt={8}>
                <ChipRow items={feelingsRow2} showPlus />
              </Box>

              <Divider my={16} />

              <SectionTitle>Add symptoms</SectionTitle>
              <SubTitle>Mental</SubTitle>
              <ChipRow items={symptomsMental} />
              <SubTitle>Cognitive</SubTitle>
              <ChipRow items={symptomsCognitive} showPlus />
              <SubTitle>Digestive</SubTitle>
              <ChipRow items={symptomsDigestive} showPlus />
              <SubTitle>Physical pain</SubTitle>
              <ChipRow items={symptomsPain} showPlus />
              <SubTitle>Physical other</SubTitle>
              <ChipRow items={symptomsOther} showPlus />

              <Divider my={16} />

              <SectionTitle>Add factors</SectionTitle>
              <SubTitle>Lifestyle</SubTitle>
              <ChipRow items={factorsLifestyle} showPlus />
              <SubTitle>Work</SubTitle>
              <ChipRow items={factorsWork} />
              <SubTitle>Behavioral pattern</SubTitle>
              <ChipRow items={factorsBehavior} showPlus />
              <SubTitle>Social</SubTitle>
              <ChipRow items={factorsSocial} />
              <SubTitle>Personal care</SubTitle>
              <ChipRow items={factorsCare} showPlus />

              <Divider my={16} />

              <SectionTitle>Sleep (last night)</SectionTitle>
              <SubTitle>Sleep factors</SubTitle>
              <ChipRow items={sleepFactors} showPlus />
            </Paper>
          </Box>
        </Tabs.Panel>

        {/* FORUM */}
        <Tabs.Panel value='forum'>
          <Box maw={CONTENT_MAX_WIDTH} mx='auto' mt={16}>
            <Paper radius='md' p={24}>
              <SectionTitle>Interests</SectionTitle>
              <PillRow items={interests} color='green' showPlus />

              <Box mt={18}>
                <SectionTitle>Goals</SectionTitle>
                <PillRow items={goals} color='blue' showPlus />
              </Box>
            </Paper>
          </Box>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
