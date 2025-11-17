import React from "react";
import ReactPlayer from "react-player";

export default function VideoPlayer({ url }) {
  return (
    <div className="w-full h-96">
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
}
