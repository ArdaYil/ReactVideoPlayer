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
import { ReactNode, useEffect, useRef, useState } from "react";
import Slider from "./Slider";
import useVideoStore from "../stores/VideoStore";

interface Props {
  src: string;
  previewFolder: string;
  posterSrc: string;
  header: ReactNode;
}

const VideoPlayer = ({ src, previewFolder, header, posterSrc }: Props) => {
  const [lastMouseMovementTime, setLastMouseMovementTime] = useState(
    Date.now()
  );
  const [lastSkipTime, setLastSkipTime] = useState(Date.now());
  const videoStore = useVideoStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<HTMLParagraphElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineThumbRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const clickableAreaRef = useRef<HTMLDivElement>(null);
  const thumbnailImageRef = useRef<HTMLImageElement>(null);
  const rightSkipRef = useRef<HTMLDivElement>(null);
  const leftSkipRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);

  let mouseX = 0;
  let mouseY = 0;

  const playVideo = () => {
    videoRef.current?.play();
    videoStore.play();
  };

  const pauseVideo = () => {
    videoRef.current?.pause();
    videoStore.pause();
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
    videoStore.unMute();
    videoStore.setVolume(newVolume);

    const video = videoRef.current;

    if (!video) return;

    video.volume = newVolume;
  };

  const renderVolumeIcon = () => {
    if (videoStore.isMuted)
      return <MdVolumeMute onClick={toggleMute} className="volume-mute" />;

    if (videoStore.volume > 0.5)
      return <MdVolumeUp onClick={toggleMute} className="volume-high" />;

    if (videoStore.volume > 0)
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

    if (videoStore.isMuted) {
      videoStore.unMute();
      video.volume = videoStore.volume;
    } else {
      videoStore.mute;
      video.volume = 0;
    }
  };

  const handleTimelineUpdate = (e: MouseEvent) => {
    const video = videoRef.current;
    const timelineContainer = timelineContainerRef.current;
    const timeline = timelineRef.current;
    const previewImg = previewImgRef.current;
    const thumbnailImage = thumbnailImageRef.current;

    if (
      !(video && timelineContainer && timeline && previewImg && thumbnailImage)
    )
      return;

    const rect = timeline.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;

    const previewImgNumber = Math.max(
      1,
      Math.floor((percent * video.duration) / 10)
    );

    const previewImgSrc = `${previewFolder}/preview${previewImgNumber}.jpg`;

    previewImg.src = previewImgSrc;
    timelineContainer.style.setProperty(
      "--preview-position",
      percent.toString()
    );

    previewImg.style.display = "block";

    if (isScrubbing) {
      e.preventDefault();

      thumbnailImage.src = previewImgSrc;

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

  const skip = (duration: number) => {
    const video = videoRef.current;
    let currentElement = null;

    if (!video) return;

    video.currentTime += duration;

    const rightSkip = rightSkipRef.current;
    const leftSkip = leftSkipRef.current;

    if (!(rightSkip && leftSkip)) return;

    if (duration > 0) {
      rightSkip.classList.add("skipping");
      leftSkip.classList.remove("skipping");
      currentElement = rightSkip;
    } else {
      leftSkip.classList.add("skipping");
      rightSkip.classList.remove("skipping");
      currentElement = leftSkip;
    }

    const paragraph = currentElement.querySelector("p");

    if (paragraph)
      paragraph.textContent = `${Math.abs(duration).toString()} Seconds`;

    setLastSkipTime(Date.now());

    enableControlsVisibility();
  };

  const increaseVolume = () => {
    const video = videoRef.current;
    const volumeContainer = volumeContainerRef.current;

    if (!(video && volumeContainer)) return;

    video.volume = Math.min(1, video.volume + 0.1);
    videoStore.increaseVolume(0.1);

    volumeContainer.classList.add("active");
  };

  const decreaseVolume = () => {
    const video = videoRef.current;

    if (!video) return;

    video.volume = Math.max(0, video.volume - 0.1);
    videoStore.decreaseVolume(0.1);
  };

  const enableControlsVisibility = () => {
    const footer = footerRef.current;
    const videoContainer = videoContainerRef.current;

    if (!(footer && videoContainer)) return;

    footer.style.opacity = "1";
    videoContainer.classList.remove("controls-hidden");

    setLastMouseMovementTime(Date.now());
  };

  const handleKeyEvent = (e: KeyboardEvent) => {
    const tagName = document.activeElement?.tagName.toLowerCase();

    if (
      e.key.toLocaleLowerCase() !== "tab" &&
      tagName !== "input" &&
      e.key.toLowerCase() != "f12"
    ) {
      e.preventDefault();
    }

    if (tagName === "input") return;

    switch (e.key.toLowerCase()) {
      case " ":
        if (tagName === "button") return;
      case "k":
        togglePlayback();
        enableControlsVisibility();
        break;

      case "f":
        toggleFullScreen();
        break;

      case "m":
        toggleMute();
        break;

      case "arrowright":
        skip(5);

        break;

      case "l":
        skip(15);
        break;

      case "arrowleft":
        skip(-5);
        break;

      case "j":
        skip(-15);
        break;

      case "arrowup":
        increaseVolume();
        break;

      case "arrowdown":
        decreaseVolume();
        break;
    }
  };

  const videoLoaded = () => {
    const video = videoRef.current;

    if (!video) return;

    setTime();

    video.volume = videoStore.volume;
  };

  const handleTimelineMouseLeave = () => {
    const timelineContainer = timelineContainerRef.current;
    const previewImg = previewImgRef.current;

    if (!(timelineContainer && previewImg)) return;

    timelineContainer.style.setProperty("--preview-position", "0");
    previewImg.style.display = "none";
  };

  const handleDocumentMouseMove = (e: MouseEvent) => {
    mouseX = e.x;
    mouseY = e.y;

    if (isScrubbing) handleTimelineUpdate(e);
  };

  const handleDocumentMouseUp = (e: MouseEvent) => {
    if (isScrubbing) toggleScrubbing(e);
  };

  const handleVideoMouseMove = () => {
    const footer = footerRef.current;

    if (!footer) return;

    enableControlsVisibility();
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    const timelineContainer = timelineContainerRef.current;

    if (!(video && timelineContainer)) return;

    setTime();

    const percent = video.currentTime / video.duration;

    timelineContainer.style.setProperty(
      "--progress-position",
      percent.toString()
    );
  };

  const handleVideoMouseLeave = () => {
    const footer = footerRef.current;
    const videoContainer = videoContainerRef.current;
    const volumeContainer = volumeContainerRef.current;

    if (!(footer && videoContainer && volumeContainer)) return;

    footer.style.opacity = "0";
    videoContainer.classList.add("controls-hidden");
    volumeContainer.classList.remove("active");
  };

  const videoControlsVisibilityHandler = () => {
    const timelineContainer = timelineContainerRef.current;
    const videoContainer = videoContainerRef.current;

    if (!(timelineContainer && videoContainer)) return;

    const { x, y, width, height } = timelineContainer.getBoundingClientRect();

    if (mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height)
      return;

    if (Date.now() - lastMouseMovementTime > 3_000) {
      const footer = footerRef.current;
      const volumeContainer = volumeContainerRef.current;

      if (!(footer && volumeContainer)) return;

      videoContainer.classList.add("controls-hidden");
      footer.style.opacity = "0";
      timelineContainer.style.setProperty("--preview-position", "0");
      volumeContainer.classList.remove("active");
    }
  };

  const skipVisibilityHandler = () => {
    const currentElement = document.querySelector(".skipping");

    if (!currentElement) return;

    if (Date.now() - lastSkipTime >= 1_500)
      currentElement.classList.remove("skipping");
  };

  useEffect(() => {
    const video = videoRef.current;
    const timelineContainer = timelineContainerRef.current;
    const timeline = timelineRef.current;
    const previewImg = previewImgRef.current;
    const videoContainer = videoContainerRef.current;
    const clickableArea = clickableAreaRef.current;

    if (
      !(
        video &&
        clickableArea &&
        timelineContainer &&
        timeline &&
        previewImg &&
        videoContainer
      )
    )
      return;

    if (videoStore.isMuted) {
      video.volume = 0;
    }

    video?.addEventListener("loadeddata", videoLoaded);

    video.addEventListener("timeupdate", handleVideoTimeUpdate);

    clickableArea.addEventListener("mousedown", togglePlayback);

    window.addEventListener("keydown", handleKeyEvent);

    timelineContainer.addEventListener("mousemove", handleTimelineUpdate);

    timelineContainer.addEventListener("mouseleave", handleTimelineMouseLeave);

    timelineContainer.addEventListener("mousedown", toggleScrubbing);

    document.addEventListener("mouseup", handleDocumentMouseUp);

    document.addEventListener("mousemove", handleDocumentMouseMove);

    videoContainer.addEventListener("mousemove", handleVideoMouseMove);

    videoContainer.addEventListener("mouseleave", handleVideoMouseLeave);

    const intervalId = window.setInterval(() => {
      videoControlsVisibilityHandler();
      skipVisibilityHandler();
    }, 1_000);

    return () => {
      video.removeEventListener("loadeddata", videoLoaded);
      video.removeEventListener("loadeddata", () => {});
      video.removeEventListener("timeupdate", () => {});
      clickableArea.removeEventListener("mousedown", togglePlayback);
      window.removeEventListener("keydown", handleKeyEvent);
      video.removeEventListener("timeupdate", handleVideoTimeUpdate);
      timelineContainer.removeEventListener(
        "mouseleave",
        handleTimelineMouseLeave
      );

      videoContainer.removeEventListener("mouseleave", handleVideoMouseLeave);
      window.clearInterval(intervalId);

      document.removeEventListener("mousemove", handleDocumentMouseMove);
    };
  }, [
    videoStore.isMuted,
    videoStore.isPlaying,
    videoStore.volume,
    lastMouseMovementTime,
    lastSkipTime,
  ]);

  return (
    <div
      ref={videoContainerRef}
      className={`video-container ${!videoStore.isPlaying ? "paused" : ""}`}
    >
      <video
        poster={posterSrc}
        ref={videoRef}
        className="video-container__video"
        src={src}
      />

      <div ref={leftSkipRef} className="skip left">
        <div className="arrows">
          <div className="arrow left"></div>
          <div className="arrow left"></div>
          <div className="arrow left"></div>
        </div>
        <p>5 Seconds</p>
      </div>
      <div ref={rightSkipRef} className="skip right">
        <div className="arrows">
          <div className="arrow a"></div>
          <div className="arrow"></div>
          <div className="arrow"></div>
        </div>
        <p>5 Seconds</p>
      </div>

      <img ref={thumbnailImageRef} className="video-container__thumbnail-img" />

      <header className="video-container__header">
        <div className="video-container__header__header-controls">{header}</div>
        <p className="video-container__header__title"></p>
      </header>
      <div
        ref={clickableAreaRef}
        className="video-container__clickable-area"
      ></div>
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
            <div ref={volumeContainerRef} className="volume-container">
              {renderVolumeIcon()}
              <Slider
                className="volume-slider"
                min={0}
                max={1}
                volume={videoStore.volume}
                onChange={handleVolumeChange}
              />
            </div>
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

export default VideoPlayer;
