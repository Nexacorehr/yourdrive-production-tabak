import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface AudioPreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  maxSize?: number;
  headers?: Record<string, string>;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({
  url,
  fileName,
  onDownload,
  onError,
  maxSize = 50 * 1024 * 1024,
  headers,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [visualizerEnabled, setVisualizerEnabled] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setLoading(false);
      setDuration(audio.duration);
      if (visualizerEnabled) {
        initVisualizer();
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    const handleError = () => {
      setError("Failed to load audio. The format may not be supported.");
      onError?.("Failed to load audio");
      setLoading(false);
    };

    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [onError, visualizerEnabled]);

  const initVisualizer = () => {
    if (!audioRef.current || !canvasRef.current) return;

    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioRef.current);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const draw = () => {
      if (!isPlaying) return;

      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = "rgb(0, 0, 0)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSeek = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changePlaybackRate = () => {
    if (!audioRef.current) return;
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    audioRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, currentTime - 10);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, currentTime + 10);
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
        <p>Loading audio...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <h3>Unable to play audio</h3>
        <p>{error}</p>
        <ButtonGroup>
          <Button onClick={() => window.open(url, "_blank")}>
            Open in new tab
          </Button>
          {onDownload && (
            <Button $primary onClick={onDownload}>
              <Download size={16} />
              Download Audio
            </Button>
          )}
        </ButtonGroup>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <Audio ref={audioRef} src={url} preload="metadata" />

      <VisualizerContainer>
        <VisualizerCanvas
          ref={canvasRef}
          width={800}
          height={200}
          $visible={visualizerEnabled}
        />

        {!visualizerEnabled && (
          <Placeholder>
            <MusicIcon>🎵</MusicIcon>
            <FileName>{fileName}</FileName>
          </Placeholder>
        )}
      </VisualizerContainer>

      <Controls>
        <PlaybackInfo>
          <CurrentTime>{formatTime(currentTime)}</CurrentTime>
          <FileInfo>{fileName}</FileInfo>
          <Duration>{formatTime(duration)}</Duration>
        </PlaybackInfo>

        <SeekBar
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => handleSeek(parseFloat(e.target.value))}
        />

        <ControlButtons>
          <ButtonGroup>
            <ControlButton onClick={skipBackward}>
              <SkipBack size={20} />
            </ControlButton>

            <PlayButton onClick={togglePlay}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </PlayButton>

            <ControlButton onClick={skipForward}>
              <SkipForward size={20} />
            </ControlButton>
          </ButtonGroup>

          <ButtonGroup>
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

            <PlaybackRateButton onClick={changePlaybackRate}>
              {playbackRate}x
            </PlaybackRateButton>

            <ToggleButton
              onClick={() => setVisualizerEnabled(!visualizerEnabled)}
              $active={visualizerEnabled}
            >
              Visualizer
            </ToggleButton>

            {onDownload && (
              <ControlButton onClick={onDownload}>
                <Download size={20} />
              </ControlButton>
            )}
          </ButtonGroup>
        </ControlButtons>
      </Controls>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: white;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
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
  border-radius: 8px;
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

const Audio = styled.audio`
  display: none;
`;

const VisualizerContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  margin-bottom: 30px;
  overflow: hidden;
  position: relative;
`;

const VisualizerCanvas = styled.canvas<{ $visible: boolean }>`
  width: 100%;
  height: 100%;
  display: ${({ $visible }) => ($visible ? "block" : "none")};
`;

const Placeholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: white;
`;

const MusicIcon = styled.div`
  font-size: 64px;
  opacity: 0.8;
`;

const FileName = styled.div`
  font-size: 18px;
  font-weight: 500;
  opacity: 0.9;
  text-align: center;
  max-width: 400px;
  word-break: break-word;
`;

const Controls = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PlaybackInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 14px;
`;

const CurrentTime = styled.div`
  min-width: 50px;
`;

const FileInfo = styled.div`
  flex: 1;
  text-align: center;
  font-weight: 500;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 20px;
`;

const Duration = styled.div`
  min-width: 50px;
  text-align: right;
`;

const SeekBar = styled.input`
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: none;
  }
`;

const ControlButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PlayButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #764ba2;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

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
    background: white;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: none;
  }
`;

const PlaybackRateButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) =>
    $active ? "white" : "rgba(255, 255, 255, 0.2)"};
  color: ${({ $active }) => ($active ? "#764ba2" : "white")};
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${({ $active }) =>
      $active ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.3)"};
  }
`;

export default AudioPreview;
