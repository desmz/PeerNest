export const MIN_CHECK_IN_MOOD_RATING = 1;
export const MAX_CHECK_IN_MOOD_RATING = 10;

export const MIN_CHECK_IN_SLEEP_QUALITY_RATING = 1;
export const MAX_CHECK_IN_SLEEP_QUALITY_RATING = 5;

export enum WellnessCheckInsSortOption {
  Oldest = 'oldest',
  Newest = 'newest',
}

export const WELLNESS_MOODS_SUMMARY_DEFAULT_DAYS = 30;
export const WELLNESS_SYMPTOMS_SUMMARY_DEFAULT_DAYS = 30;
export const WELLNESS_FACTORS_SUMMARY_DEFAULT_DAYS = 30;

export enum WellnessTrendsMetric {
  MoodRating = 'moodRating',
  SleepQualityRating = 'sleepQualityRating',
  HeartRate = 'heartRate',
  StepCount = 'stepCount',
  Weight = 'weight',
}

export const wellnessTrendsDefaultDays: Record<WellnessTrendsMetric, number> = {
  [WellnessTrendsMetric.MoodRating]: 30,
  [WellnessTrendsMetric.SleepQualityRating]: 30,
  [WellnessTrendsMetric.HeartRate]: 30,
  [WellnessTrendsMetric.StepCount]: 30,
  [WellnessTrendsMetric.Weight]: 30,
} as const;

export enum WellnessOverviewMetric {
  MoodRating = 'moodRating',
  SleepTime = 'sleepTime',
  SleepQualityRating = 'sleepQualityRating',
}

export enum WellnessOverviewTrend {
  Up = 'up',
  Down = 'down',
  Neutral = 'neutral',
}

export const WELLNESS_OVERVIEW_DEFAULT_DAYS = 30;
