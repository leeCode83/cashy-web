// Mock YouTube Data API v3: channels.list. Logika di lib/bureau-mock.js.
const { serve, channelsList } = require('../../../lib/bureau-mock')

module.exports = (req, res) => serve(req, res, channelsList)
