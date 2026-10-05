export const PROJECT_ENTRIES = [
  { id: 'ascii-vortex', text: 'ASCII Vortex' },
  { id: 'music-player', text: 'Music Player' },
  { id: 'sketch-relay', text: 'Sketch Relay' },
  { id: 'gradient-drift', text: 'Gradient Drift' },
  { id: 'mini-arcade', text: 'Mini Arcade', choiceGroup: 'games' },
  { id: 'fun-project', text: 'Fun Project' },
  { id: 'archive-preview', text: 'Archive Preview', choiceGroup: 'archive', passwordProtected: true },
];

export const PROJECT_CHOICE_GROUPS = {
  games: {
    id: 'games',
    label: 'Mini Arcade',
    title: 'Choose a game',
    description: 'Pick something to play.',
    closeLabel: 'Close game choices',
    choices: [
      { id: 'roulette', number: '1', label: 'Roulette', projectId: 'roulette' },
      { id: 'racing', number: '2', label: 'One Lap', projectId: 'racing' },
      { id: 'card-game', number: '3', label: 'Card Game', comingSoon: true },
    ],
  },
  archive: {
    id: 'archive',
    label: 'Access granted',
    title: 'Choose an archive preview',
    description: 'Select the version you want to explore.',
    closeLabel: 'Close archive choices',
    choices: [
      { id: 'mobile-preview', number: '1', label: 'Mobile preview', projectId: 'mobile-preview' },
      { id: 'website-archive', number: '2', label: 'Website archive', projectId: 'website-archive' },
      { id: 'website-update', number: '3', label: 'Website update', comingSoon: true },
    ],
  },
};

export function getProjectSelection(projectId) {
  const entry = PROJECT_ENTRIES.find(project => project.id === projectId);
  if (!entry) return null;
  if (entry.choiceGroup) return { kind: entry.passwordProtected ? 'password' : 'selector', group: entry.choiceGroup };
  return { kind: 'project', projectId: entry.id };
}

export function getAvailableProjectChoice(groupId, choiceId) {
  const choice = PROJECT_CHOICE_GROUPS[groupId]?.choices.find(option => option.id === choiceId);
  return choice && !choice.comingSoon ? choice.projectId || null : null;
}
