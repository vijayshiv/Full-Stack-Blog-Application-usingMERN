import { useState } from 'react';
import { FaTimes, FaVideo, FaPaperPlane } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import api from '../config/api';

const MeetingRequestModal = ({ isOpen, onClose, authorName, authorId, postId, postTitle }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const token = sessionStorage.getItem('token');
    const requesterName = sessionStorage.getItem('name');
    
    if (!token || !requesterName) {
      toast.error('Please login to send meeting requests');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/meetings/request', {
        authorId,
        postId,
        postTitle,
        message: message.trim(),
        requesterName
      }, {
        headers: { token }
      });

      if (response.data.status === 'success') {
        toast.success('Meeting request sent successfully!');
        setMessage('');
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to send meeting request');
      }
    } catch (error) {
      console.error('Error sending meeting request:', error);
      toast.error('Failed to send meeting request');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <FaVideo className="text-blue-600 mr-2" size={20} />
            <h2 className="text-xl font-semibold">Request Meeting</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            Request a video meeting with <span className="font-semibold text-blue-600">{authorName}</span>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            About: <span className="italic">&ldquo;{postTitle}&rdquo;</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I really enjoyed your post and would love to discuss some ideas with you. Would you be interested in a quick video call?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              maxLength="500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <FaVideo className="inline mr-1" />
              This will send a notification to {authorName}. If they&apos;re online, they&apos;ll get it instantly. 
              If offline, we&apos;ll send an email notification.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" size={14} />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

MeetingRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  authorName: PropTypes.string.isRequired,
  authorId: PropTypes.number.isRequired,
  postId: PropTypes.string.isRequired,
  postTitle: PropTypes.string.isRequired
};

export default MeetingRequestModal;
