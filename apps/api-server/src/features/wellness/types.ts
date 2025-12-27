import {
  TWellnessFactor,
  TWellnessFactorCategory,
  TWellnessSymptom,
  TWellnessSymptomCategory,
} from '@peernest/contract';

export type TWellnessSymptomWithCategory = TWellnessSymptom & {
  wellnessSymptomCategory: TWellnessSymptomCategory;
};

export type TWellnessFactorWithCategory = TWellnessFactor & {
  wellnessFactorCategory: TWellnessFactorCategory;
};
