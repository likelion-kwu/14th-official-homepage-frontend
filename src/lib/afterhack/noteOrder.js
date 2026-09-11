// CLAUDE-HANDOFF.md #7: id 기반 seed로 한 번만 섞고(팀별 정렬 금지),
// 실제 배치는 CSS grid에 맡긴다. 회전/수직 편차만 프리셋 배열에서 순환 적용.

function hash(str) {
  let v = 0;
  for (const c of str) v = (v * 31 + c.charCodeAt(0)) >>> 0;
  return (v * 2654435761) >>> 0;
}

export function shuffleById(items) {
  return [...items].sort((a, b) => hash(a.id) - hash(b.id));
}

export const NOTE_ROTATIONS = [-3, 2, -1.5, 3, 1, -2.5, 2, -1];
export const NOTE_OFFSETS = [2, 10, 0, 8, 5, 0, 7, 2];
