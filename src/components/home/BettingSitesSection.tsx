
import React from "react";
import BettingSiteLogo from "./BettingSiteLogo";
import { BETTING_SITES } from "@/data/mockData";

const BettingSitesSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-betting-black">
      <div className="container mx-auto">
        <h2 className="text-xl font-medium mb-8 text-center">
          Compatible with All Major South African Betting Sites
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {BETTING_SITES.map((site) => (
            <BettingSiteLogo key={site} site={site} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BettingSitesSection;
