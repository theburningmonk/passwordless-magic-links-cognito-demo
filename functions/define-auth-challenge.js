const _ = require('lodash')

module.exports.handler = async (event) => {
  if (event.request.userNotFound) {
    event.response.issueTokens = false
    event.response.failAuthentication = true
    return event
  }

  if (_.isEmpty(event.request.session)) {
    // Issue new challenge
    event.response.issueTokens = false
    event.response.failAuthentication = false
    event.response.challengeName = 'CUSTOM_CHALLENGE'
  } else {
    const lastAttempt = _.last(event.request.session)
    if (lastAttempt.challengeResult === true) {
      // User gave right answer
      event.response.issueTokens = true
      event.response.failAuthentication = false
    } else {
      // User gave wrong answer
      event.response.issueTokens = false
      event.response.failAuthentication = true
    }
  }

  return event
}
