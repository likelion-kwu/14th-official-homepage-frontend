export const TEAMS = [
  { name: "HEY야호", color: "#FFE066" },
  { name: "갓생사자", color: "#FFBA8F" },
  { name: "북부대공예티", color: "#C9D9FF" },
  { name: "아크크", color: "#D5EDB4" },
];

export function getTeamByName(name) {
  return TEAMS.find((t) => t.name === name);
}
