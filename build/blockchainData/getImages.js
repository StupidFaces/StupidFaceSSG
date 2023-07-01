const fs = require('fs');
const https = require('https');
const algosdk = require('algosdk');
const ADOPTIONS = require('./adoptions');
const fetch = require('node-fetch');

if (process.env.NODE_ENV == 'development') {
    require("dotenv").config({path: `.${process.env.NODE_ENV}.env`});
}

console.info(`API_BASE_URL: ${process.env.API_BASE_URL}`)


const algodClient = new algosdk.Algodv2('', 'https://node.algoexplorerapi.io/', 443);
const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.network', 443);

const IMAGE_OUT_FOLDER = 'public/assets/faces'
const MARKDOWN_OUT_FOLDER = 'src/faces'
const STUPID_ADDRESS = "KKBVJLXALCENRXQNEZC44F4NQWGIEFKKIHLDQNBGDHIM73F44LAN7IAE5Q";
const FACE_OF_THE_MONTH_ENDPOINT = 'faceofthemonths'

let faceOftheMonths;

async function main() {
    const healtState = await indexerClient.makeHealthCheck().do();
    const accountInfo = await algodClient.accountInformation(STUPID_ADDRESS).do();
    const createdAssets = accountInfo['created-assets'];
    faceOftheMonths = await getFaceOfTheMonths();

    for (let asset of createdAssets) {
        const assetUrl = asset['params']['url'];
        const assetId = asset['index'];
        const assetIpfsHash = assetUrl.split('/').at(-1);
        downloadImage(assetIpfsHash);
        
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
        date: new Date(assetTimestamp * 1e3).toISOString().split('.')[0] + 'Z',
        faceOfTheMonth: renderFaceOfTheMonthDates(assetId),
        adoptionName: ADOPTIONS[assetId] && ADOPTIONS[assetId]['adoptionName'],
        adopter: ADOPTIONS[assetId] && ADOPTIONS[assetId]['adopter'],
        adopterAddress: ADOPTIONS[assetId] && ADOPTIONS[assetId]['adopterAddress']
    }

    const renderedTemplate = render(templateData);
    fs.writeFile(`${MARKDOWN_OUT_FOLDER}/${fileName}`, renderedTemplate, (err) => {
        if (err) return console.log(err);
        console.log(`${renderedTemplate} > ${MARKDOWN_OUT_FOLDER}/${fileName}`);
    })
}

function downloadImage(ipfsHash) {
    https.get(`https://ipfs.io/ipfs/${ipfsHash}`, (res) => {
        console.log(`Status: ${res.statusCode} - IpfsHash: ${ipfsHash}`);

        if (res.statusCode == 200) {
            res.pipe(fs.createWriteStream(`${IMAGE_OUT_FOLDER}/${ipfsHash}.png`))
        } else {
            console.log(`Retrying: ${ipfsHash}`)
            downloadImage(ipfsHash)
        }
    }).on('error', error => {
        console.info(`Problems with creating write stream: ${error}`);
        downloadImage(ipfsHash);
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

async function getFaceOfTheMonths() {
    const response = await fetch(`${process.env.API_BASE_URL}/${FACE_OF_THE_MONTH_ENDPOINT}`);

    if (response.status == 200) {
        const data = await response.text();
        return JSON.parse(data);
    } else {
        throw new Error(`Could not reach API: ${process.env.API_BASE_URL}/${FACE_OF_THE_MONTH_ENDPOINT}`)
    }
}

function renderFaceOfTheMonthDates(assetId) {
    const faceOfTheMonthDates = faceOftheMonths.filter(face => face.assetId == assetId)[0]

    if (!faceOfTheMonthDates) return '';

    let outString ='\n';

    for (let faceOfTheMonthDate of faceOfTheMonthDates.fotmWins) {
        outString += `    - ${faceOfTheMonthDate.monthYear.slice(0,7)}\n`;
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