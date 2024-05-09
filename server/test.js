const crypto = require('crypto');

const secretToken = crypto.randomBytes(32).toString('hex');
console.log(secretToken);