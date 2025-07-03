import { baseURL } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';

type UploadImageResponse = {
  url: string;
};

export async function UploadImage(
  image: FormData,
  fileName: string
): Promise<UploadImageResponse> {
  console.log('Uploading image...');

  // Get the authentication token
  const token = await SecureStore.getItemAsync('auth-token');
  // Extract the file blob from FormData
  const fileBlob = await extractBlobFromFormData(image);

  const response = await fetch(
    `${baseURL}/products/upload?filename=${encodeURIComponent(fileName)}`,
    {
      method: 'POST',
      body: fileBlob,
      headers: {
        'Content-Type': 'image/jpeg',
        // Don't set Content-Type for FormData, browser will set it with boundary
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Upload failed:', response.status, errorText);
    throw new Error(`Upload failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Helper function to extract blob from FormData
async function extractBlobFromFormData(formData: FormData) {
  // Get the file object from FormData
  //@ts-ignore
  const fileEntry = Array.from(formData.entries()).find(
    //@ts-ignore
    (entry) => entry[0] === 'file'
  );

  //@ts-ignore
  if (fileEntry && fileEntry[1]) {
    //@ts-ignore
    return fileEntry[1];
  }
  throw new Error('No file found in FormData');
}
