exports.findMatchId = function (...list) {
  const minListIndex = list.reduce((acc, item, index, arr) => {
    if (item.length < arr[acc].length) {
      return index;
    } else {
      return 0;
    }
  }, 0);

  return list[minListIndex].filter((minItem, minIndex) => {
    return list.reduce((acc, item, index, arr) => {
      if (item.includes(minItem)) return acc && true;
      else return acc && false;
    }, true);
  });
};
