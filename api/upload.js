const { put } = require('@vercel/blob');
const { getVercelOidcToken } = require('@vercel/oidc');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const filename = req.query.filename || `bild-${Date.now()}.jpg`;
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks);
    const oidcToken = await getVercelOidcToken();

    if (!oidcToken) {
      throw new Error('Vercel OIDC token fehlt');
    }
    if (!process.env.BLOB_STORE_ID) {
      throw new Error('BLOB_STORE_ID fehlt');
    }

    const blob = await put(
      `wohnideen-check/${Date.now()}-${filename}`,
      body,
      {
        access: 'public',
        contentType: req.headers['content-type'] || 'application/octet-stream',
        addRandomSuffix: true,
        storeId: process.env.BLOB_STORE_ID,
        oidcToken
      }
    );

    return res.status(200).json({ url: blob.url });
  } catch (e) {
    console.error('Blob upload failed:', e);
    return res.status(500).json({
      error: e && e.message ? e.message : 'Upload fehlgeschlagen'
    });
  }
};
