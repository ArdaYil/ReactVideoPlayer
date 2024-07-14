import { FaArrowLeft, FaRegBookmark } from "react-icons/fa";
import { BiLike, BiDislike } from "react-icons/bi";
import { FaPlay, FaPause } from "react-icons/fa6";
import {
  MdVolumeUp,
  MdVolumeDown,
  MdVolumeMute,
  MdFullscreen,
  MdFullscreenExit,
} from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { TbRewindForward10, TbRewindBackward10 } from "react-icons/tb";
import { useEffect, useRef, useState } from "react";
import Slider from "./components/Slider";

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<HTMLParagraphElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineThumbRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);

  const playVideo = () => {
    videoRef.current?.play();
    setIsPlaying(true);
  };

  const pauseVideo = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    const video = videoRef.current;

    if (!video) return;

    video.paused ? playVideo() : pauseVideo();
  };

  const toggleFullScreen = () => {
    const video = videoRef.current;

    if (!video) return;

    if (document.fullscreenElement == null) {
      videoContainerRef.current?.requestFullscreen();
      videoContainerRef.current?.classList.add("full-screen");
    } else {
      document.exitFullscreen();
      videoContainerRef.current?.classList.remove("full-screen");
    }
  };

  const doubleDigit = (digit: number) => (digit < 10 ? `0${digit}` : digit);

  const timeFormat = (duration: number) => {
    duration = Math.floor(duration);

    const seconds = duration % 60;
    const minutes = Math.floor(duration / 60) % 60;
    const hours = Math.floor(duration / 3600);

    return hours > 0
      ? `${doubleDigit(hours)}:${doubleDigit(minutes)}:${doubleDigit(seconds)}`
      : `${doubleDigit(minutes)}:${doubleDigit(seconds)}`;
  };

  const handleVolumeChange = (newVolume: number) => {
    setIsMuted(false);
    setVolume(newVolume);

    const video = videoRef.current;

    if (!video) return;

    video.volume = newVolume;
  };

  const renderVolumeIcon = () => {
    if (isMuted)
      return <MdVolumeMute onClick={toggleMute} className="volume-mute" />;

    if (volume > 0.5)
      return <MdVolumeUp onClick={toggleMute} className="volume-high" />;

    if (volume > 0)
      return <MdVolumeDown onClick={toggleMute} className="volume-low" />;

    return <MdVolumeMute onClick={toggleMute} className="volume-mute" />;
  };

  const setTime = () => {
    const timer = timerRef.current;
    const video = videoRef.current;

    if (!(timer && video)) return;

    timer.textContent = `${timeFormat(video.currentTime)}/${timeFormat(
      video.duration
    )}`;
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) return;

    if (isMuted) {
      setIsMuted(false);
      video.volume = volume;
    } else {
      setIsMuted(true);
      video.volume = 0;
    }
  };

  const handleTimelineUpdate = (e: MouseEvent) => {
    const video = videoRef.current;
    const timelineContainer = timelineContainerRef.current;
    const timeline = timelineRef.current;
    const previewImg = previewImgRef.current;

    if (!(video && timelineContainer && timeline && previewImg)) return;

    const rect = timeline.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;

    const previewImgNumber = Math.max(
      1,
      Math.floor((percent * video.duration) / 10)
    );

    const previewImgSrc = `src/assets/previews/preview${previewImgNumber}.jpg`;

    previewImg.src = previewImgSrc;
    timelineContainer.style.setProperty(
      "--preview-position",
      percent.toString()
    );

    previewImg.style.display = "block";

    if (isScrubbing) {
      e.preventDefault();
      timelineContainer.style.setProperty(
        "--progress-position",
        percent.toString()
      );
    }
  };

  let isScrubbing = false;
  let wasPaused = false;
  const toggleScrubbing = (e: MouseEvent) => {
    const timelineContainer = timelineContainerRef.current;
    const videoContainer = videoContainerRef.current;
    const video = videoRef.current;

    if (!(timelineContainer && videoContainer && video)) return;

    const rect = timelineContainer.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;

    isScrubbing = (e.buttons & 1) === 1;

    videoContainer.classList.toggle("scrubbing", isScrubbing);

    if (isScrubbing) {
      wasPaused = video.paused;
      pauseVideo();
    } else {
      video.currentTime = percent * video.duration;
      if (!wasPaused) playVideo();
    }

    handleTimelineUpdate(e);
  };

  useEffect(() => {
    let lastMouseMovementTime = Date.now();

    const video = videoRef.current;
    const timelineContainer = timelineContainerRef.current;
    const timeline = timelineRef.current;
    const previewImg = previewImgRef.current;
    const videoContainer = videoContainerRef.current;

    if (
      !(video && timelineContainer && timeline && previewImg && videoContainer)
    )
      return;

    if (isMuted) {
      video.volume = 0;
    }

    video?.addEventListener("loadeddata", setTime);

    video.addEventListener("timeupdate", () => {
      setTime();

      const percent = video.currentTime / video.duration;

      timelineContainer.style.setProperty(
        "--progress-position",
        percent.toString()
      );
    });

    videoContainer.addEventListener("mousedown", () => {
      togglePlayback();
    });

    timelineContainer.addEventListener("mousemove", handleTimelineUpdate);

    timelineContainer.addEventListener("mouseleave", () => {
      timelineContainer.style.setProperty("--preview-position", "0");
      previewImg.style.display = "none";
    });

    timelineContainer.addEventListener("mousedown", toggleScrubbing);
    document.addEventListener("mouseup", (e) => {
      if (isScrubbing) toggleScrubbing(e);
    });

    document.addEventListener("mousemove", (e) => {
      if (isScrubbing) handleTimelineUpdate(e);
    });

    videoContainerRef.current?.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        const footer = footerRef.current;

        if (!footer) return;

        footer.style.opacity = "1";

        lastMouseMovementTime = Date.now();
      }
    );

    videoContainerRef.current?.addEventListener("mouseleave", () => {
      const footer = footerRef.current;

      if (!footer) return;

      footer.style.opacity = "0";
    });

    window.setInterval(() => {
      if (Date.now() - lastMouseMovementTime > 3_000) {
        const footer = footerRef.current;

        if (!footer) return;

        footer.style.opacity = "0";
        timelineContainer.style.setProperty("--preview-position", "0");
      }
    }, 1_000);

    return () => {
      video.removeEventListener("loadeddata", () => {});
      video.removeEventListener("timeupdate", () => {});
    };
  }, []);

  return (
    <div
      ref={videoContainerRef}
      className={`video-container ${!isPlaying ? "paused" : ""}`}
    >
      <video
        ref={videoRef}
        className="video-container__video"
        src="src/assets/Main.mp4"
      />

      <header className="video-container__header">
        <div className="video-container__header__header-controls">
          <FaArrowLeft />
          <BiLike />
          <BiDislike />
          <FaRegBookmark />
        </div>
        <p className="video-container__header__title"></p>
      </header>
      <footer ref={footerRef} className="video-container__footer">
        <div
          ref={timelineContainerRef}
          className="video-container__footer__timeline-container"
        >
          <img
            ref={previewImgRef}
            className="video-container__footer__timeline-container__preview-img"
          />
          <div
            ref={timelineRef}
            className="video-container__footer__timeline-container__timeline timeline"
          >
            <div
              ref={timelineThumbRef}
              className="video-container__footer__timeline-container__timeline__thumb thumb"
            ></div>
          </div>
        </div>
        <div className="video-container__footer__video-controls">
          <div className="video-container__footer__video-controls__left">
            <FaPlay className="play" color="white" onClick={togglePlayback} />
            <FaPause className="pause" onClick={togglePlayback} />
            {renderVolumeIcon()}
            <Slider
              min={0}
              max={1}
              volume={volume}
              onChange={handleVolumeChange}
            />
            <TbRewindBackward10 />
            <TbRewindForward10 className="rewind-forward" />
          </div>
          <div className="video-container__footer__video-controls__right">
            <p
              ref={timerRef}
              className="video-container__footer__video-controls__video-time"
            >
              0:00/{timeFormat(videoRef.current?.duration as number)}
            </p>
            <IoSettingsSharp />
            <MdFullscreen
              className="enter-full-screen"
              onClick={toggleFullScreen}
            />
            <MdFullscreenExit
              className="exit-full-screen"
              onClick={toggleFullScreen}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
