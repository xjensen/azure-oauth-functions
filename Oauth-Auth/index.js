const crypto = require('crypto');
const oauth = require('../oauth');

const authorizationUri = oauth.authorizeURL({
  redirect_uri: process.env.REDIRECT_URL,
  scope: 'repo,user',
  state: crypto.randomBytes(16).toString('hex')
});

module.exports = async function (context, req) {
  context.res = {
    status: 302,
    headers: {
      Location: authorizationUri
    },
    body: {}
  };
};
