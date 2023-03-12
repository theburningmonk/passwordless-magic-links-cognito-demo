const { decrypt } = require('../lib/encryption')

module.exports.handler = async (event) => {
  const email = event.request.userAttributes.email

  const expected = event.request.privateChallengeParameters.challenge
  if (event.request.challengeAnswer !== expected) {
    console.log("answer doesn't match current challenge token")
    event.response.answerCorrect = false
    return event
  }

  const json = await decrypt(event.request.challengeAnswer)
  const payload = JSON.parse(json)
  console.log(payload)
  
  const isExpired = new Date().toJSON() > payload.expiration
  console.log('isExpired:', isExpired)

  if (payload.email === email && !isExpired) {    
    event.response.answerCorrect = true
  } else {
    console.log("email doesn't match or token is expired")
    event.response.answerCorrect = false
  }
  
  return event
}