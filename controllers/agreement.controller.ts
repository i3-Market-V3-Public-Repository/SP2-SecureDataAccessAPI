import { NextFunction, Request, Response } from 'express'
import { DataExchangeAgreement, JWK } from '@i3m/non-repudiation-library'
import * as sql from '../sqlite/sqlite'
//THIS WILL BE REMOVED AFTER TESTING
const privateJwk:JWK = {
    kty: 'EC',
    crv: 'P-256',
    x: '342tToZrvj64K-0vPuq9B5t8Bx3kjOlVW574Q2vo-zY',
    y: 'KtukEk-5ZSvJznoWYl99l6x8CbxbMDYJ7fBbwU8Dnpk',
    d: 'bF0ufFC_AHEY98HIZnqLdIMp1Hnh-8Y2sglQ15GOp7k',
    alg: 'ES256'
  }

  const publicJwk:JWK = {
    kty: 'EC',
    crv: 'P-256',
    x: '342tToZrvj64K-0vPuq9B5t8Bx3kjOlVW574Q2vo-zY',
    y: 'KtukEk-5ZSvJznoWYl99l6x8CbxbMDYJ7fBbwU8Dnpk',
    alg: 'ES256'
  }

export async function getDaaPublicKey(req: Request, res: Response, next: NextFunction) {

    try {
        const dataExchangeAgreement: DataExchangeAgreement = req.body
        const consumerPublicKey = dataExchangeAgreement.orig
        dataExchangeAgreement.dest = JSON.stringify(publicJwk)

        const db = await sql.openDb()

        const insert = 'INSERT INTO DataExchangeAgreements(ConsumerPublicKey, ProviderPublicKey, ProviderPrivateKey, DataExchangeAgreement) VALUES (?, ?, ?, ?)'
        const select = 'SELECT * FROM DataExchangeAgreements WHERE DataExchangeAgreement=?'
        const insertParams = [JSON.stringify(consumerPublicKey), JSON.stringify(publicJwk), JSON.stringify(privateJwk), JSON.stringify(dataExchangeAgreement)]
        const selectParams = [JSON.stringify(dataExchangeAgreement)]
        
        const verify = await sql.verifyIfTbRowsExist(select, selectParams, db)
        await sql.insertIntoTb(verify, insert, insertParams, db)
        await db.close()
        
        res.send(publicJwk)

    } catch (error) {
        next(error)
    }

}