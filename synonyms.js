module.exports = function (chunksMap) {
    let allChunksResults = []

    for (let [synonymsArray, queriesArray] of chunksMap) {
        allChunksResults = [allChunksResults, ...markSynonyms(synonymsArray, queriesArray)]
    }

    return allChunksResults.join('\r\n').trim();
}

const synonymsMap = new Map()

function markSynonyms(synonymsArray, queriesArray) {
    const assumptions = []
    const assumptionTypes = {
        SYNONYMS: 'synonyms',
        DIFFERENT: 'different'
    }

    synonymsArray.forEach(synonymText => {
        const [left, right] = getNormalizedText(synonymText)
        synonymsMap.set(left, right)
    });


    queriesArray.forEach(queriesText => {
        const [left, right] = getNormalizedText(queriesText)

        if (checkQueries(left, right)) {
            return assumptions.push(assumptionTypes.SYNONYMS)
        }

        return assumptions.push(assumptionTypes.DIFFERENT)
    })

    return assumptions
}

function checkQueries(left, right) {
    if ((left.toLowerCase() === right.toLowerCase()) ||
        (synonymsMap.get(left) === right) ||
        (synonymsMap.get(right) === left)) {

        return true
    }

    if (synonymsMap.get(left)) {
        return checkQueries(synonymsMap.get(left), right)
    }

    return false
}


function getNormalizedText(text) {
    const normalizedSynonymLeft = text.split(' ')[0].toLowerCase()
    const normalizedSynonymRight = text.split(' ')[1].toLowerCase()

    return [normalizedSynonymLeft, normalizedSynonymRight]
}