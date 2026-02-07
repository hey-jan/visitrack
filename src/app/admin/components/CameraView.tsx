'use client';

import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

type CaptureStep = 'front' | 'left' | 'right' | 'confirm';

const capturePrompts: Record<CaptureStep, string> = {
  front: 'Please look directly at the camera',
  left: 'Please turn your head to the left',
  right: 'Please turn your head to the right',
  confirm: 'Confirm Photos',
};

interface CameraViewProps {
  onBack: () => void;
  onCapture: (images: { front: string; left: string; right: string }) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onBack, onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImages, setCapturedImages] = useState<{ front?: string; left?: string; right?: string }>({});
  const [currentStep, setCurrentStep] = useState<CaptureStep>('front');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImages(prev => ({ ...prev, [currentStep]: imageSrc }));
      if (currentStep === 'front') setCurrentStep('left');
      else if (currentStep === 'left') setCurrentStep('right');
      else if (currentStep === 'right') setCurrentStep('confirm');
    }
  }, [webcamRef, currentStep]);

  const handleConfirm = () => {
    if (capturedImages.front && capturedImages.left && capturedImages.right) {
      onCapture(capturedImages as { front: string; left: string; right: string });
      onBack();
    }
  };

  const handleRetake = () => {
    setCapturedImages({});
    setCurrentStep('front');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {currentStep === 'confirm' ? 'Confirm Photos' : 'Capture Student Photo'}
      </h2>
      
      <p className="text-center text-gray-600 mb-4">{capturePrompts[currentStep]}</p>

      {currentStep !== 'confirm' ? (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full rounded-lg mb-4"
        />
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <img src={capturedImages.front} alt="Front profile" className="rounded-lg" />
          <img src={capturedImages.left} alt="Left profile" className="rounded-lg" />
          <img src={capturedImages.right} alt="Right profile" className="rounded-lg" />
        </div>
      )}

      <div className="flex justify-between">
        {currentStep === 'confirm' ? (
          <>
            <button
              onClick={handleRetake}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg"
            >
              Retake All
            </button>
            <button
              onClick={handleConfirm}
              className="bg-black text-white px-6 py-3 rounded-lg"
            >
              Confirm Photos
            </button>
          </>
        ) : (
          <>
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
              {`Capture ${currentStep.charAt(0).toUpperCase() + currentStep.slice(1)} Photo`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraView;
