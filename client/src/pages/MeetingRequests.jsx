import { useState, useEffect } from 'react';
import { 
  FaVideo, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUser, 
  FaCalendarAlt,
  FaExternalLinkAlt 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const MeetingRequests = () => {
  const navigate = useNavigate();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        setIsLoading(true);
        
        // Fetch both received and sent requests
        const [receivedResponse, sentResponse] = await Promise.all([
          api.get('/meetings/received', { headers: { token } }),
          api.get('/meetings/sent', { headers: { token } })
        ]);

        if (receivedResponse.data.status === 'success') {
          setReceivedRequests(receivedResponse.data.data || []);
        }
        
        if (sentResponse.data.status === 'success') {
          setSentRequests(sentResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching meeting requests:', error);
        toast.error('Failed to load meeting requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const fetchMeetingRequests = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setIsLoading(true);
      
      // Fetch both received and sent requests
      const [receivedResponse, sentResponse] = await Promise.all([
        api.get('/meetings/received', { headers: { token } }),
        api.get('/meetings/sent', { headers: { token } })
      ]);

      if (receivedResponse.data.status === 'success') {
        setReceivedRequests(receivedResponse.data.data || []);
      }
      
      if (sentResponse.data.status === 'success') {
        setSentRequests(sentResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching meeting requests:', error);
      toast.error('Failed to load meeting requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMeetingResponse = async (requestId, action) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      const response = await api.put(`/meetings/${requestId}/respond`, {
        action
      }, {
        headers: { token }
      });

      if (response.data.status === 'success') {
        toast.success(response.data.message || `Meeting request ${action}d successfully!`);
        
        // Refresh the requests
        await fetchMeetingRequests();
      } else {
        toast.error(response.data.message || `Failed to ${action} meeting request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing meeting request:`, error);
      toast.error(`Failed to ${action} meeting request`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'declined': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="w-4 h-4" />;
      case 'approved': return <FaCheck className="w-4 h-4" />;
      case 'declined': return <FaTimes className="w-4 h-4" />;
      case 'completed': return <FaCheck className="w-4 h-4" />;
      default: return <FaClock className="w-4 h-4" />;
    }
  };

  const startMeeting = (meetingUrl) => {
    window.open(meetingUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <FaVideo className="mr-3 text-blue-600" />
          Meeting Requests
        </h1>
        <p className="text-gray-600">
          Manage your video meeting requests and join approved meetings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('received')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'received'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Received Requests ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sent Requests ({sentRequests.length})
          </button>
        </nav>
      </div>

      {/* Received Requests Tab */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FaVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meeting requests</h3>
              <p className="text-gray-500">You haven&apos;t received any meeting requests yet.</p>
            </div>
          ) : (
            receivedRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FaUser className="text-gray-500 mr-2" size={16} />
                      <span className="font-semibold text-gray-800">{request.requester_name}</span>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Meeting about: &ldquo;{request.post_title}&rdquo;
                    </h3>
                    <p className="text-gray-600 mb-3">{request.message}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-1" size={12} />
                      Requested on {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleMeetingResponse(request.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
                    >
                      <FaCheck className="mr-2" size={14} />
                      Approve Meeting
                    </button>
                    <button
                      onClick={() => handleMeetingResponse(request.id, 'decline')}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
                    >
                      <FaTimes className="mr-2" size={14} />
                      Decline
                    </button>
                  </div>
                )}

                {request.status === 'approved' && request.meeting_url && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 mb-3 font-medium">Meeting approved! You can start the meeting now.</p>
                    <button
                      onClick={() => startMeeting(request.meeting_url)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
                    >
                      <FaExternalLinkAlt className="mr-2" size={14} />
                      Join Meeting Room
                    </button>
                  </div>
                )}

                {request.status === 'declined' && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-red-800 text-sm">This meeting request was declined.</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Sent Requests Tab */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FaVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sent requests</h3>
              <p className="text-gray-500">You haven&apos;t sent any meeting requests yet.</p>
            </div>
          ) : (
            sentRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="font-semibold text-gray-800">To: {request.author_name}</span>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Meeting about: &ldquo;{request.post_title}&rdquo;
                    </h3>
                    <p className="text-gray-600 mb-3">{request.message}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-1" size={12} />
                      Sent on {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {request.status === 'approved' && request.meeting_url && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 mb-3 font-medium">Your meeting request was approved!</p>
                    <button
                      onClick={() => startMeeting(request.meeting_url)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
                    >
                      <FaExternalLinkAlt className="mr-2" size={14} />
                      Join Meeting Room
                    </button>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-yellow-800 text-sm">Waiting for author&apos;s response...</p>
                  </div>
                )}

                {request.status === 'declined' && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-red-800 text-sm">This meeting request was declined by the author.</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingRequests;
