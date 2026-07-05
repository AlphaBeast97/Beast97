export const history = (userMsg, aiResponse, his) => {
  his.push({ userMsg, aiResponse });
  return his;
};
