export const RACE_LABELS: Record<string, string> = {
  BEAST: '야수',
  MECHANICAL: '기계',
  UNDEAD: '언데드',
  DRAGON: '용족',
  PIRATE: '해적',
  DEMON: '악마',
  MURLOC: '머쿨',
  QUILBOAR: '멧돼지수인',
  ELEMENTAL: '정령',
  NAGA: '나가',
  ABERRATION: '돌연변이',
  ALL: '모든 종족',
}

export const RACE_ORDER = Object.keys(RACE_LABELS)

export function raceLabel(race: string) {
  return RACE_LABELS[race] ?? race
}
