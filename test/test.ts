import { env } from "../config/env";
import { JsonMapOfData, ResponseData, SessionSchema, Mode } from "../types/openapi";
import { getFilesizeInBytes } from "../common/common";
import { openDb  } from "../sqlite/sqlite";
import * as fs from 'fs';
import 'isomorphic-fetch';
import npsession from '../session/np.session';
const BJSON = require('buffer-json')

const DigestFetch = require('digest-fetch');
import { response } from "express";

const fetchSignedResolution = async () => {
    const jws = {"verificationRequest":"eyJhbGciOiJFUzI1NiJ9.eyJwcm9vZlR5cGUiOiJyZXF1ZXN0IiwiaXNzIjoib3JpZyIsImRhdGFFeGNoYW5nZUlkIjoiZV80LUdVRmF6d04xUWFoNVNKSU9TcW5obnlOSGVTd0dFZmpuS1d3T3R5WSIsInBvciI6ImV5SmhiR2NpT2lKRlV6STFOaUo5LmV5SndjbTl2WmxSNWNHVWlPaUpRYjFJaUxDSnBjM01pT2lKa1pYTjBJaXdpWlhoamFHRnVaMlVpT25zaWIzSnBaeUk2SW50Y0ltRnNaMXdpT2x3aVJWTXlOVFpjSWl4Y0ltTnlkbHdpT2x3aVVDMHlOVFpjSWl4Y0ltdDBlVndpT2x3aVJVTmNJaXhjSW5oY0lqcGNJak0wTW5SVWIxcHlkbW8yTkVzdE1IWlFkWEU1UWpWME9FSjRNMnRxVDJ4V1Z6VTNORkV5ZG04dGVsbGNJaXhjSW5sY0lqcGNJa3QwZFd0RmF5MDFXbE4yU25wdWIxZFpiRGs1YkRaNE9FTmllR0pOUkZsS04yWkNZbmRWT0VSdWNHdGNJbjBpTENKbGJtTkJiR2NpT2lKQk1qVTJSME5OSWl3aWMybG5ibWx1WjBGc1p5STZJa1ZUTWpVMklpd2lhR0Z6YUVGc1p5STZJbE5JUVMweU5UWWlMQ0pzWldSblpYSkRiMjUwY21GamRFRmtaSEpsYzNNaU9pSXdlRGhrTkRBM1lURTNNakkyTXpOaVpHUXhaR05tTWpJeE5EYzBZbVUzWVRRMFl6QTFaRGRqTW1ZaUxDSnNaV1JuWlhKVGFXZHVaWEpCWkdSeVpYTnpJam9pTUhneE4ySmtNVEpqTWpFek5HRm1ZekZtTm1VNU16QXlZVFV6TW1WbVpUTXdZekU1WWpsbE9UQXpJaXdpY0c5dlZHOVFiM0pFWld4aGVTSTZNVEF3TURBc0luQnZiMVJ2VUc5d1JHVnNZWGtpT2pJd01EQXdMQ0p3YjI5VWIxTmxZM0psZEVSbGJHRjVJam94TlRBd01EQXNJbVJsYzNRaU9pSjdYQ0poYkdkY0lqcGNJa1ZUTWpVMlhDSXNYQ0pqY25aY0lqcGNJbEF0TWpVMlhDSXNYQ0pyZEhsY0lqcGNJa1ZEWENJc1hDSjRYQ0k2WENJek5ESjBWRzlhY25acU5qUkxMVEIyVUhWeE9VSTFkRGhDZUROcmFrOXNWbGMxTnpSUk1uWnZMWHBaWENJc1hDSjVYQ0k2WENKTGRIVnJSV3N0TlZwVGRrcDZibTlYV1d3NU9XdzJlRGhEWW5oaVRVUlpTamRtUW1KM1ZUaEVibkJyWENKOUlpd2lZMmx3YUdWeVlteHZZMnRFWjNOMElqb2lkR1JTY0dOMWVITkRZMlJIT0RSNU1XSTRhV05mTUROSlRqUm5WVmRzWW1WbWMzSkNlVWxJVmtWek1DSXNJbUpzYjJOclEyOXRiV2wwYldWdWRDSTZJa1J4VEVvNVFWVm9XbXRHVERWTWNrbFpYMnROTUdaWlRsaHZWWFJCWVRSNk0yWXdXVzFwT1doWFQyY2lMQ0p6WldOeVpYUkRiMjF0YVhSdFpXNTBJam9pYUd0d1RXaENVSEJUZG1STmN6RnBkMmxQVTFkak1uQnFTbnB5YVhKWFMwaGpTVVYyTlhKS1IxVllTU0lzSW1sa0lqb2laVjgwTFVkVlJtRjZkMDR4VVdGb05WTktTVTlUY1c1b2JubE9TR1ZUZDBkRlptcHVTMWQzVDNSNVdTSjlMQ0p3YjI4aU9pSmxlVXBvWWtkamFVOXBTa1pWZWtreFRtbEtPUzVsZVVwM1kyMDVkbHBzVWpWalIxVnBUMmxLVVdJd09HbE1RMHB3WXpOTmFVOXBTblpqYld4dVNXbDNhVnBZYUdwaFIwWjFXakpWYVU5dWMybGlNMHB3V25sSk5rbHVkR05KYlVaeldqRjNhVTlzZDJsU1ZrMTVUbFJhWTBscGVHTkpiVTU1Wkd4M2FVOXNkMmxWUXpCNVRsUmFZMGxwZUdOSmJYUXdaVlozYVU5c2QybFNWVTVqU1dsNFkwbHVhR05KYW5CalNXcE5NRTF1VWxWaU1YQjVaRzF2TWs1RmMzUk5TRnBSWkZoRk5WRnFWakJQUlVvMFRUSjBjVlF5ZUZkV2VsVXpUa1pGZVdSdE9IUmxiR3hqU1dsNFkwbHViR05KYW5CalNXdDBNR1JYZEVaaGVUQXhWMnhPTWxOdWNIVmlNV1JhWWtSck5XSkVXalJQUlU1cFpVZEtUbEpHYkV0T01scERXVzVrVms5RlVuVmpSM1JqU1c0d2FVeERTbXhpYlU1Q1lrZGphVTlwU2tKTmFsVXlVakJPVGtscGQybGpNbXh1WW0xc2RWb3dSbk5hZVVrMlNXdFdWRTFxVlRKSmFYZHBZVWRHZW1GRlJuTmFlVWsyU1d4T1NWRlRNSGxPVkZscFRFTktjMXBYVW01YVdFcEVZakkxTUdOdFJtcGtSVVpyV2toS2JHTXpUV2xQYVVsM1pVUm9hMDVFUVROWlZFVXpUV3BKTWsxNlRtbGFSMUY0V2tkT2JVMXFTWGhPUkdNd1dXMVZNMWxVVVRCWmVrRXhXa1JrYWsxdFdXbE1RMHB6V2xkU2JscFlTbFJoVjJSMVdsaEtRbHBIVW5sYVdFNTZTV3B2YVUxSVozaE9Na3ByVFZSS2FrMXFSWHBPUjBadFdYcEdiVTV0VlRWTmVrRjVXVlJWZWsxdFZtMWFWRTEzV1hwRk5WbHFiR3hQVkVGNlNXbDNhV05IT1haV1J6bFJZak5LUlZwWGVHaGxVMGsyVFZSQmQwMUVRWE5KYmtKMllqRlNkbFZIT1hkU1IxWnpXVmhyYVU5cVNYZE5SRUYzVEVOS2QySXlPVlZpTVU1c1dUTktiR1JGVW14aVIwWTFTV3B2ZUU1VVFYZE5SRUZ6U1cxU2JHTXpVV2xQYVVvM1dFTkthR0pIWkdOSmFuQmpTV3RXVkUxcVZUSllRMGx6V0VOS2FtTnVXbU5KYW5CalNXeEJkRTFxVlRKWVEwbHpXRU5LY21SSWJHTkphbkJqU1d0V1JGaERTWE5ZUTBvMFdFTkpObGhEU1hwT1JFb3dWa2M1WVdOdVduRk9hbEpNVEZSQ01sVklWbmhQVlVreFpFUm9RMlZFVG5KaGF6bHpWbXhqTVU1NlVsSk5ibHAyVEZod1dsaERTWE5ZUTBvMVdFTkpObGhEU2t4a1NGWnlVbGR6ZEU1V2NGUmthM0EyWW0wNVdGZFhkelZQVjNjeVpVUm9SRmx1YUdsVVZWSmFVMnBrYlZGdFNqTldWR2hGWW01Q2NsaERTamxKYVhkcFdUSnNkMkZIVm5sWmJYaDJXVEowUlZvelRqQkphbTlwWkVkU1UyTkhUakZsU0U1RVdUSlNTRTlFVWpWTlYwazBZVmRPWmsxRVRrcFVhbEp1Vmxaa2MxbHRWbTFqTTBwRFpWVnNTVlpyVm5wTlEwbHpTVzFLYzJJeVRuSlJNamwwWWxkc01HSlhWblZrUTBrMlNXdFNlRlJGYnpWUlZsWnZWMjEwUjFSRVZrMWphMnhhV0RKMFRrMUhXbHBVYkdoMlZsaFNRbGxVVWpaTk1sbDNWMWN4Y0U5WGFGaFVNbU5wVEVOS2VscFhUbmxhV0ZKRVlqSXhkR0ZZVW5SYVZ6VXdTV3B2YVdGSGRIZFVWMmhEVlVoQ1ZHUnRVazVqZWtad1pESnNVRlV4WkdwTmJrSnhVMjV3ZVdGWVNsaFRNR2hxVTFWV01rNVlTa3RTTVZaWlUxTkpjMGx0Ykd0SmFtOXBXbFk0TUV4VlpGWlNiVVkyWkRBMGVGVlhSbTlPVms1TFUxVTVWR05YTlc5aWJteFBVMGRXVkdRd1pFWmFiWEIxVXpGa00xUXpValZYVTBvNVRFTktjRmxZVVdsUGFrVXlUbXBGTlU1VVNYZE9WRlk1TGpGbWRHMDVTM0pRU1U5S2RFRlVUbGRpVWpjelMyTXRaamxPZVZsa1RrZHhZbFp1V2twM09VNVBWMU5yV1VSd1ZtSnlTMlZVVlRkQll6a3hYM2hYV0doeWJUTlhNSGRNYkdkNFRubzBObUp4UVZwNldGSm5JaXdpYVdGMElqb3hOall4T1RVeU1EVTFmUS5UWVFMcDBla3pEaXllZVdOVkk4MWJPUko1NFVzbTg4Y0RqYW1YVVBpc2liNTBTVzZJLWpFbXNWVm9WZHBMTFZpUVlKdFdrZ19GQy1ES1hFbm4xSGZmUSIsInR5cGUiOiJ2ZXJpZmljYXRpb25SZXF1ZXN0IiwiaWF0IjoxNjYxOTUyMDU2fQ.GiwOKJ1Ma7r8mpFishin7WyAfCWa_sC5NqRDgRXNNNQFYwLJ2BvmbrK10NjY60GkFef5cDJcZ6IwTkNWGaBk3Q"}
    const verification = await fetch(`${env.backplaneUrl}/conflictResolverService/verification`, {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(jws),
    });
    const resolution = await verification.json();
    console.log(JSON.stringify(resolution))
    const signedResolution = resolution.signedResolution
}

