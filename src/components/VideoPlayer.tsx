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

  let lastMouseMovementTime = Date.now();

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

    if (!video) return;

    video.currentTime += duration;
  };

  const increaseVolume = () => {
    const video = videoRef.current;

    if (!video) return;
    console.log(video.volume);
    video.volume = Math.min(1, video.volume + 0.1);
    videoStore.increaseVolume(0.1);
  };

  const decreaseVolume = () => {
    const video = videoRef.current;

    if (!video) return;
    console.log(video.volume);
    video.volume = Math.max(0, video.volume - 0.1);
    videoStore.decreaseVolume(0.1);
  };

  const enableControlsVisibility = () => {
    const footer = footerRef.current;

    if (!footer) return;

    footer.style.opacity = "1";

    lastMouseMovementTime = Date.now();
  };

  const handleKeyEvent = (e: KeyboardEvent) => {
    const tagName = document.activeElement?.tagName.toLowerCase();

    if (e.key.toLocaleLowerCase() !== "tab" && tagName !== "input") {
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

    video.addEventListener("timeupdate", () => {
      setTime();

      const percent = video.currentTime / video.duration;

      timelineContainer.style.setProperty(
        "--progress-position",
        percent.toString()
      );
    });

    clickableArea.addEventListener("mousedown", togglePlayback);

    window.addEventListener("keydown", handleKeyEvent);

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

        enableControlsVisibility();
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

    document.getElementById("input")?.addEventListener("change", function () {
      const media = URL.createObjectURL((this as any).files[0]);
      const video = videoRef.current;

      if (!video) return;

      video.src = media;
      video.play();
    });

    return () => {
      video.removeEventListener("loadeddata", () => {});
      video.removeEventListener("timeupdate", () => {});
      clickableArea.removeEventListener("mousedown", togglePlayback);
      window.removeEventListener("keydown", handleKeyEvent);
    };
  }, [videoStore.isMuted, videoStore.isPlaying, videoStore.volume]);

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
            <div className="volume-container">
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
