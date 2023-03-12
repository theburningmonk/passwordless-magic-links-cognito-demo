const Cognito = require('aws-sdk/clients/cognitoidentityserviceprovider')
const cognito = new Cognito()
const SES = require('aws-sdk/clients/sesv2')
const ses = new SES()
const { TIMEOUT_MINS } = require('../lib/constants')
const { encrypt } = require('../lib/encryption')
const qs = require('querystring')
const middy = require('@middy/core')
const httpErrorHandler = require('@middy/http-error-handler')
const cors = require('@middy/http-cors')

const { SES_FROM_ADDRESS, USER_POOL_ID, BASE_URL } = process.env
const ONE_MIN = 60 * 1000

module.exports.handler = middy(async (event) => {
  const { email } = JSON.parse(event.body)
  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'You must provide a valid email.'
      })
    }
  }

  // only send the magic link on the first attempt
  const now = new Date()
  const expiration = new Date(now.getTime() + ONE_MIN * TIMEOUT_MINS)
  const payload = {
    email,
    expiration: expiration.toJSON()
  }
  const tokenRaw = await encrypt(JSON.stringify(payload))
  const tokenB64 = Buffer.from(tokenRaw).toString('base64')
  const token = qs.escape(tokenB64)
  const magicLink = `https://${BASE_URL}/magic-link?email=${email}&token=${token}`  

  try {
    await cognito.adminUpdateUserAttributes({
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: [{
        Name: 'custom:authChallenge',
        Value: tokenB64
      }]
    }).promise()
  } catch (error) {
    console.log(error)
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'User not found'
      })
    }
  }
  
  await sendEmail(email, magicLink)
  return {
    statusCode: 202
  }
})
.use(httpErrorHandler())
.use(cors())

async function sendEmail(emailAddress, magicLink) {
  await ses.sendEmail({
    Destination: {
      ToAddresses: [ emailAddress ]
    },
    FromEmailAddress: SES_FROM_ADDRESS,
    Content: {
      Simple: {
        Subject: {
          Charset: 'UTF-8',
          Data: 'Your one-time sign in link'
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<html><body><p>This is your one-time sign in link (it will expire in ${TIMEOUT_MINS} mins):</p>
                  <h3>${magicLink}</h3></body></html>`
          },
          Text: {
            Charset: 'UTF-8',
            Data: `Your one-time sign in link (it will expire in ${TIMEOUT_MINS} mins): ${magicLink}`
          }
        }
      }
    }
  }).promise()
}
