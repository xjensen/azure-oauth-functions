const oauth = require('../oauth');

const originPattern = process.env.ORIGIN || '';
if (('').match(originPattern)) {
  console.warn('Insecure ORIGIN pattern used. This can give unauthorized users access to your repository.');
  if (process.env.NODE_ENV === 'production') {
    console.error('Will not run without a safe ORIGIN pattern in production.');
    process.exit();
  }
}

module.exports = async function (context, req) {
  var options = {
    code: req.query.code
  };

  oauth.authorizationCode.getToken(options, (error, result) => {
    let message, content;

    if (error) {
      console.error('Access Token Error', error.message);
      message = 'error';
      content = JSON.stringify(error);
    } else {
      const token = oauth.accessToken.create(result);
      message = 'success';
      content = {
        token: token.token.access_token,
        provider: 'github'
      };
    }

    const script = `
      <script>
        (function() {
          function recieveMessage(e) {
            console.log("recieveMessage %o", e)
            if (!e.origin.match(${JSON.stringify(originPattern)})) {
              console.log('Invalid origin: %s', e.origin);
              return;
            }
            window.opener.postMessage(
              'authorization:github:${message}:${JSON.stringify(content)}',
              e.origin
            )
          }
          window.addEventListener("message", recieveMessage, false)
          console.log("Sending message: %o", "github")
          window.opener.postMessage("authorizing:github", "*")
        })()
      </script>
    `;

    context.res = {
      status: 200,
      body: script
    };
  });
};
