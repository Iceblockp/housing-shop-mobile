import { UploadImage } from '@/hooks/upload-image';
import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export function isDeadlineApproaching(deadline: Date | string | null) {
  if (!deadline) return false;

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const timeDiff = deadlineDate.getTime() - now.getTime();

  // Return true if less than 5 minutes remaining
  return timeDiff > 0 && timeDiff < 5 * 60 * 1000;
}

export function getRemainingTime(date: Date | string | null) {
  if (!date) return null;

  const targetDate = new Date(date);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);

  return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
}

export const pickAndUploadImage = async (
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setImage: (image: string) => void,
  aspect: [width: number, height: number]
) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Please grant camera roll permissions to upload images'
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: aspect,
    quality: 1,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const selectedAsset = result.assets[0];
    setIsLoading(true);

    try {
      // Check file size
      const fileSize = (
        await fetch(selectedAsset.uri).then((res) => res.blob())
      ).size;

      console.log('filesize', fileSize, selectedAsset);

      let compressedUri = selectedAsset.uri;
      // Resize or compress if larger than 1MB
      console.log('com one', compressedUri);
      if (fileSize > 1024 * 1024) {
        console.log('Compressing image...');
        const compressedImage = await ImageManipulator.manipulateAsync(
          selectedAsset.uri,
          [{ resize: { width: 1000 } }], // Resize width while maintaining aspect ratio
          {
            compress: 0.8, // Compression quality (0–1)
            format: ImageManipulator.SaveFormat.JPEG, // Format: JPEG or PNG
          }
        );

        compressedUri = compressedImage.uri;
      }
      console.log('com two', compressedUri);

      const formData = new FormData();
      const fileType = selectedAsset.type || 'image/jpeg';
      const fileName = selectedAsset.fileName || `image-${Date.now()}.jpg`;

      // Create a proper file object for the FormData
      //@ts-ignore
      formData.append('file', {
        uri: compressedUri,
        name: fileName,
        type: fileType,
      });

      console.log(formData);

      console.log('Uploading to server with filename:', fileName);

      const uploadResponse = await UploadImage(formData, fileName);
      console.log('Upload successful, URL:', uploadResponse.url);
      setImage(uploadResponse.url);
      setIsLoading(false);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        'There was an error uploading your image. Please try again.'
      );
      setIsLoading(false);
    }
  }
};
