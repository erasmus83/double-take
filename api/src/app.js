const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { UI } = require('./constants')();
require('express-async-errors');

const app = express();
app.use('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(require('./middlewares/respond'));

app.use(
  UI.PATH,
  express.static(`./frontend/${process.env.NODE_ENV === 'production' ? '' : 'dist/'}`, {
    index: false,
  })
);
app.use(`${UI.PATH}/api`, require('./routes'));

app.use(UI.PATH, (req, res) => {
  const html = fs.readFileSync(
    `${process.cwd()}/frontend/${process.env.NODE_ENV === 'production' ? '' : 'dist/'}index.html`,
    'utf8'
  );
  // Safely serialize values to prevent XSS
  const ingressUrlSafe = JSON.stringify(req.headers['x-ingress-path'] || '');
  const publicPathSafe = JSON.stringify(UI?.PATH || '');
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

app.use((err, req, res, next) => res.send(err));

module.exports = app;
