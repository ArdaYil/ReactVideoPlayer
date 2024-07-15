import VideoPlayer from "./components/VideoPlayer";

const App = () => {
  return (
    <VideoPlayer
      src="src/assets/Main.mp4"
      previewFolder="src/assets/previews"
    />
  );
};

export default App;
