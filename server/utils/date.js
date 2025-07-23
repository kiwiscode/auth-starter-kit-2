const fiveMinutesAgo = () => new Date(Date.now() - 5 * 60 * 1000);

const tenSecondsFromNow = () => new Date(Date.now() + 10 * 1000);

const twentySecondsFromNow = () => new Date(Date.now() + 20 * 1000);

const oneMinuteFromNow = () => new Date(Date.now() + 1 * 60 * 1000);

const fifteenMinutesFromNow = () => new Date(Date.now() + 15 * 60 * 1000);

const oneHourFromNow = () => new Date(Date.now() + 60 * 60 * 1000);

const sevenDaysFromNow = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const thirtyDaysFromNow = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

const oneYearFromNow = () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

const FIFTEEN_SECONDS_MS = 15 * 1000;

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

module.exports = {
  fiveMinutesAgo,
  tenSecondsFromNow,
  twentySecondsFromNow,
  oneMinuteFromNow,
  fifteenMinutesFromNow,
  oneHourFromNow,
  sevenDaysFromNow,
  thirtyDaysFromNow,
  oneYearFromNow,
  FIFTEEN_SECONDS_MS,
  FIFTEEN_MINUTES_MS,
  ONE_DAY_MS,
};
