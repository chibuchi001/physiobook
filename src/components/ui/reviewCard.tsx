"use client";

interface ReviewCardProps {
  img: string;
  name: string;
  role: string;
  body: string;
  rating?: number;
}

export default function ReviewCard({
  img,
  name,
  role,
  body,
  rating = 5,
}: ReviewCardProps) {
  return (
    <figure className="relative w-80 shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="flex items-center gap-3">
        <img
          src={img}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-physio-500/40"
        />

        <div>
          <figcaption className="font-semibold text-foreground">
            {name}
          </figcaption>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>

      {/* STARS */}
      <div className="flex gap-1 mt-3">
        {Array.from({ length: rating }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className="w-4 h-4 fill-yellow-400"
          >
            <path d="M10 15l-5.878 3.09L5.24 12 1 7.91l6.061-.88L10 2l2.939 5.03L19 7.91 14.76 12l1.118 6.09z" />
          </svg>
        ))}
      </div>

      <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {body}
      </blockquote>

      {/* TRUST BADGE */}
      <div className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full bg-physio-500/10 text-physio-600 font-medium">
        Verified Patient
      </div>
    </figure>
  );
}
