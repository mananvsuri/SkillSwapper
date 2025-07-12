import React, { useState } from 'react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  swapId: number;
  targetUserName: string;
  onRate: (ratingData: {
    to_user_id: number;
    stars: number;
    feedback?: string;
  }) => Promise<{ error?: string } | null>;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  swapId,
  targetUserName,
  onRate
}) => {
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (stars === 0) {
      setError('Please select a rating');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      const result = await onRate({
        to_user_id: 0, // This will be set by the parent component
        stars,
        feedback: feedback.trim() || undefined,
      });
      
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit rating');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStars(0);
      setFeedback('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Rate {targetUserName}</h2>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">Rating</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setStars(star)}
                className={`text-2xl ${
                  star <= stars ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
                disabled={isLoading}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {stars > 0 && (
              <span>
                {stars === 1 && 'Poor'}
                {stars === 2 && 'Fair'}
                {stars === 3 && 'Good'}
                {stars === 4 && 'Very Good'}
                {stars === 5 && 'Excellent'}
              </span>
            )}
          </p>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Feedback (Optional)</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border rounded px-3 py-2 resize-none"
            rows={3}
            placeholder="Share your experience with this swap..."
            disabled={isLoading}
          />
        </div>

        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={stars === 0 || isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal; 