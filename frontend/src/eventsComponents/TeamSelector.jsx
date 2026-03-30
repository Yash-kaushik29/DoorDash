import React from "react";
import { IPL_TEAMS } from "./iplTeams";
import "./eventBanner.css";

const TeamSelector = ({ onSelect }) => {
  return (
    <div className="selector-wrapper">
      <h2 className="ipl-title">🏏 IPL 2026 is here</h2>
      <p className="choose-text">Support your team</p>

      <div className="team-grid">
        {IPL_TEAMS.map((team) => (
          <div
            key={team.id}
            className="team-pill"
            onClick={() => onSelect(team.id)}
          >
            <img src={team.logo} alt={team.name} />
            <p className="team-name" style={{ color: team.color }}>
              {team.short}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamSelector;