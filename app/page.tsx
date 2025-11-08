"use client";

import AlienChaseCanvas from "@/components/AlienChaseCanvas";

export default function Home() {
  return (
    <main className="page">
      <div className="overlay">
        <div className="titleBlock">
          <h1>Alien Escape: Procedural AI Video</h1>
          <p>
            Witness a tense pursuit rendered in real time by generative motion logic. An alien races
            through a neon valley while humans close in, and shimmering tears trace the fear of the
            unknown.
          </p>
        </div>
        <AlienChaseCanvas />
      </div>
    </main>
  );
}
