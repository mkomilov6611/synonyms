module.exports = function (chunksMap) {
  let allChunksResults = [];

  for (let [synonymsArray, queriesArray] of chunksMap) {
    allChunksResults = [
      ...allChunksResults,
      ...markSynonyms(synonymsArray, queriesArray),
    ];
  }

  return allChunksResults.join("\r\n").trim();
};

const synonymsMap = new Map();
let checkedMap = new Map();

function markSynonyms(synonymsArray, queriesArray) {
  checkedMap = new Map(); // reset the checked map for the new chunk

  const assumptions = [];
  const assumptionTypes = {
    SYNONYMS: "synonyms",
    DIFFERENT: "different",
  };

  // Fill the map(dictionary)
  synonymsArray.forEach((synonymText) => {
    const [left, right] = getNormalizedText(synonymText);

    const adjacencyList = Array.isArray(synonymsMap.get(left))
      ? synonymsMap.get(left)
      : [];

    // pipeline of optimizations during setting the dictionary
    if (left === right) {
      return;
    }

    if (synonymsMap.get(right)) {
      if (synonymsMap.get(right).includes(left)) {
        return;
      }
    }

    adjacencyList.push(right);

    return synonymsMap.set(left, adjacencyList);
  });

  // Search from the map
  queriesArray.forEach((queriesText) => {
    const [left, right] = getNormalizedText(queriesText);

    if (checkQueries(left, right)) {
      return assumptions.push(assumptionTypes.SYNONYMS);
    }

    return assumptions.push(assumptionTypes.DIFFERENT);
  });

  return assumptions;
}

function checkQueries(left, right) {
  if (left.toLowerCase() === right.toLowerCase()) {
    return true;
  }

  return (
    checkAllAdjacents(left, right, true) ||
    checkAllAdjacents(left, right, false)
  );
}

function checkAllAdjacents(left, right, ofLeft) {
  let tempLeft = null;
  let tempRight = null;

  if (ofLeft) {
    tempLeft = left;
    tempRight = right;
  } else {
    // also check the adjacents of right
    tempLeft = right;
    tempRight = left;
  }

  const adjacencyListOfLeft = synonymsMap.get(tempLeft);
  if (adjacencyListOfLeft) {
    // direct synonym
    if (adjacencyListOfLeft.includes(tempRight)) {
      return true;
    }

    const checkedList = checkedMap.get(tempLeft) || [];
    checkedList.push(tempRight);

    checkedMap.set(tempLeft, checkedList);

    // indirect synonym
    return adjacencyListOfLeft.some((probableSynonym) => {
      if (checkedMap.get(tempLeft).includes(tempRight)) {
        // already checked
        return;
      }

      return checkQueries(probableSynonym, tempRight);
    });
  }

  return false;
}

function getNormalizedText(text) {
  const normalizedSynonymLeft = text.split(" ")[0].toLowerCase();
  const normalizedSynonymRight = text.split(" ")[1].toLowerCase();

  return [normalizedSynonymLeft, normalizedSynonymRight];
}
