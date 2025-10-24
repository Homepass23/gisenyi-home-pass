'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';

interface ReviewFormProps {
  accommodationId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ accommodationId, onReviewSubmitted }) => {
  const { user, isCustomer } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to submit a review');
      return;
    }
    
    if (!isCustomer) {
      toast.error('Only customers can submit reviews');
      return;
    }
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accommodation_id: accommodationId,
          rating,
          comment,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Review submitted successfully!');
        setRating(0);
        setComment('');
        onReviewSubmitted();
      } else {
        toast.error(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-serif font-bold mb-4">Leave a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating
          </label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="text-gray-300 hover:text-yellow-400 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !user || !isCustomer}
          className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 font-medium ${
            isSubmitting || !user || !isCustomer
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-sky-600 text-white hover:bg-sky-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        
        {!user && (
          <p className="text-sm text-gray-500 mt-2">
            Please log in to submit a review.
          </p>
        )}
        
        {user && !isCustomer && (
          <p className="text-sm text-gray-500 mt-2">
            Only customers who have stayed at this accommodation can submit reviews.
          </p>
        )}
      </form>
    </div>
  );
};

export default ReviewForm;