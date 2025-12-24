import { createTheme, MantineColorsTuple } from '@mantine/core';

const rating: MantineColorsTuple = [
  '#c92a2a', // var(--mantine-color-red-9)
  '#f03e3e', // var(--mantine-color-red-7)
  '#ff6b6b', // var(--mantine-color-red-5)
  '#fd7e14', // var(--mantine-color-orange-6)
  '#fab005', // var(--mantine-color-yellow-6)
  '#94d82d', // var(--mantine-color-lime-5)
  '#82c91e', // var(--mantine-color-lime-6)
  '#40c057', // var(--mantine-color-green-6)
  '#37b24d', // var(--mantine-color-green-7)
  '#2b8a3e', // var(--mantine-color-green-9)
];

export const theme = createTheme({
  colors: {
    rating,
  },
});
