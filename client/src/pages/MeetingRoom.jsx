import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaVideo, 
  FaVideoSlash, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaDesktop,
  FaPhone,
  FaCopy,
  FaUsers
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSocket } from '../context/SocketContext';
import api from '../config/api';

const MeetingRoom = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  
  // Meeting state
  const [meetingData, setMeetingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otherParticipants, setOtherParticipants] = useState([]);
  
  // WebRTC state
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [peerConnections, setPeerConnections] = useState(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef(new Map());

  // WebRTC Configuration
  const rtcConfig = useMemo(() => ({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }), []);

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    peerConnections.forEach(pc => {
      pc.close();
    });
    
    if (socket && socket.emit && requestId) {
      socket.emit('leaveMeeting', requestId);
    }
  };

  const fetchMeetingData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await api.get(`/meetings/${requestId}`, {
        headers: { token }
      });

      if (response.data.status === 'success') {
        const meeting = response.data.data;
        
        if (meeting.status !== 'approved') {
          setError('This meeting is not approved or no longer available');
          return;
        }
        
        setMeetingData(meeting);
      } else {
        setError('Meeting not found');
      }
    } catch (error) {
      console.error('Error fetching meeting data:', error);
      setError('Failed to load meeting data');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWebRTC = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setConnectionState('connected');

      // Join the meeting room via socket
      if (socket && socket.emit && requestId) {
        socket.emit('joinMeeting', requestId);
      }

    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const createPeerConnection = useCallback(async (otherUserId) => {
    const pc = new RTCPeerConnection(rtcConfig);
    
    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(otherUserId, remoteStream);
        return newMap;
      });
      
      // Set video element source
      const videoElement = remoteVideosRef.current.get(otherUserId);
      if (videoElement) {
        videoElement.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && socket.emit) {
        socket.emit('iceCandidate', {
          meetingId: requestId,
          targetUserId: otherUserId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with user ${otherUserId}:`, pc.connectionState);
      setConnectionState(pc.connectionState);
    };

    // Store peer connection
    setPeerConnections(prev => {
      const newMap = new Map(prev);
      newMap.set(otherUserId, pc);
      return newMap;
    });

    return pc;
  }, [localStream, socket, requestId, remoteVideosRef, rtcConfig]);

  const handleUserJoined = useCallback(async (data) => {
    console.log('User joined:', data);
    setOtherParticipants(prev => [...prev, data]);
    
    // Create peer connection and send offer
    const pc = await createPeerConnection(data.userId);
    
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      if (socket && socket.emit) {
        socket.emit('webrtcOffer', {
          meetingId: requestId,
          targetUserId: data.userId,
          offer: offer
        });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [createPeerConnection, socket, requestId]);

  const handleWebRTCOffer = useCallback(async (data) => {
    console.log('Received WebRTC offer:', data);
    
    const pc = await createPeerConnection(data.from);
    
    try {
      await pc.setRemoteDescription(data.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      if (socket && socket.emit) {
        socket.emit('webrtcAnswer', {
          meetingId: requestId,
          targetUserId: data.from,
          answer: answer
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, [createPeerConnection, socket, requestId]);

  const handleWebRTCAnswer = useCallback(async (data) => {
    console.log('Received WebRTC answer:', data);
    
    const pc = peerConnections.get(data.from);
    if (pc) {
      try {
        await pc.setRemoteDescription(data.answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  }, [peerConnections]);

  const handleICECandidate = useCallback(async (data) => {
    console.log('Received ICE candidate:', data);
    
    const pc = peerConnections.get(data.from);
    if (pc) {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }, [peerConnections]);

  const handleUserLeft = useCallback((data) => {
    console.log('User left:', data);
    
    // Close peer connection
    const pc = peerConnections.get(data.userId);
    if (pc) {
      pc.close();
      setPeerConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    }
    
    // Remove remote stream
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(data.userId);
      return newMap;
    });
    
    // Remove from participants
    setOtherParticipants(prev => prev.filter(p => p.userId !== data.userId));
  }, [peerConnections]);

  // Initialize meeting data once
  useEffect(() => {
    const initMeeting = async () => {
      await fetchMeetingData();
      await initializeWebRTC();
    };
    
    initMeeting();
    
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  // Setup socket event listeners when socket is available
  useEffect(() => {
    if (!socket) return;
    
    console.log('Setting up socket event listeners for meeting room');
    
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('webrtcOffer', handleWebRTCOffer);
    socket.on('webrtcAnswer', handleWebRTCAnswer);
    socket.on('iceCandidate', handleICECandidate);
    
    return () => {
      console.log('Cleaning up socket event listeners');
      if (socket && socket.off) {
        socket.off('userJoined', handleUserJoined);
        socket.off('userLeft', handleUserLeft);
        socket.off('webrtcOffer', handleWebRTCOffer);
        socket.off('webrtcAnswer', handleWebRTCAnswer);
        socket.off('iceCandidate', handleICECandidate);
      }
    };
  }, [socket, handleUserJoined, handleUserLeft, handleWebRTCOffer, handleWebRTCAnswer, handleICECandidate]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track with screen share in all peer connections
      peerConnections.forEach(async (pc) => {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });

      setIsScreenSharing(true);
      
      // Update local video to show screen share
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
      
      // Handle screen share end
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

    } catch (error) {
      console.error('Error starting screen share:', error);
      toast.error('Failed to start screen sharing');
    }
  };

  const stopScreenShare = async () => {
    if (localStream && peerConnections.size > 0) {
      // Replace screen share with camera in all peer connections
      const videoTrack = localStream.getVideoTracks()[0];
      peerConnections.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      });
    }
    
    // Restore local video
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    
    setIsScreenSharing(false);
  };

  const copyMeetingLink = () => {
    const meetingLink = window.location.href;
    navigator.clipboard.writeText(meetingLink);
    toast.success('Meeting link copied to clipboard!');
  };

  const endMeeting = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        await api.put(`/meetings/${requestId}/complete`, {}, {
          headers: { token }
        });
      }
    } catch (error) {
      console.error('Error ending meeting:', error);
    } finally {
      cleanup();
      navigate('/meetings');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p>Loading meeting room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <FaVideo className="mx-auto mb-4 text-4xl text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Meeting Unavailable</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/meetings')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
          >
            Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-white">
          <h1 className="text-xl font-semibold">
            Meeting: {meetingData?.post_title}
          </h1>
          <p className="text-gray-300 text-sm">
            With {meetingData?.requester_name} and {meetingData?.author_name}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center px-3 py-1 rounded-full text-xs ${
            connectionState === 'connected' ? 'bg-green-600' : 
            connectionState === 'connecting' ? 'bg-yellow-600' : 'bg-red-600'
          }`}>
            <div className="w-2 h-2 rounded-full bg-white mr-2"></div>
            <span className="text-white capitalize">{connectionState}</span>
          </div>
          <button
            onClick={copyMeetingLink}
            className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700"
            title="Copy meeting link"
          >
            <FaCopy size={16} />
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Local Video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            You {isScreenSharing && '(Screen Sharing)'}
          </div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <FaVideoSlash className="text-gray-400 text-4xl" />
            </div>
          )}
        </div>

        {/* Remote Videos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
            <div key={userId} className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={(el) => {
                  if (el && stream) {
                    el.srcObject = stream;
                    remoteVideosRef.current.set(userId, el);
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {otherParticipants.find(p => p.userId === userId)?.name || 'Participant'}
              </div>
            </div>
          ))}
          
          {remoteStreams.size === 0 && (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <FaUsers className="text-4xl mb-2 mx-auto" />
                  <p>Waiting for other participants...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              isAudioEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
            } text-white transition-colors`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              isVideoEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
            } text-white transition-colors`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
          </button>

          <button
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className={`p-3 rounded-full ${
              isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
            } text-white transition-colors`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <FaDesktop size={20} />
          </button>

          <button
            onClick={endMeeting}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="End meeting"
          >
            <FaPhone size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
