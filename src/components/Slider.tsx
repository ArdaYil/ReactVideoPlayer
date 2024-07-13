import { useEffect, useRef, useState } from "react";

interface Props {
  min: number;
  max: number;
  volume: number;
  onChange: (value: number) => void;
}

const Slider = ({ min, max, volume, onChange }: Props) => {
  const sliderRef = useRef<HTMLInputElement>(null);

  const setSliderBackground = () => {
    const slider = sliderRef.current;

    if (!slider) return;

    const percentage = parseFloat(slider.value) / max;
    const rest = 1 - percentage;

    slider.style.background = `linear-gradient(90deg, rgb(255, 0, 0) ${
      percentage * 100
    }%, rgb(255, 255, 255) ${percentage * 100}%)`;
  };

  useEffect(() => {
    setSliderBackground();

    sliderRef.current?.addEventListener("input", () => {
      setSliderBackground();
    });

    return () => {
      sliderRef.current?.removeEventListener("input", () => {});
    };
  });

  return (
    <div className="slider-container">
      <input
        className="slider-container__slider"
        type="range"
        min={min}
        max={max}
        value={volume}
        step="any"
        onChange={(e) => onChange(parseFloat(e.target.value))}
        ref={sliderRef}
      />
    </div>
  );
};

export default Slider;
