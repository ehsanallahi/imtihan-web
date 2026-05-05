// Helper to map Flutter values to Prisma Enums
export const mapGrade = (flutterGrade) => {
  const mapping = {
    '9': 'nine',
    '10': 'ten',
    '11': 'eleven',
    '12': 'twelve',
  };
  return mapping[flutterGrade] || null;
};

export const mapBoard = (flutterBoard) => {
  if (!flutterBoard) return null;
  return flutterBoard.toLowerCase();
};

export const mapGradeToFlutter = (prismaGrade) => {
  const mapping = {
    'nine': '9',
    'ten': '10',
    'eleven': '11',
    'twelve': '12',
  };
  return mapping[prismaGrade] || prismaGrade;
};

export const mapBoardToFlutter = (prismaBoard) => {
  if (!prismaBoard) return null;
  return prismaBoard.charAt(0).toUpperCase() + prismaBoard.slice(1);
};

export const mapMedium = (flutterMedium) => {
  if (!flutterMedium) return 'english';
  return flutterMedium.toLowerCase();
};

export const mapMediumToFlutter = (prismaMedium) => {
  if (!prismaMedium) return 'English';
  return prismaMedium.charAt(0).toUpperCase() + prismaMedium.slice(1);
};

