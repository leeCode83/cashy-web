// Mock YouTube Data API v3: playlistItems.list. Logika di lib/bureau-mock.js.
const { serve, playlistItems } = require('../../../lib/bureau-mock')

module.exports = (req, res) => serve(req, res, playlistItems)
