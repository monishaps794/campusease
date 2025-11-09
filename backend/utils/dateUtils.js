export const getDayNameFromDate = (isoDate) => {
  const days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  const d = new Date(isoDate);
  return days[d.getDay()];
};
