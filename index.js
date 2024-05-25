const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

let app = express()

app.get('/', async(req, res) => {
	res.send(`<center>This API is made by HackMeSenpai with ❤</center>`)
});

app.get('/convert', async(req, res) => {
 let url = req.query.url;
 try {
  if (!url) throw new Error('"url" params. cannot be empty!');
  let res1 = await axios.get('https:/\/fdownloader.net/en');
  let k_exp = res1.data.match(/k_exp="(.*?)"/)[1]
  let k_token = res1.data.match(/k_token="(.*?)"/)[1]
  let {data:{data:body}} = await axios.post('https:/\/v3.fdownloader.net/api/ajaxSearch',
  	 new URLSearchParams({
    'k_exp': k_exp,
    'k_token': k_token,
    'q': url,
    'lang': 'en',
    'web': 'fdownloader.net'
   })
  );
  let $ = cheerio.load(body)
  let json = [], html = {}, result = {};
   $('tbody tr').each((i,e)=>{
   	 let obj = {}
	   obj.quality = $(e).children('td[class="video-quality"]').text()
	   obj.videoUrl = $(e).children('td[class="video-quality"]').next().next().children('a').attr('href') || $(e).children('td[class="video-quality"]').next().next().children('button').attr('data-videourl')
    json.push(obj)
   })
   json = json.filter((obj)=>obj.videoUrl)
   json.push({audioUrl:$('input[id="audioUrl"]').attr('value')})
   let btns = json.map((item) => {
   if (item.videoUrl) {
    return `<button onclick="window.open('${item.videoUrl}', '_blank')">Watch ${item.quality}</button>`;
   } else if (item.audioUrl) {
    return `<button onclick="window.open('${item.audioUrl}', '_blank')">Listen to Audio</button>`;
   }
  });
  html.html = btns.join('')
  result = Object.assign(result,{data:[{json:json},html]})
  res.json(result)
 }
	catch (e) {
  if (!e.response) {
			res.send({
				error: e.message
			});
		} else {
			res.send({
				error: `${e.response.status} ${e.response.statusText}`,
				data: e.response.data.message
			});
		}
	}
});

app.listen(3000, () => {
    console.log(`Server is listening at port 3000`);
});
