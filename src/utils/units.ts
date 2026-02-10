export type TemperatureUnit = 'celsius' | 'fahrenheit';

export const convertTemperature = (value: number, unit: TemperatureUnit): number => {
    if (unit === 'celsius') return Math.round(value);
    // Formula: (C * 9/5) + 32
    return Math.round((value * 9 / 5) + 32);
};

export const getUnitLabel = (unit: TemperatureUnit): string => {
    return unit === 'celsius' ? '°' : '°F';
};
