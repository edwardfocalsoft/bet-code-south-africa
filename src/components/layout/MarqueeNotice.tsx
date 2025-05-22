
import React from "react";

const MarqueeNotice: React.FC = () => {
  return (
    <div className="bg-betting-green text-white py-1 overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-marquee">
        BetCode South Africa: All odds shown are correct at the time of publishing and are subject to change. BetCode South Africa supports and promotes responsible gambling. Please Gamble Responsibly. Bet codes shared on this platform do not guarantee winning bets or profits.
      </div>
    </div>
  );
};

export default MarqueeNotice;
