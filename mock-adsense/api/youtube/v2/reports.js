// Mock YouTube Analytics API v2. Logika di lib/bureau-mock.js.
const { serve, analyticsReport } = require('../../../lib/bureau-mock')

module.exports = (req, res) => serve(req, res, analyticsReport)
