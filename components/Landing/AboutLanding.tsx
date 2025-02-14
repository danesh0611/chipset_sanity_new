"use client";
import React from "react";
import ManSitting from "../Reusable/ManSitting";
import PairSitting from "../Reusable/PairSitting";
import { FlipWords } from "../ui/flip-words";
import { ParagraphEffect } from "../ui/pargraph-effect";

const AboutLanding = () => {
  return (
    <div className="w-full">
      <div className="p-6 md:text-4xl w-full font-bold text-xl lg:text-[50px] md:font-semibold md:px-24 md:py-12 font-heading">
        <div className="leading-[70px]">
          <p className="font-extralight">
            Thats why{" "}
            <span data-aos="fade-right" className="font-extrabold">
              CH<span className="text-[#f6a339]">i</span>PSET
            </span>{" "}
            is more than just a name !!
          </p>
          Built{" "}
          <FlipWords
            duration={300}
            className="text-[#f6a339] font-extralight"
            words={[
              "Better",
              "Unique",
              "Innovative",
              "Creative",
              "Collaborative",
              "Technical",
              "Advanced",
              "Networking",
            ]}
          />
          ,<br />
        </div>
      </div>
      <div className="flex flex-col md:flex-row h-full px-8 text-justify mt-6">
        <div className="flex flex-col justify-start w-full h-full flex-1 items-center text-black">
          <p
            data-aos="fade-up"
            className="lg:p-4 md:pt-2 lg:text-[14px] md:text-[12px] text-center italic text-[10px] mt-2 lg:mt-12"
          >
            Progress begins with unity, but true success thrives through
            collaboration. Together, we embark on a journey of innovation, where
            every step forward is a testament to our collective strength and
            determination.
          </p>
          {/* Both paragraphs are now inside our ParagraphEffect card */}
          <ParagraphEffect title="Our Mission">
            <p>
              CHiPSET is a dynamic force, uniting a diverse range of talents under
              a single banner. Comprised of hackers, innovators, programmers,
              scriptwriters, entrepreneurs, and technocrats, we are a non-profit
              organization driven by a collective passion for catalyzing positive
              change globally.
            </p>
            <p style={{ marginTop: "1rem" }}>
              Central to our philosophy is a strong belief in the power of
              collaboration to drive transformation. We envision a world without
              boundaries, where innovation flourishes, barriers dissolve, and
              every individual potential is fully unleashed. With an unwavering
              dedication to excellence, we strive to cultivate a community of
              curious minds—a growing family united by an insatiable thirst for
              knowledge and advancement.
            </p>
          </ParagraphEffect>
        </div>
        <div className="hidden md:flex w-full mb-12 h-full flex-1 justify-center">
          <div className="scale-75">
            <PairSitting />
          </div>
        </div>
        <div className="md:hidden flex w-full mb-12 h-full flex-1 justify-center">
          <video
            className="mt-12 md:hidden w-[3000px] mix-blend-multiply h-full rounded-md overflow-hidden"
            autoPlay
            muted
            loop
          >
            <source
              src="https://res.cloudinary.com/dzzvomj39/video/upload/v1714401007/Chipset_Intro_Year_2024_vbbz2d.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </div>
    </div>
  );
};

export default AboutLanding;
