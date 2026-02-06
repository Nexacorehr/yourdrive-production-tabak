import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  RotateCcw,
} from "lucide-react";

interface VideoPreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  maxSize?: number;
  headers?: Record<string, string>;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  url,
  fileName,
  onDownload,
  onError,
  maxSize = 50 * 1024 * 1024,
  headers,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setLoading(false);
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    const handleError = () => {
      setError("Failed to load video. The format may not be supported.");
      onError?.("Failed to load video");
      setLoading(false);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [onError]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleSeek = (value: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (value: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changePlaybackRate = () => {
    if (!videoRef.current) return;
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    videoRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading video...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <h3>Unable to play video</h3>
        <p>{error}</p>
        <ButtonGroup>
          <Button onClick={() => window.open(url, "_blank")}>
            Open in new tab
          </Button>
          {onDownload && (
            <Button $primary onClick={onDownload}>
              <Download size={16} />
              Download Video
            </Button>
          )}
        </ButtonGroup>
      </ErrorContainer>
    );
  }

  return (
    <Container onMouseMove={handleMouseMove}>
      <Video ref={videoRef} src={url} controls={false} onClick={togglePlay} />

      {showControls && (
        <ControlsOverlay>
          <TopControls>
            <FileName>{fileName}</FileName>
            <PlaybackRate onClick={changePlaybackRate}>
              {playbackRate}x
            </PlaybackRate>
          </TopControls>

          <CenterControls>
            <PlayButton onClick={togglePlay}>
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </PlayButton>
          </CenterControls>

          <BottomControls>
            <TimeInfo>
              {formatTime(currentTime)} / {formatTime(duration)}
            </TimeInfo>

            <SeekBar
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
            />

            <RightControls>
              <ControlButton onClick={toggleMute}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </ControlButton>

              <VolumeSlider
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              />

              <ControlButton onClick={toggleFullscreen}>
                <Maximize2 size={20} />
              </ControlButton>

              {onDownload && (
                <ControlButton onClick={onDownload}>
                  <Download size={20} />
                </ControlButton>
              )}
            </RightControls>
          </BottomControls>
        </ControlsOverlay>
      )}

      {!isPlaying && !showControls && (
        <PlayOverlay onClick={togglePlay}>
          <Play size={48} />
        </PlayOverlay>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  overflow: hidden;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  background: #000;
  color: white;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  gap: 16px;
  background: white;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $primary }) =>
    $primary
      ? `
    background: #1a73e8;
    color: white;
    
    &:hover {
      background: #0d62d9;
    }
  `
      : `
    background: white;
    color: #202124;
    border: 1px solid #dadce0;
    
    &:hover {
      background: #f8f9fa;
    }
  `}
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
`;

const ControlsOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: opacity 0.3s;
`;

const TopControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
`;

const PlaybackRate = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const CenterControls = styled.div`
  display: flex;
  justify-content: center;
`;

const PlayButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const BottomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
`;

const TimeInfo = styled.div`
  font-size: 14px;
  min-width: 100px;
`;

const SeekBar = styled.input`
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #1a73e8;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #1a73e8;
    cursor: pointer;
    border: none;
  }
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const VolumeSlider = styled.input`
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #1a73e8;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #1a73e8;
    cursor: pointer;
    border: none;
  }
`;

const PlayOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

export default VideoPreview;
