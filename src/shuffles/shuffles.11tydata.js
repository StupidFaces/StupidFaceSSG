/* eslint-disable */
const fs = require('fs');



module.exports = {
    eleventyComputed: {
        shuffledParticipants: data => getShuffledArrayByShuffleId(data.id),
        facesToWinLength: data => {
            return data.shuffleFaces.split(',').length;
        },
        hasWinners: data => getShuffledArrayByShuffleId(data.id).length > 0,
        winners: data => {
            const winnersObj = {};
            const shuffledParticipants = getShuffledArrayByShuffleId(data.id);
            const facesToWin = data.shuffleFaces.split(',');
            let index = 0;
            for(let faceToWin of facesToWin) {
                winnersObj[faceToWin] = shuffledParticipants[index] || '';
                index++;
            }
            return winnersObj;
        }
    },
};

function getShuffledArrayByShuffleId(id) {
    let json = [];
    const shuffleFilePath = `${module.path}/shuffleResult-${id}.json`;
    if (fs.existsSync(shuffleFilePath)) {
        const file = fs.readFileSync(shuffleFilePath);
        if (file) {
            json = JSON.parse(file.toString());
        }
    }
    return json;
}
