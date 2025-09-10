/**
 * Import node modules
 */
import { v2 as cloudinary } from 'cloudinary'

/**
 * Import Custom Modules
 */
import config from '@/config'
import { logger } from '@/lib/winston'

/**
 * Import Types
 */
import type { UploadApiResponse } from 'cloudinary'

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: config.NODE_ENV === 'production'
})

const uploadToCloudinary = (buffer: Buffer<ArrayBufferLike>, publicId?: string): Promise<UploadApiResponse | undefined> => {
  return new Promise(
    (resolve, reject) => {
      cloudinary.uploader.upload_stream({
        allowed_formats: ['png', 'jpg', 'webp'],
        resource_type: 'image',
        folder: "blog-api",
        public_id: publicId,
        transformation: { quality: 'auto' }
      }, 
      (error, result) => {
        if(error) {
          logger.error('Error while uploading image to cloudinary', error)
          reject(error)
        }

        resolve(result)
      }
    )
    .end(buffer)
    }
  )
}

export default uploadToCloudinary