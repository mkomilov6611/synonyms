const fs = require("fs");

(() => {
  fs.readFile("input.txt", "utf8", (err, data) => {
    if (err) {
      return console.error(`Read error: ${err}`);
    }

    const chunksMap = new Map();

    let chunkSynonyms = [];
    let chunkQueries = [];

    let numberOccurence = 0;
    let indexLimitor = null;

    data.split("\r\n").forEach((item, index) => {
      if (index === 0) {
        return; // no logic for first line actually
      }

      const currentItemAsNumber = Number.parseInt(item, 10);
      const areSynonyms = () => numberOccurence % 2 !== 0; // reactive helper

      if (index > indexLimitor && chunkSynonyms.length && chunkQueries.length) {
        chunksMap.set(chunkSynonyms, chunkQueries);
        chunkSynonyms = [];
        chunkQueries = [];
      }

      if (currentItemAsNumber) {
        // its a number, so keep track of that much lines
        numberOccurence++;
        indexLimitor = index + currentItemAsNumber;
        return;
      }

      // now we have string data, that is either part of synonyms or queries
      if (areSynonyms()) {
        return chunkSynonyms.push(item);
      }

      chunkQueries.push(item);
    });

    const resultsText = require("./synonyms")(chunksMap);

    fs.writeFile("output.txt", resultsText, "utf8", (err) => {
      if (err) {
        return console.error(`Write error: ${err}`);
      }

      const resultBuf = fs.readFileSync("output.txt");
      const testBuf = fs.readFileSync("testOutput.txt");

      console.log("Is true", resultBuf.equals(testBuf));
    });
  });
})();
