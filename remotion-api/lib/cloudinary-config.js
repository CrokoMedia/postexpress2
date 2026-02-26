/**
 * Cloudinary Configuration (Railway version)
 */

import { v2 as cloudinary } from 'cloudinary'

let isConfigured = false

/**
 * Configura e retorna instância do Cloudinary
 */
export function getCloudinary() {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    isConfigured = true
  }

  return cloudinary
}