//fetchSignedResolution()

const jsonMapOfData: JsonMapOfData = {
    "records": [
        {
            "96f1b343f831551fb6b767a3ac228677659b94804a528fbf7fb763d66be69cf4": "0"
        },
        {
            "8508f4395569f5d22298144e49e3755a034b21a0fd1e444f4b95d159fd052ba3": "128"
        },
        {
            "ed0557fdb809a4404980f36bb708fcc914c4392daa3118d68eef91fd28b384e8": "256"
        },
        {
            "2a22fb6e59c12d81e87f0ee979c80796afade89b2f5b2f8c9f254ec94dc3c7ca": "384"
        },
        {
            "6376ca5b17936d3f417c1a18c45fed435779f88cde44bf6d8a2d193eb73c5352": "512"
        },
        {
            "9f42e08a96b6718bd1c5cd421a5bf91cbbcf48797eb3db3aa8e910d489a402e6": "640"
        }
    ]
}
export async function responseData(blockId: string, jsonMapOfData: JsonMapOfData, resourcePath: string){

    let blockSize = env.blockSize

    // get index of blockId
    const keys: string[] = []
    for(let i = 0; i < jsonMapOfData.records.length; i++){
        keys[i] = Object.keys(jsonMapOfData.records[i])[0]
    }

    const getIndex = keys.indexOf(blockId);

    // check if you got to last block
    if (getIndex + 1 === keys.length){
        blockSize = getFilesizeInBytes(resourcePath) % blockSize;
        console.log(`The size of last block is: ${blockSize}`)
    }

    // data from coresponding offset
    const buffer = Buffer.alloc(blockSize);
    
    const promise = await new Promise<ResponseData> ((resolve) => {

        fs.open(resourcePath, 'r+', function (err, fd) { 
        if (err) { 
            return console.error(err); 
        } 
      
        console.log("Reading the file"); 
      
        fs.read(fd, buffer, 0, blockSize, 
            parseInt(jsonMapOfData.records[getIndex][`${blockId}`]), function (err, num) { 
                if (err) { 
                    console.log(err); 
                } 
                console.log('Buffer data: ' + buffer.length)

                if (getIndex + 1 == keys.length){
                resolve({data: buffer, nextBlockId: "null"});
                }else{
                resolve({data: buffer, nextBlockId: keys[getIndex+1]})
                }
            });
            // Close the opened file. 
            fs.close(fd, function (err) { 
                if (err) { 
                    console.log(err); 
                } 
                console.log("File closed successfully"); 
            });
    }); 
    });
    return promise;
}

