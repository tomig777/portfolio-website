import { useState } from 'react';

export default function CaseStudyMedia({ project }) {
  const [videoFailed, setVideoFailed] = useState(false);
  if (!project.video || videoFailed) {
    return <img src={project.image} alt={`${project.title} project artwork`} decoding="async" />;
  }

  return (
    <video autoPlay muted loop playsInline preload="metadata" poster={project.image} aria-label={`${project.title} case study video`} onError={() => setVideoFailed(true)}>
      <source src={project.video} type="video/mp4" onError={() => setVideoFailed(true)} />
    </video>
  );
}
