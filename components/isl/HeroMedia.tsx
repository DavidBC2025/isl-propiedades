import type { ReactNode } from "react";
import { parseVideoUrl } from "@/lib/media";

type HeroMediaProps = {
  imageUrl?: string;
  videoUrl?: string;
  autoPlayVideo?: boolean;
  children?: ReactNode;
  className?: string;
};

export function HeroMedia({ imageUrl, videoUrl, autoPlayVideo = true, children, className }: HeroMediaProps) {
  const video = videoUrl ? parseVideoUrl(videoUrl) : { kind: "unknown" as const };
  const hasEmbeddableVideo = (video.kind === "youtube" || video.kind === "vimeo") && video.embedUrl;

  return (
    <section className={["relative isolate min-h-[34rem] overflow-hidden bg-isl-black md:min-h-screen", className].filter(Boolean).join(" ")}>
      {video.kind === "file" && videoUrl ? (
        <video className="absolute inset-0 size-full object-cover" autoPlay={autoPlayVideo} muted loop playsInline>
          <source src={videoUrl} />
        </video>
      ) : hasEmbeddableVideo ? (
        <iframe
          className="absolute inset-0 size-full border-0 object-cover"
          src={video.embedUrl}
          title="Video de propiedad"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : imageUrl ? (
        <img className="isl-kenburns absolute inset-0 size-full object-cover" src={imageUrl} alt="" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(198,168,124,0.35),transparent_35%),linear-gradient(135deg,#0A0A0A,#292521)]" aria-hidden="true" />
      )}
      <div className="isl-hero-overlay absolute inset-0" aria-hidden="true" />
      {children ? <div className="relative z-10 flex min-h-[34rem] md:min-h-screen">{children}</div> : null}
    </section>
  );
}
