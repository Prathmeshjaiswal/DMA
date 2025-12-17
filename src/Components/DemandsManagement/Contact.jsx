
import React from "react";
import { useNavigate } from "react-router-dom";
import {WORKINPROGRESS} from ".../assets/Progress.png"
export default function Contact() {
  const navigate = useNavigate();

  return (
    <div>

      <img src={WORKINPROGRESS}
        alt="WORK IN PROGRESS"
        className="w-64 h-64 object-cover rounded-lg shadow-lg"
      />

      </div>

  );
};