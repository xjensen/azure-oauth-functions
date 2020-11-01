const oauth = require('../oauth');

const generateScript = (message, content) => `
  <!DOCTYPE html>
  <html><body>
    <script>
      (function() {
        function receiveMessage(e) {
          console.log("receiveMessage %o", e)
          window.opener.postMessage(
            'authorization:github:${message}:${JSON.stringify(content)}',
            e.origin
          )
          window.removeEventListener("message",receiveMessage,false);
        }
        window.addEventListener("message", receiveMessage, false)
        console.log("Sending message: %o", "github")
        window.opener.postMessage("authorizing:github", "*")
      })()
    </script>
  </body></html>
`;

module.exports = async function (context, req) {
  var options = {
    code: req.query.code,
    redirect_uri: process.env.REDIRECT_URL,
    scope: 'repo,user'
  };

  try {
    const accessToken = await oauth.getToken(options);
    const token = oauth.createToken(accessToken);
    context.log(token);
    context.log(typeof token);
    const message = 'success';
    const content = {
      token: token.token.token.access_token,
      provider: 'github'
    };
    const script = generateScript(message, content);
    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'text/html'
      },
      body: script
    };
  } catch (error) {
    console.error('Access Token Error', error.message);
    const message = 'error';
    const content = JSON.stringify(error);
    const script = generateScript(message, content);
    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'text/html'
      },
      body: script
    };
  }
};
