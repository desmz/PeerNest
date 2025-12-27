import {
  TWellnessFactor,
  TWellnessFactorCategory,
  TWellnessSymptom,
  TWellnessSymptomCategory,
} from '@peernest/contract';
import {
  TSelectableCheckIn,
  TSelectableCheckInWellnessFactor,
  TSelectableCheckInWellnessMood,
  TSelectableCheckInWellnessSymptom,
  TSelectableWellnessFactor,
  TSelectableWellnessFactorCategory,
  TSelectableWellnessMood,
  TSelectableWellnessSymptom,
  TSelectableWellnessSymptomCategory,
} from '@peernest/db';

export type TSelectableCheckInWithSleepTimeString = TSelectableCheckIn & {
  checkInSleepTime: string | null;
};

export type TWellnessSymptomWithCategory = TWellnessSymptom & {
  wellnessSymptomCategory: TWellnessSymptomCategory;
};

export type TWellnessFactorWithCategory = TWellnessFactor & {
  wellnessFactorCategory: TWellnessFactorCategory;
};

export type TSelectableWellnessMoodWithCheckInId = TSelectableWellnessMood &
  Pick<TSelectableCheckInWellnessMood, 'checkInWellnessMoodCheckInId'>;

export type TSelectableWellnessSymptomWithCheckInId = TSelectableWellnessSymptom &
  TSelectableWellnessSymptomCategory &
  Pick<TSelectableCheckInWellnessSymptom, 'checkInWellnessSymptomCheckInId'>;

export type TSelectableWellnessFactorWithCheckInId = TSelectableWellnessFactor &
  TSelectableWellnessFactorCategory &
  Pick<TSelectableCheckInWellnessFactor, 'checkInWellnessFactorCheckInId'>;

export type TTrendQueryFn = (args: {
  userId: string;
  from: Date;
  to: Date;
}) => Promise<{ checkInCheckInTime: Date; value: number }[]>;
