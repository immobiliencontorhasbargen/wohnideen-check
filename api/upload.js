const { put } = require('@vercel/blob');

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

    const options = {
      access: 'public',
      contentType: req.headers['content-type'] || 'application/octet-stream',
      addRandomSuffix: true,
      storeId: process.env.BLOB_STORE_ID,
      oidcToken: process.env.VERCEL_OIDC_TOKEN
    };

    const blob = await put(
      `wohnideen-check/${Date.now()}-${filename}`,
      body,
      options
    );

    return res.status(200).json({ url: blob.url });
  } catch (e) {
    console.error('Blob upload failed:', e);
    return res.status(500).json({
      error: e && e.message ? e.message : 'Upload fehlgeschlagen'
    });
  }
};
