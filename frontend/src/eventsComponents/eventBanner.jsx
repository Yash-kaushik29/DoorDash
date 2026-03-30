import React, { useEffect, useState } from "react";
import { IPL_TEAMS } from "./iplTeams";
import TeamSelector from "./TeamSelector";
import "./eventBanner.css";
import { useMemo } from "react";

const EventBanner = () => {
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("favTeam");
    if (stored) setTeamId(stored);
  }, []);

  const rainItems = useMemo(() => {
    return Array.from({ length: 12 }).map((_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: index * 0.8,
      duration: 8 + Math.random() * 4,
      size: 30 + Math.random() * 15,
    }));
  }, []);

  const handleSelect = (id) => {
    localStorage.setItem("favTeam", id);
    setTeamId(id);
  };

  const team = IPL_TEAMS.find((t) => t.id === teamId);

  if (!teamId) {
    return <TeamSelector onSelect={handleSelect} />;
  }

  return (
    <section
      className="ipl-banner"
      style={{
        background: `linear-gradient(135deg, ${team.color}, #000)`,
      }}
    >
      <div className="banner-left">
        <img src={team.logo} alt={team.name} className="banner-logo" />

        <div>
          <h2>{team.name} 🔥</h2>
          <p className="slogan">{team.slogan}</p>
          <p className="cta">{team.cta}</p>
        </div>
      </div>

      <button
        className="change-btn"
        onClick={() => {
          localStorage.removeItem("favTeam");
          setTeamId(null);
        }}
      >
        Change
      </button>

      <div className="ipl-rain-bg">
        {team &&
          rainItems.map((item) => (
            <img
              key={item.id}
              src={team.logo}
              alt=""
              className="rain-logo"
              style={{
                left: `${item.left}%`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`,
                width: `${item.size}px`,
              }}
            />
          ))}
      </div>
    </section>
  );
};

export default EventBanner;
