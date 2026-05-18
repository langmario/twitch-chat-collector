export function getEmotes(text: string, emoteOffsets: Map<string, string[]>) {
  return emoteOffsets
    .entries()
    .map(([id, occurences]) => {
      const [start = 0, end = 0] = occurences[0]!.split('-').map(Number);
      const keyword = text.slice(start, end + 1);
      return {
        id,
        keyword,
        count: occurences.length,
      };
    })
    .toArray();
}

export function getTags(tags: Map<string, string>) {
  return {
    isMod: tags.get('mod') === '1',
    isSub: tags.get('subscriber') === '1',
    isTurbo: tags.get('turbo') === '1',
    isFirst: tags.get('first-msg') === '1',
  };
}
