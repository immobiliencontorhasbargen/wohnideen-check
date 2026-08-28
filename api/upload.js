const { put } = require('@vercel/blob');
module.exports = async function handler(req,res){
 if(req.method!=='POST') return res.status(405).send('Method not allowed');
 try{
  const filename=req.query.filename||`bild-${Date.now()}.jpg`;
  const chunks=[]; for await(const chunk of req) chunks.push(chunk);
  const body=Buffer.concat(chunks);
  const blob=await put(`wohnideen-check/${Date.now()}-${filename}`,body,{access:'public',contentType:req.headers['content-type']||'application/octet-stream',addRandomSuffix:true});
  res.status(200).json({url:blob.url});
 }catch(e){res.status(500).send(e.message||'Upload fehlgeschlagen')}
}