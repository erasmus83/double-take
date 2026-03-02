function buildApiUrl() {
  if (process.env.DOUBLETAKE_HOST) {
    return `${window.location.protocol}//${process.env.DOUBLETAKE_HOST}:${process.env.DOUBLETAKE_PORT}/api`;
  }
  const basePath = window.ingressUrl || window.publicPath || '';
  return `${window.location.origin}${basePath}/api`;
}

function buildSocketPath() {
  // When DOUBLETAKE_HOST is set, return only the pathname; buildSocketUrl() provides the server URL.
  if (process.env.DOUBLETAKE_HOST) {
    return '/socket.io/';
  }
  const basePath = window.ingressUrl || window.publicPath;
  return basePath ? `${basePath}/socket.io/` : '';
}

function buildSocketUrl() {
  if (process.env.DOUBLETAKE_HOST) {
    return `${window.location.protocol}//${process.env.DOUBLETAKE_HOST}:${process.env.DOUBLETAKE_PORT}`;
  }
  return window.location.origin;
}

const config = () => ({
  api: buildApiUrl(),
  socket: {
    url: buildSocketUrl(),
    path: buildSocketPath(),
  },
});

export default config;
