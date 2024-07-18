import VideoPlayer from "./components/VideoPlayer";

const App = () => {
  return (
    <VideoPlayer
      header={<></>}
      src="src/assets/Main.mp4"
      previewFolder="src/assets/previews"
      posterSrc="src/assets/Icon.jpg"
    />
  );
};

export default App;
