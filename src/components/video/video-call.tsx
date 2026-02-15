"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  CameraOff,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  Phone,
  PhoneOff,
  Send,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VideoCallProps {
  appointmentId: string;
  participantName: string;
  onEndCall?: () => void;
}

interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  timestamp: Date;
}

export function VideoCall({
  appointmentId,
  participantName,
  onEndCall,
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [callDuration, setCallDuration] = useState(0);

  // Initialize local media
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Simulate connection (in production, use WebSocket signaling)
        setTimeout(() => {
          setIsConnecting(false);
          setIsConnected(true);
        }, 2000);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setIsConnecting(false);
      }
    };

    initializeMedia();

    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing, restore camera
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
        }
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = stream.getVideoTracks()[0];
        
        if (localStreamRef.current && localVideoRef.current) {
          const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldVideoTrack) {
            localStreamRef.current.removeTrack(oldVideoTrack);
          }
          localStreamRef.current.addTrack(newVideoTrack);
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        
        setIsScreenSharing(false);
      } catch (error) {
        console.error("Error restoring camera:", error);
      }
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (localStreamRef.current && localVideoRef.current) {
          const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldVideoTrack) {
            oldVideoTrack.stop();
            localStreamRef.current.removeTrack(oldVideoTrack);
          }
          localStreamRef.current.addTrack(screenTrack);
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        
        screenTrack.onended = () => {
          toggleScreenShare();
        };
        
        setIsScreenSharing(true);
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    onEndCall?.();
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: "me",
      text: newMessage.trim(),
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Simulate response (in production, send via WebSocket)
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "them",
        text: "Thanks for the message! I'll demonstrate the exercise now.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, response]);
    }, 1500);
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] bg-gray-900 rounded-2xl overflow-hidden">
      {/* Main Video Area */}
      <div className="relative h-full">
        {/* Remote Video (Full Screen) */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
          {isConnected ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="w-24 h-24 rounded-full bg-physio-600 flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                  {participantName.charAt(0)}
                </div>
                <p className="text-xl font-medium">{participantName}</p>
                {isConnecting ? (
                  <p className="text-gray-400 mt-2">Connecting...</p>
                ) : (
                  <p className="text-gray-400 mt-2">Waiting to connect...</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-24 right-4 w-48 h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
          {isVideoOff ? (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <CameraOff className="w-8 h-8 text-gray-500" />
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
          )}
          <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
            You
          </div>
        </div>

        {/* Top Bar - Call Info */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white font-medium">{participantName}</span>
            <span className="text-white/70">|</span>
            <span className="text-white/70 font-mono">
              {formatDuration(callDuration)}
            </span>
          </div>

          {isScreenSharing && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Screen Sharing
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full",
              isMuted && "bg-red-500 hover:bg-red-600 text-white"
            )}
            onClick={toggleMute}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full",
              isVideoOff && "bg-red-500 hover:bg-red-600 text-white"
            )}
            onClick={toggleVideo}
          >
            {isVideoOff ? (
              <CameraOff className="w-5 h-5" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full",
              isScreenSharing && "bg-physio-500 hover:bg-physio-600 text-white"
            )}
            onClick={toggleScreenShare}
          >
            <Monitor className="w-5 h-5" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full",
              showChat && "bg-physio-500 hover:bg-physio-600 text-white"
            )}
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="w-14 h-14 rounded-full"
            onClick={endCall}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Chat</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChat(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">
                No messages yet. Start the conversation!
              </p>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[80%] p-3 rounded-xl",
                    msg.sender === "me"
                      ? "bg-physio-500 text-white ml-auto"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      msg.sender === "me" ? "text-white/70" : "text-gray-500"
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-physio-500"
              />
              <Button
                size="icon"
                className="rounded-full bg-physio-500 hover:bg-physio-600"
                onClick={sendMessage}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
