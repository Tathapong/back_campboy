// If array, Is each of value (in array) number?
exports.isEachNumber = (arr) => {
  if (Array.isArray(arr)) return arr.reduce((acc, item) => !isNaN(+item) && acc, true);
  else return true;
};

// If array, Is each of value (in array) in range of List?
exports.isEachInRange = (arr, rangeList) => {
  if (Array.isArray(arr)) return arr.reduce((acc, item) => rangeList.includes(+item) && acc, true);
  else return true;
};

exports.isNumericString = (input) => {
  if (typeof input === "string") return !isNaN(+input);
  else return true;
};

exports.isInRange = (str, rangeList) => {
  if (typeof str === "string") return rangeList.includes(+str);
  else return true;
};
