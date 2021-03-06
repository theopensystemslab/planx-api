import * as aws from 'aws-sdk'
import { v4 as uuid } from 'uuid'

aws.config.update({
  region: process.env.AWS_S3_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
})

export const signS3Upload = (
  filename: string,
  filetype: string,
  callback: Function
) => {
  const s3 = new aws.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: process.env.AWS_S3_BUCKET },
  })

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    ACL: process.env.AWS_S3_ACL,
    Key: `uploads/${uuid()}_${filename}`,
    ContentType: filetype,
    // Expires: 60,
  }

  // return new Promise((resolve, reject) => {
  s3.getSignedUrl('putObject', params, (err, data) => {
    console.log({ err, data })
    if (err) {
      return callback(err)
    }

    return callback(data.split('?')[0])
  })
  // });
}
