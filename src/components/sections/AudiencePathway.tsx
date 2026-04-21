import React from "react";
import Button from "@/components/ui/Button";

export default function AudiencePathway() {
  return (
    <section
      style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
      aria-label="Audience pathways"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left pathway: For Industry Partners */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-10 py-20 text-center text-white"
          style={{ backgroundColor: "#0c0c48" }}
        >
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#00caef] mb-3">
              Industry Partners
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">
              Work With Us
            </h2>
            <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
              Partner with HNU to run clinical trials, access our participant
              network, and leverage our state-of-the-art research facilities.
              We work with pharmaceutical companies, biotech firms, and
              academic institutions to bring studies to life.
            </p>
            <ul className="text-sm text-gray-400 mb-10 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-[#00caef] mt-0.5">&#10003;</span>
                Clinical trial design &amp; management
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00caef] mt-0.5">&#10003;</span>
                Access to pre-screened participant pools
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00caef] mt-0.5">&#10003;</span>
                Advanced on-site research facilities
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00caef] mt-0.5">&#10003;</span>
                Regulatory &amp; ethics expertise
              </li>
            </ul>
            <Button href="/collaborations" variant="secondary" size="lg">
              Explore Collaborations
            </Button>
          </div>
        </div>

        {/* Right pathway: For Study Participants */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-10 py-20 text-center"
          style={{ backgroundColor: "#00caef", color: "#0c0c48" }}
        >
          <div className="max-w-md">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#0c0c48", opacity: 0.6 }}
            >
              Study Participants
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">
              Join a Study
            </h2>
            <p className="text-base sm:text-lg mb-8 leading-relaxed" style={{ color: "#0c0c48", opacity: 0.85 }}>
              Healthy volunteers and patients are the heart of what we do.
              Participating in a study is safe, rewarding, and helps advance
              medicine for everyone. Find a study that fits your life.
            </p>
            <ul
              className="text-sm mb-10 space-y-2 text-left"
              style={{ color: "#0c0c48", opacity: 0.75 }}
            >
              <li className="flex items-start gap-2">
                <span style={{ opacity: 1, color: "#0c0c48" }} className="mt-0.5 font-bold">&#10003;</span>
                Ethically approved &amp; independently monitored
              </li>
              <li className="flex items-start gap-2">
                <span style={{ opacity: 1, color: "#0c0c48" }} className="mt-0.5 font-bold">&#10003;</span>
                Compensation provided for your time
              </li>
              <li className="flex items-start gap-2">
                <span style={{ opacity: 1, color: "#0c0c48" }} className="mt-0.5 font-bold">&#10003;</span>
                Regular health check-ups included
              </li>
              <li className="flex items-start gap-2">
                <span style={{ opacity: 1, color: "#0c0c48" }} className="mt-0.5 font-bold">&#10003;</span>
                Contribute to life-changing research
              </li>
            </ul>
            <Button href="/studies" variant="primary" size="lg">
              Find a Study
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
