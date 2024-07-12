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

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<HTMLParagraphElement>(null);

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

  useEffect(() => {
    const video = videoRef.current;
    const timer = timerRef.current;
    console.log(video, timer);
    if (!(video && timer)) return;

    video?.addEventListener("loadeddata", () => {
      timer.textContent = `${timeFormat(video.currentTime)}/${timeFormat(
        video.duration
      )}`;
    });

    video.addEventListener(
      "timeupdate",
      () =>
        (timer.textContent = `${timeFormat(video.currentTime)}/${timeFormat(
          video.duration
        )}`)
    );
  }, []);

  return (
    <div className={`video-container ${!isPlaying ? "paused" : ""}`}>
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
      <footer className="video-container__footer">
        <div className="video-container__footer__timeline-container"></div>
        <div className="video-container__footer__video-controls">
          <div className="video-container__footer__video-controls__left">
            <FaPlay className="play" color="white" onClick={togglePlayback} />
            <FaPause className="pause" onClick={togglePlayback} />
            {/* <MdVolumeMute />
          <MdVolumeDown /> */}
            <MdVolumeUp />
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
            <MdFullscreen />
            {/* <MdFullscreenExit /> */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
