const download = require('image-downloader');
const sharp = require("sharp");
var fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const uploadFileToS3 = require("./s3");
dotenv.config()
module.exports = async function processImage(urlToProcess, Filename){
    // prepeare for download
    const options = {
        url: urlToProcess,
        dest: `${process.env.FILE_PATH}/${Filename}`,
    	headers: {
    		'Content-type': 'application/json',
	    	'Authorization': `Bearer ${process.env.BOT_TOKEN}`,
	    },
    };
    const {filename} = await download.image(options);   // download the image
    const outputFileName = `${process.env.FILE_PATH}/${path.parse(Filename).name}.webp`
    const data = await sharp(filename).toFile(outputFileName); // convert to webp
    fs.unlinkSync(options.dest);
    //prepare for upload
    const file ={
        filename : `${path.parse(Filename).name}.webp`,
        path : `${process.env.FILE_PATH}/${path.parse(Filename).name}.webp`,
    }
    const intermideate = await uploadFileToS3(file);
    const response = await intermideate;
    const urlToSend = response.Location;
    fs.unlinkSync(file.path);
    return urlToSend;
}
