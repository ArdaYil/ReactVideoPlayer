import { useEffect, useRef, useState } from "react";

interface Props {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  className: string;
}

const Slider = ({ className = "", min, max, volume, onChange }: Props) => {
  return (
    <div className="slider-container">
      <input
        type="range"
        min={min}
        max={max}
        value={volume}
        step="any"
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
};

export default Slider;
