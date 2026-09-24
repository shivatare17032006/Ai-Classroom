// Cloudinary Service Utility for Student File Uploads (PDF, Word, PPT, Images)

/**
 * Gets active Cloudinary configuration:
 * Priority: 1. Environment variables (VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET)
 *           2. LocalStorage override ('aicl_cloudinary_config')
 *           3. Public Demo Cloudinary Preset (Fallback)
 */
export function getCloudinaryConfig() {
  try {
    const customConfig = localStorage.getItem('aicl_cloudinary_config');
    if (customConfig) {
      const parsed = JSON.parse(customConfig);
      if (parsed.cloudName && parsed.uploadPreset) {
        return {
          cloudName: parsed.cloudName,
          uploadPreset: parsed.uploadPreset,
          isCustom: true
        };
      }
    }
  } catch (e) {
    // Ignore storage parse error
  }

  const envCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const envUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (envCloudName && envUploadPreset) {
    return {
      cloudName: envCloudName,
      uploadPreset: envUploadPreset,
      isCustom: true
    };
  }

  // Public demo fallback
  return {
    cloudName: 'demo',
    uploadPreset: 'docs_upload_example_preset',
    isCustom: false
  };
}

/**
 * Uploads a file (PDF, Word, PPT, Image, etc.) to Cloudinary.
 * If custom Cloudinary credentials are provided, uses your account.
 * If Cloudinary upload fails or is offline, generates a secure local data URL fallback so PDFs render instantly.
 */
export async function uploadToCloudinary(file, onProgress) {
  const config = getCloudinaryConfig();
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset);
    formData.append('folder', 'student_submissions');

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      return {
        url: data.secure_url || data.url,
        publicId: data.public_id,
        format: data.format,
        bytes: data.bytes,
        originalFilename: file.name,
        isCloudinary: true,
        cloudName: config.cloudName
      };
    } else {
      console.warn(`Cloudinary upload returned ${response.status}. Using instant local preview fallback.`);
    }
  } catch (err) {
    console.warn('Cloudinary upload warning (using secure local data URL fallback):', err.message);
  }

  // Instant local data URL fallback for offline / demo mode
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result,
        publicId: `local-${Date.now()}-${file.name}`,
        format: file.name.split('.').pop().toLowerCase(),
        bytes: file.size,
        originalFilename: file.name,
        isCloudinary: false
      });
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

