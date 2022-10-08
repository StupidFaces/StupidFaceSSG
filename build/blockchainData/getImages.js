const fs = require('fs');
const https = require('https');
const algosdk = require('algosdk');
const { Pool } = require('pg');
const ADOPTIONS = require('./adoptions');

if (process.env.NODE_ENV == 'development') {
    require("dotenv").config({path: `.${process.env.NODE_ENV}.env`});
}

const pgPool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
})


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

    const faceOfTheMonthDates = await getFaceOfTheMonthDates(assetId)

    const templateData = {
        title: assetName,
        asaId: assetId,
        unit: assetInfo.asset.params['unit-name'],
        ipfs: assetIpfsHash,
        description: assetName,
        date: new Date(assetTimestamp * 1e3).toISOString().split('.')[0] + 'Z',
        faceOfTheMonth: renderFaceOfTheMonthDates(faceOfTheMonthDates),
        adoptionName: ADOPTIONS[assetId] && ADOPTIONS[assetId]['adoptionName'],
        adopter: ADOPTIONS[assetId] && ADOPTIONS[assetId]['adopter'],
        adopterAddress: ADOPTIONS[assetId] && ADOPTIONS[assetId]['adopterAddress']
    }

    const renderedTemplate = render(templateData);
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
            res.pipe(fs.createWriteStream(`${imageOutFolder}/${ipfsHash}.png`));
        }
    });
}

function getFilename(assetName) {
    return `${assetName.toLowerCase().replaceAll(' ', '-').replace('#','').replace('supid','stupid')}.md`;
}

function render(data) {
	const rendered =  markdownTemplate.replace(/{{(.*?)}}/g, (match) => {
		return data[match.split(/{{|}}/).filter(Boolean)[0]]
	})

    filtered = rendered.split('\n').filter(line => line.indexOf('undefined') === -1 ).join('\n');
    return filtered;
}

async function getFaceOfTheMonthDates(assetId) {
    const connection = await pgPool.connect();
    const querySQL = `SELECT month_year FROM ${process.env.FACE_OF_THE_MONTH_TABLE} WHERE asset_id=${assetId}`;

    try {
        result = await pgPool.query(querySQL);
        return result.rows;
    } catch (error) {
        console.error(error)
    } finally {
        connection.release()
    }
}

function renderFaceOfTheMonthDates(faceOfTheMonthDates) {
    if (faceOfTheMonthDates.length < 1) return '';

    let outString ='\n';

    for (let faceOfTheMonthDate of faceOfTheMonthDates) {
        outString += `    - ${faceOfTheMonthDate.month_year.slice(0,7)}\n`;
    }
    return outString.trimEnd();
}

const markdownTemplate = `---
title: "{{title}}"
asaId: {{asaId}}
unit: "{{unit}}"
ipfs: {{ipfs}}
description: "{{description}}"
date: {{date}}
faceOfTheMonth:{{faceOfTheMonth}}
adoptionName: {{adoptionName}}
adopter: "{{adopter}}"
adopterAddress: "{{adopterAddress}}"
---
`


main();