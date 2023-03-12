module.exports.handler = async (event) => {
  event.response.autoConfirmUser = true
  return event
}