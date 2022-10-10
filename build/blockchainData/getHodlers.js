const fs = require('fs');
const https = require('https');
const fetch = require('node-fetch');
const algosdk = require('algosdk');
const CUSTOM_HODLERS = require('./hodlersCustom.json');


const algodClient = new algosdk.Algodv2('', 'https://node.algoexplorerapi.io/', 443);
const OUT_FILE_PATH = 'src/_data/hodlers.json'
const PUBLIC_PATH = 'public'
const IMAGE_PATH = 'assets/hodlers'
const STUPID_ADDRESS = "KKBVJLXALCENRXQNEZC44F4NQWGIEFKKIHLDQNBGDHIM73F44LAN7IAE5Q";
const indexerClient = new algosdk.Indexer('', 'https://algoindexer.algoexplorerapi.io/', 443);


let hodlers = {};
let parsedHodlers = [];

async function main() {
    const healtState = await indexerClient.makeHealthCheck().do();
    const accountInfo = await algodClient.accountInformation(STUPID_ADDRESS).do();
    const createdAssets = accountInfo['created-assets'];

    for (let asset of createdAssets) {
        const assetId = asset['index'];

        const assetInfo = await indexerClient.lookupAssetBalances(assetId).do();
        const hodlerPublicKey = assetInfo.balances.filter(balance => balance.amount > 0)[0].address;

        hodlers[hodlerPublicKey] = hodlers[hodlerPublicKey] || 0;
        hodlers[hodlerPublicKey] += 1;
    }

    for (publicKey of Object.keys(hodlers)) {
        console.log(publicKey)
        if (publicKey == STUPID_ADDRESS) continue;

        const parsedHodler = {
            publicKey: publicKey,
            hodleCount: hodlers[publicKey],
            name: null,
            profileImage: null,
            homepage: null
        }

        const nfdData = await getNfdData(publicKey);
        const customData = CUSTOM_HODLERS.filter(hodler => hodler.publicKey == publicKey)[0];

        if (nfdData != null) {
            parsedHodler.name = nfdData.name;
            parsedHodler.homepage = `https://app.nf.domains/name/${nfdData.name}`;
            parsedHodler.profileImage = await getNfdImage(nfdData);
        } else if (customData) {
            console.log(customData)
            parsedHodler.name = customData.name;
            parsedHodler.homepage = customData.homepage;
            parsedHodler.profileImage = customData.logoLocal;
        } else {
            continue;
        }
        parsedHodlers.push(parsedHodler);
    }

    fs.writeFile(OUT_FILE_PATH, JSON.stringify(parsedHodlers), 'utf8', error => console.error(error));


}

async function getNfdData(publicKey) {

    const response = await fetch(`https://api.nf.domains/nfd/address?address=${publicKey}&limit=1&view=thumbnail`);

    if (response.status == 200) {
        const data = await response.text();
        return JSON.parse(data)[0];
    } else {
        return null
    }
}

async function getNfdImage(nfdData) {
    let imageUrl = null;
    const imageFileName = `${nfdData.name.replace('.','_')}.png`

    if (nfdData.properties.verified && nfdData.properties.verified.avatar) {
        imageUrl = nfdData.properties.verified.avatar;
    }

    if (nfdData.properties.userDefined && nfdData.properties.userDefined.avatar) {
        imageUrl = nfdData.properties.userDefined.avatar
    }

    if (!imageUrl) return '';

    imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');

    //const response = await fetch(imageUrl);

    //if(response.status == 200) {
        //Download image
        //await response.body.pipe(fs.createWriteStream(`${PUBLIC_PATH}/${IMAGE_PATH}/${imageFileName}`))
    //}

    return `/${IMAGE_PATH}/${imageFileName}`;
}




main();