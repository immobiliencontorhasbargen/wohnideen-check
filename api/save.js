const { put } = require('@vercel/blob');
const { getVercelOidcToken } = require('@vercel/oidc');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf8');
    JSON.parse(body); // validate JSON
    const oidcToken = await getVercelOidcToken();
    if (!oidcToken) throw new Error('Vercel OIDC token fehlt');
    if (!process.env.BLOB_STORE_ID) throw new Error('BLOB_STORE_ID fehlt');
    const id = 'wic-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    const blob = await put(`wohnideen-check/data/${id}.json`, body, {
      access: 'public',
      contentType: 'application/json; charset=utf-8',
      addRandomSuffix: false,
      storeId: process.env.BLOB_STORE_ID,
      oidcToken
    });
    return res.status(200).json({ id, url: blob.url });
  } catch (e) {
    console.error('Save failed:', e);
    return res.status(500).json({ error: e && e.message ? e.message : 'Speichern fehlgeschlagen' });
  }
};
