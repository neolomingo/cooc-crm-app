import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw } from 'lucide-react';
import Button from './Button';

interface PhotoCaptureProps {
  onPhotoCapture: (photoBlob: Blob) => void;
  existingPreview?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture, existingPreview }) => {
  const webcamRef = useRef<Webcam>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "user"
  };

  useEffect(() => {
    if (existingPreview && !photo) {
      setPhoto(existingPreview);
    }
  }, [existingPreview]);

  const compressImage = async (file: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setPhoto(imageSrc);
        fetch(imageSrc)
          .then(res => res.blob())
          .then(async (blob) => {
            const compressed = await compressImage(blob);
            onPhotoCapture(compressed);
          });
      }
    }
  }, [webcamRef, onPhotoCapture]);

  const retake = () => {
    setPhoto(null);
  };

  if (!isCameraActive) {
    return (
      <button
        onClick={() => setIsCameraActive(true)}
        className="w-full h-48 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center hover:border-gray-600 transition-colors"
      >
        <Camera size={32} className="text-gray-500 mb-2" />
        <span className="text-gray-400">Click to take member photo</span>
      </button>
    );
  }

  return (
    <div className="bg-background-elevated rounded-lg p-4">
      <div className="relative">
        {photo ? (
          <>
            <img 
              src={photo} 
              alt="Captured" 
              className="w-full rounded-lg"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={retake}
              leftIcon={<RefreshCw size={16} />}
              className="absolute bottom-4 right-4"
            >
              Retake
            </Button>
          </>
        ) : (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full rounded-lg"
            />
            <Button
              variant="primary"
              size="lg"
              onClick={capture}
              leftIcon={<Camera size={18} />}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
            >
              Take Photo
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoCapture;
