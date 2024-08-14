import VideoPlayer from "./components/VideoPlayer";

const App = () => {
  return (
    <>
      <input type="file" id="input" />
      <VideoPlayer
        header={<></>}
        src="src/assets/Main.mp4"
        previewFolder="src/assets/previews"
      />
    </>
  );
};

export default App;
