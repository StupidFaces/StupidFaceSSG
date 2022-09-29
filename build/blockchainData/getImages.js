const fs = require('fs');
const https = require('https');
const algosdk = require('algosdk');

const algodClient = new algosdk.Algodv2('', 'https://node.algoexplorerapi.io/', 443);
const imageOutFolder = 'public/assets/faces'
const markdownOutFolder = 'src/faces'
const address = "KKBVJLXALCENRXQNEZC44F4NQWGIEFKKIHLDQNBGDHIM73F44LAN7IAE5Q";
const indexerClient = new algosdk.Indexer('', 'https://algoindexer.algoexplorerapi.io/', 443);


async function main() {
    const healtState = await indexerClient.makeHealthCheck().do();
    const accountInfo = await algodClient.accountInformation(address).do();
    const createdAssets = accountInfo['created-assets'];

    for (let asset of createdAssets) {
        const assetUrl = asset['params']['url'];
        const assetId = asset['index'];
        const assetIpfsHash = assetUrl.split('/').at(-1);
        downloadImage(assetIpfsHash);
        //let assetInfo = await indexerClient.searchForAssets().index(assetId).do();
        //let assetTxs = await indexerClient.lookupAssetTransactions(884254614).do();
        
        await syncMarkdown(assetId, assetIpfsHash);
    }

}

async function syncMarkdown(assetId, assetIpfsHash) {
    const assetInfo = await indexerClient.lookupAssetByID(assetId).do();
    const assetName = assetInfo.asset.params.name;
    const fileName = getFilename(assetName);

    const assetBlock = await indexerClient.lookupBlock(assetInfo['asset']['created-at-round']).do();
    const assetTimestamp = assetBlock['timestamp'];

    const templateData = {
        title: assetName,
        asaId: assetId,
        unit: assetInfo.asset.params['unit-name'],
        ipfs: assetIpfsHash,
        description: assetName,
        date: new Date(assetTimestamp * 1e3).toISOString().split('.')[0] + 'Z'
    }

    const renderedTemplate = render(templateData);
    was= 'was'
    fs.writeFile(`${markdownOutFolder}/${fileName}`, renderedTemplate, (err) => {
        if (err) return console.log(err);
        console.log(`${renderedTemplate} > ${markdownOutFolder}/${fileName}`);
    })
}

function downloadImage(ipfsHash) {
    https.get(`https://ipfs.io/ipfs/${ipfsHash}`, (res) => {
        console.log(res.statusCode);
        if (res.statusCode != 200) {
            console.log(`Retrying: ${ipfsHash}`)
            downloadImage(ipfsHash)
        } else {
            res.pipe(fs.createWriteStream(`${imageOutFolder}/${ipfsHash}`));
        }
    });
}

function getFilename(assetName) {
    return `${assetName.toLowerCase().replaceAll(' ', '-').replace('#','')}.md`;
}

function render (data) {
	return markdownTemplate.replace(/{{(.*?)}}/g, (match) => {
		return data[match.split(/{{|}}/).filter(Boolean)[0]]
	})
}

const markdownTemplate = `---
title: "{{title}}"
asaId: {{asaId}}
unit: "{{unit}}"
ipfs: {{ipfs}}
description: "{{description}}"
date: {{date}}
faceOfTheMonth:
---
`


main();