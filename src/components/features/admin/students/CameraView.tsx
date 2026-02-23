'use client';

import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

interface CameraViewProps {
  onBack: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onBack }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    console.log(imageSrc); // You can handle the captured image here
  }, [webcamRef]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Capture Student Photo</h2>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full rounded-lg mb-4"
      />
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg"
        >
          Back to Form
        </button>
        <button
          onClick={capture}
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Capture Photo
        </button>
      </div>
    </div>
  );
};

export default CameraView;
