const download = require('image-downloader');
const sharp = require("sharp");
var fs = require("fs");
const imgbbUploader = require("imgbb-uploader");
const dotenv = require("dotenv");
dotenv.config()
module.exports = async function processImage(urlToProcess){
    // prepeare for download
    const options = {
        url: urlToProcess,
        dest: process.env.INPUT_DEST,
    	headers: {
    		'Content-type': 'application/json',
	    	'Authorization': `Bearer ${process.env.BOT_TOKEN}`,
	    },
    };
    const {filename} = await download.image(options);   // download the image
    const data = await sharp(filename).toFile("output.webp"); // convert to webp
    fs.unlinkSync(options.dest);

    //prepare for upload
    const options1 = {
        apiKey: process.env.IMGBB_API_KEY,
        imagePath: "output.webp",
        //expiration: in secs
    };
    
    const imgbres = imgbbUploader(options1); //upload the image
    const response = await imgbres;
    const urlToSend = response.url;
    fs.unlinkSync(process.env.OUTPUT_DEST);
    return urlToSend;
}
