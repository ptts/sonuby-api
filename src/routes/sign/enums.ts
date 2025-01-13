export const ApiType = {
  MeteoblueDataPackages: 'meteoblue_data_packages',
  MeteoblueWarningsForLocation: 'meteoblue_weather_warnings_for_location',
  MeteoblueWarningsInfo: 'meteoblue_weather_warnings_info',
} as const;
export type ApiType = (typeof ApiType)[keyof typeof ApiType];
