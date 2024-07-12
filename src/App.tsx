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

const App = () => {
  return (
    <div className="video-container">
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
            <FaPlay color="white" />
            {/* <FaPause /> */}
            {/* <MdVolumeMute />
          <MdVolumeDown /> */}
            <MdVolumeUp />
            <TbRewindBackward10 />
            <TbRewindForward10 className="rewind-forward" />
          </div>
          <div className="video-container__footer__video-controls__right">
            <p className="video-container__footer__video-controls__video-time">
              0:00/0:00
            </p>
            <IoSettingsSharp />
            <MdFullscreen />
            {/* <MdFullscreenExit /> */}
          </div>
        </div>
      </footer>
      <video className="video-container__video" src="src/assets/Video.mp4" />
    </div>
  );
};

export default App;
