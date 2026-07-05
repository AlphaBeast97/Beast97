export interface HistoryEntry {
  userMsg: string;
  aiResponse: string;
}

export const history = (
  userMsg: string,
  aiResponse: string,
  his: HistoryEntry[],
): HistoryEntry[] => {
  his.push({ userMsg, aiResponse });
  return his;
};