const oneBlock = async() => {
    const blockId = '96f1b343f831551fb6b767a3ac228677659b94804a528fbf7fb763d66be69cf4'
    const resourcePath = '../data/exampledata.7z'
    const response = await responseData(blockId, jsonMapOfData, resourcePath)

    console.log(response)
}

//oneBlock()

export async function testDb() {
    

    const select = 'SELECT User FROM DataSpaceUsers WHERE User=?'
    const params = ["admin"]

    const db = await openDb()
    const selectResult = await db.get(select, params)

    console.log(selectResult)
    
    await db.close()
}

//testDb()

async function testDigest() {
    const client = new DigestFetch('admin', '123') 
    let resource = await client.fetch('http://localhost:3000/oidc/digestAuthTest', {
    method: 'GET',
    })
    console.log(resource)
}

let obj = {}
// obj['t'] = {'b': 's'}
// console.log(obj)
obj['t'] = {}
obj['t'] = Object.assign(obj['t'], {'st': 's'})
console.log(obj)
obj['t'] = Object.assign(obj['t'], {'b': 'sreee'})
console.log(obj)
//obj['x'] = Object.assign({'st': 's'}, obj['x'])
//obj = Object.assign({'st': 'strrr'}, obj['t'])


//==================================================================
import * as nonRepudiationLibrary from '@i3m/non-repudiation-library';
import { Agreement } from "../types/agreement";
const privateJwk: nonRepudiationLibrary.JWK = {
    kty: 'EC',
    crv: 'P-256',
    x: '342tToZrvj64K-0vPuq9B5t8Bx3kjOlVW574Q2vo-zY',
    y: 'KtukEk-5ZSvJznoWYl99l6x8CbxbMDYJ7fBbwU8Dnpk',
    d: 'bF0ufFC_AHEY98HIZnqLdIMp1Hnh-8Y2sglQ15GOp7k',
    alg: 'ES256'
}

