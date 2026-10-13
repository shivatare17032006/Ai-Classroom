const CLASSROOM_COLORS = [
  '#3f6fb5', // classroom blue
  '#4f8068', // classroom green
  '#a47724', // classroom amber
  '#a6524b', // classroom red
  '#5275a6', // clear blue
  '#5f8960', // leaf green
  '#b1842e', // warm yellow
  '#97545c'  // muted red
];

export const getClassroomColor = (classroom) => {
  const identity = String(classroom?.id || classroom?.code || classroom?.name || '');
  const hash = identity.split('').reduce((total, character) => total + character.charCodeAt(0), 0);
  return CLASSROOM_COLORS[hash % CLASSROOM_COLORS.length];
};
