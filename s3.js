const S3 = require('aws-sdk/clients/s3');
require("dotenv").config();
const fs = require('fs');
const moment = require('moment');
moment().format();

const bucketName = process.env.AWS_BUCKET_NAME  
const region = process.env.AWS_BUCKET_REGION 
const accessKeyId = process.env.AWS_ACCESS_KEYAWS_ACESS_KEY_ID 
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY 

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
});

module.exports = function uploadFileToS3(file){
    const FileName = `images/${moment().format('YYYY')}/${moment().format('MM')}/${moment().format('DD')}/${file.filename}`;
    const filestream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket : bucketName,
        Body : filestream,
        Key : FileName,
    }

    return s3.upload(uploadParams).promise();
}