const publicJwk: nonRepudiationLibrary.JWK = {
    kty: 'EC',
    crv: 'P-256',
    x: '342tToZrvj64K-0vPuq9B5t8Bx3kjOlVW574Q2vo-zY',
    y: 'KtukEk-5ZSvJznoWYl99l6x8CbxbMDYJ7fBbwU8Dnpk',
    alg: 'ES256'
}

const dataExchangeAgreement: nonRepudiationLibrary.DataExchangeAgreement = {
    // Public key of the origin (data provider) for verifying the proofs she/he issues. It should be providerJwks.publicJwk
    orig: JSON.stringify(publicJwk),
    // Public key of the destination (data consumer)
    dest: JSON.stringify(publicJwk),
    // Encryption algorithm used to encrypt blocks. Either AES-128-GCM ('A128GCM') or AES-256-GCM ('A256GCM)
    encAlg: 'A256GCM',
    // Signing algorithm used to sign the proofs. It'e ECDSA secp256r1 with key lengths: either 'ES256', 'ES384', or 'ES512' 
    signingAlg: 'ES256',
    // Hash algorith used to compute digest/commitments. It's SHA2 with different output lengths: either 'SHA-256', 'SHA-384' or 'SHA-512'
    hashAlg: 'SHA-256',
    // The ledger smart contract address (hexadecimal) on the DLT
    ledgerContractAddress: '0x8d407a1722633bdd1dcf221474be7a44c05d7c2f',
    // The orig (data provider) address in the DLT (hexadecimal).
    ledgerSignerAddress: '0x17bd12C2134AfC1f6E9302a532eFE30C19B9E903',
    // Maximum acceptable delay between the issuance of the proof of origing (PoO) by the orig and the reception of the proof of reception (PoR) by the orig
    pooToPorDelay: 10000,
    // Maximum acceptable delay between the issuance of the proof of origing (PoP) by the orig and the reception of the proof of publication (PoR) by the dest
    pooToPopDelay: 20000,
    // If the dest (data consumer) does not receive the PoP, it could still get the decryption secret from the DLT. This defines the maximum acceptable delay between the issuance of the proof of origing (PoP) by the orig and the publication (block time) of the secret on the blockchain.
    pooToSecretDelay: 150000
}
const agreement: Agreement = {
    "agreementId": 8,
    "providerPublicKey": "{\"kty\":\"EC\",\"crv\":\"P-256\",\"x\":\"342tToZrvj64K-0vPuq9B5t8Bx3kjOlVW574Q2vo-zY\",\"y\":\"KtukEk-5ZSvJznoWYl99l6x8CbxbMDYJ7fBbwU8Dnpk\",\"alg\":\"ES256\"}",
    "consumerPublicKey": "{\"kty\":\"EC\",\"crv\":\"P-256\",\"x\":\"342tToZrvj64K-0vPuq9B5t8Bx3kjOlVW574Q2vo-zY\",\"y\":\"KtukEk-5ZSvJznoWYl99l6x8CbxbMDYJ7fBbwU8Dnpk\",\"alg\":\"ES256\"}",
    "dataExchangeAgreementHash": "95434269d9622b01f98a5cda30fdbe7158cfccaadaac8e674fd1d756cdae8ad0",
    "dataOffering": {
      "dataOfferingId": "6331c51ff69d7c2212c9ec4a",
      "dataOfferingVersion": 30,
      "dataOfferingTitle": "Offering Energy"
    },
    "purpose": "",
    "state": 0,
    "agreementDates": [
      1669939200,
      1669971906,
      1701507906
    ],
    "intendedUse": {
      "processData": false,
      "shareDataWithThirdParty": false,
      "editData": false
    },
    "licenseGrant": {
      "transferable": false,
      "exclusiveness": false,
      "paidUp": false,
      "revocable": false,
      "processing": false,
      "modifying": false,
      "analyzing": false,
      "storingData": false,
      "storingCopy": false,
      "reproducing": false,
      "distributing": false,
      "loaning": false,
      "selling": false,
      "renting": false,
      "furtherLicensing": false,
      "leasing": false
    },
    "dataStream": false,
    "personalData": false,
    "pricingModel": {
      "paymentType": "one-time purchase",
      "price": 500,
      "currency": "EUR",
      "fee": 25,
      "paymentOnSubscription": {
        "timeDuration": "",
        "repeat": ""
      },
      "isFree": false
    },
    "violation": {
      "violationType": 0
    },
    "signatures": {
      "providerSignature": "eyJhbGciOiJQUzM4NCIsImtpZCI6ImJpbGJvLmJhZ2dpbnNAaG9iYml0b24uZXhhbXBsZSJ9.SXTigJlzIGEgZGFuZ2Vyb3VzIGJ1c2luZXNzLCBGcm9kbywgZ29pbmcgb3V0IHlvdXIgZG9vci4gWW91IHN0ZXAgb250byB0aGUgcm9hZCwgYW5kIGlmIHlvdSBkb24ndCBrZWVwIHlvdXIgZmVldCwgdGhlcmXigJlzIG5vIGtub3dpbmcgd2hlcmUgeW91IG1pZ2h0IGJlIHN3ZXB0IG9mZiB0by4.cu22eBqkYDKgIlTpzDXGvaFfz6WGoz7fUDcfT0kkOy42miAh2qyBzk1xEsnk2IpN6tPid6VrklHkqsGqDqHCdP6O8TTB5dDDItllVo6_1pcbUrhiUSMxbbXUvdvWXzg-UD8biiReQFlfz28zGWVsdiNAUf8ZnyPEgVFn442ZdNqiVJRmBqrYRXe8P_ijQ7p8Vdz0TTrxUeT3lm8d9shnr2lfJT8ImUjvAA2Xez2Mlp8cBE5awDzT0qI0n6uiP1aCN_2_jLAeQTlqRHtfa64QQSUmFAAjVKPbByi7xho0uTOcbH510a6GYmJUAfmWjwZ6oD4ifKo8DYM-X72Eaw",
      "consumerSignature": "eyJhbGciOiJQUzM4NCIsImtpZCI6ImJpbGJvLmJhZ2dpbnNAaG9iYml0b24uZXhhbXBsZSJ9.SXTigJlzIGEgZGFuZ2Vyb3VzIGJ1c2luZXNzLCBGcm9kbywgZ29pbmcgb3V0IHlvdXIgZG9vci4gWW91IHN0ZXAgb250byB0aGUgcm9hZCwgYW5kIGlmIHlvdSBkb24ndCBrZWVwIHlvdXIgZmVldCwgdGhlcmXigJlzIG5vIGtub3dpbmcgd2hlcmUgeW91IG1pZ2h0IGJlIHN3ZXB0IG9mZiB0by4.cu22eBqkYDKgIlTpzDXGvaFfz6WGoz7fUDcfT0kkOy42miAh2qyBzk1xEsnk2IpN6tPid6VrklHkqsGqDqHCdP6O8TTB5dDDItllVo6_1pcbUrhiUSMxbbXUvdvWXzg-UD8biiReQFlfz28zGWVsdiNAUf8ZnyPEgVFn442ZdNqiVJRmBqrYRXe8P_ijQ7p8Vdz0TTrxUeT3lm8d9shnr2lfJT8ImUjvAA2Xez2Mlp8cBE5awDzT0qI0n6uiP1aCN_2_jLAeQTlqRHtfa64QQSUmFAAjVKPbByi7xho0uTOcbH510a6GYmJUAfmWjwZ6oD4ifKo8DYM-X72Eaw"
    }
  }
