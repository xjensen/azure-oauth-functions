module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body: '<http><body><a href="/api/auth" target="_self">Log in with GitHub</a></body></html>'
  };
};
