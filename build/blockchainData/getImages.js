const fs = require('fs');
const https = require('https');
const algosdk = require('algosdk');

const server = 'https://node.algoexplorerapi.io/';
const port   = 443;
const algodClient = new algosdk.Algodv2('', server, port);


async function main() {
    const address = "KKBVJLXALCENRXQNEZC44F4NQWGIEFKKIHLDQNBGDHIM73F44LAN7IAE5Q";
    const accountInfo = await algodClient.accountInformation(address).do();

    const createdAssets = accountInfo['created-assets'];

    for (let asset of createdAssets) {
        const assetUrl = asset['params']['url'];
        const assetIpfsHash = assetUrl.split('/').at(-1);
        const imageOutputPath = `../../public/assets/faces/${assetIpfsHash}`;
        downloadImage(assetIpfsHash, imageOutputPath);

    }

}


function downloadImage(ipfsHash, filepath) {
    https.get(`https://ipfs.io/ipfs/${ipfsHash}`, (res) => {
        console.log(res.statusCode);
        if (res.statusCode != 200) {
            console.log(`Retrying: ${ipfsHash}`)
            downloadImage(ipfsHash, filepath)
        } else {
            res.pipe(fs.createWriteStream(filepath));
        }
    });
}


main();