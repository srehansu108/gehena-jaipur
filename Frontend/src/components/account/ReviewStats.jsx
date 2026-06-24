// src/components/account/ReviewStats.jsx - PINK THEME ✅
import { Star, StarHalf, MessageSquare, ThumbsUp, Clock, Sparkles } from 'lucide-react';

export function ReviewStats({ data }) {
  if (!data || data.totalReviews === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-pink-50/30 to-rose-50/30 rounded-xl border border-pink-100">
        <div className="relative inline-block">
          <MessageSquare size={64} className="mx-auto text-pink-300 mb-4" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-pink-400 animate-pulse" />
        </div>
        <h3 className="text-xl font-serif text-gray-700">No <span className="text-pink-gradient">Reviews</span> Yet</h3>
        <p className="text-gray-500 mt-2">Review products you've purchased to help others.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-pink-500" />
        <h2 className="text-xl font-serif text-gray-900">My <span className="text-pink-gradient">Reviews</span></h2>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <Star size={24} className="text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.averageRating?.toFixed(1) || '0.0'}</p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <MessageSquare size={24} className="text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.totalReviews}</p>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <ThumbsUp size={24} className="text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.totalLikes || 0}</p>
              <p className="text-sm text-gray-600">Total Likes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-gradient-to-br from-pink-50/30 to-rose-50/30 rounded-xl p-4 mb-6 border border-pink-100">
        <h4 className="font-medium text-gray-700 mb-3">Rating Distribution</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = data.ratingDistribution?.[rating] || 0;
            const percentage = data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3 group">
                <span className="text-sm text-gray-600 w-8">{rating} ★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-pink-400 to-rose-400 rounded-full h-2 transition-all duration-700 group-hover:scale-x-105"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-10">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Recent Reviews</h4>
        {data.recentReviews?.map((review, index) => (
          <div key={index} className="border border-pink-100 rounded-xl p-4 hover:shadow-pink-md hover:border-pink-200 transition-all duration-300 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        size={16}
                        className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      dateStyle: 'medium'
                    })}
                  </span>
                </div>
                <p className="font-medium text-gray-900 mt-1">{review.productName}</p>
                <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <ThumbsUp size={14} className="text-pink-400" /> {review.likes || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}