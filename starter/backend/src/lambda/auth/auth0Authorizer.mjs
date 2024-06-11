import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'



const logger = createLogger('auth')

// const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'
const jwksUrl = 'https://dev-d4yk6fba04pjeihm.us.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  console.log("Entered JWT Handler Function")
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    console.log("JWT Token", jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

// Taken from this question: https://knowledge.udacity.com/questions/367005
async function getCertificate(jwksUrl){
  try{
    const response = await Axios.get(jwksUrl);
    const key = response['data']['keys'][0]['x5c'][0];
    const cert = `-----BEGIN CERTIFICATE-----\n${key}\n-----END CERTIFICATE-----`;
    return cert
  }
  catch (error){
    logger.error('Getting certificate failed',error)
   }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true }) // Is this a red herring? It seems to me I don't actually need this here

  console.log('About to verify jwt')

  // TODO: Implement token verification
  const certificate = await getCertificate(jwksUrl)

  console.log('Got certificate! : ', certificate)

  // jsonwebtoken.verify(jwt, certificate)
  jsonwebtoken.verify(token, certificate)

  console.log('Successfully verified JWT')

  return jwt

  // return undefined;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
