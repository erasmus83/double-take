const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { UI } = require('./constants')();
const ipfilter = require('express-ipfilter').IpFilter;

require('express-async-errors');

const app = express();

app.use('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(require('./middlewares/respond'));

if (process.env.HA_ADDON === 'true' && process.env.IPFILTER === 'true') {
  const ips = ['172.30.32.2', '127.0.0.1', '::ffff:172.30.32.2', '::ffff:127.0.0.1'];
  app.use(ipfilter(ips, { mode: 'allow' }));
}
app.use(
  UI.PATH,
  express.static(`./frontend/${process.env.NODE_ENV === 'development' ? 'dist/' : ''}`, {
    index: false,
  })
);
app.use(`${UI.PATH}/api`, require('./routes'));

// Safely serialize a value for embedding inside a <script> tag in HTML.
// JSON.stringify alone is not sufficient because sequences like </script>,
// <!--, and Unicode line terminators can break out of the script context
// during HTML parsing.
function safeJsonForInlineScript(value) {
  return JSON.stringify(value)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

app.use(UI.PATH, (req, res) => {
  const html = fs.readFileSync(
    `${process.cwd()}/frontend/${process.env.NODE_ENV === 'development' ? 'dist/' : ''}index.html`,
    'utf8'
  );
  const ingressUrlSafe = safeJsonForInlineScript(req.headers['x-ingress-path'] || '');
  const publicPathSafe = safeJsonForInlineScript(UI?.PATH || '');
  res.send(
    html.replace(
      '</head>',
      `<script>
        window.ingressUrl = ${ingressUrlSafe};
        window.publicPath = ${publicPathSafe};
      </script>
      </head>`
    )
  );
});

module.exports = app;
