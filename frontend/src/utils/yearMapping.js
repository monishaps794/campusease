// frontend/src/utils/yearMapping.js
export const mapAcademicYearToTimetableYear = (year) => {
  const n = Number(year);
  switch (n) {
    case 1:
      return 1; // 1st sem
    case 2:
      return 3; // 3rd sem
    case 3:
      return 5; // 5th sem
    case 4:
      return 7; // 7th sem
    default:
      // fallback: if data already uses 3/5/7 directly
      return n || year;
  }
};