const text = "text"
const rawBufferData = Buffer.from(text)
const providerDltSigningKeyHex = env.providerDltSigningKeyHex

const npProvider = new nonRepudiationLibrary.NonRepudiationProtocol.NonRepudiationOrig(dataExchangeAgreement, privateJwk, rawBufferData, providerDltSigningKeyHex)
npsession.set("consumerOne", 1, npProvider, agreement, "batch")
npsession.set("consumerOne", 1, npProvider, agreement, "stream")
npsession.set("consumerOne", 2, npProvider, agreement, "batch")

npsession.set("consumerTwo", 1, npProvider, agreement, "stream")
npsession.set("consumerTwo", 2, npProvider, agreement, "batch")

const tr: Mode = npsession.get("consumerOne")

let session: Mode = npsession.get("consumerThree")
const agreementId = 3      
if (session === undefined || session.batch?.agreementId !== agreementId) {

    //session.batch?.agreement = agreement
    session = {
        batch: {
            agreement: agreement,
            agreementId: 3
        }
    }
}
console.log(session)
console.log(tr)

const textExample = 'sda'
const dta = Buffer.from(textExample)
const js = {msg: dta}
const toJs = BJSON.stringify(js)
console.log(toJs)
const e = BJSON.parse(toJs)
console.log(e)
console.log(e.msg.toString())