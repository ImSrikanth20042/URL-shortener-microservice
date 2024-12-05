require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');
const { MongoClient } = require('mongodb');
const { hostname } = require('os');
const { error } = require('console');
const res = require('express/lib/response');
const app = express();
const client =new MongoClient(process.env.MONGO_URI);
const db = client.db("urlshortener")
const urls = db.collection("urls"); 

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const isInvalidUrl = (url)=>{
  
}

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  console.log(req.body)
  let url = req.body.url;
  const dnsLookUp = dns.lookup(urlParser.parse(url).hostname, async(err,address)=>{
   if(!address){
    res.json({error : "Invalid URL"})
   }
   else{
    const urlCount = await urls.countDocuments({})
    const urlDoc = {
         url,
        short_url : urlCount
    }
    const result = await urls.insertOne(urlDoc);
    res.json({original_url : url, short_url: urlCount});
   }
  })
});

app.get("/api/shorturl/:short_url",async (req, res)=>{
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({short_url: +shorturl});
  res.redirect(urlDoc.url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
