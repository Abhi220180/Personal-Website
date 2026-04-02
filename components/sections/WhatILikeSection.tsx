import { whatILikeParagraphs } from "@/lib/content";

export function WhatILikeSection() {
  return (
    <section id="what-i-like" className="section-rule">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 md:px-10 md:py-28">
        <p className="editorial-kicker text-xs text-mist">What I Like Building</p>

        <div className="mt-8 max-w-4xl space-y-8">
          {whatILikeParagraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="editorial-display text-[1.25rem] leading-[1.7] text-graphite md:text-[1.5rem] md:leading-[1.75]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
