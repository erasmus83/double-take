module.exports.tryParseJSON = (json) => {
  try {
    if (json && typeof json === 'object') return json;
    if (typeof json !== 'string') return false;
    const o = JSON.parse(json.replace(/^\ufeff/, '').trim());
    if (o && typeof o === 'object') {
      return o;
    }
  } catch (e) {
    return false;
  }
  return false;
};
