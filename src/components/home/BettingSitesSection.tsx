
import React, { useState, useEffect } from "react";
import BettingSiteLogo from "./BettingSiteLogo";
import { supabase } from "@/integrations/supabase/client";
import { BettingSite } from "@/types";

const BettingSitesSection: React.FC = () => {
  const [bettingSites, setBettingSites] = useState<BettingSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBettingSites = async () => {
      setIsLoading(true);
      try {
        // Query unique betting sites from the tickets table
        const { data, error } = await supabase
          .from("tickets")
          .select("betting_site")
          .order("betting_site")
          .limit(10);

        if (error) throw error;

        // Extract unique betting sites
        const uniqueSites = [...new Set(data?.map(item => item.betting_site))] as BettingSite[];
        setBettingSites(uniqueSites);
      } catch (error) {
        console.error("Error fetching betting sites:", error);
        // Fallback to default betting sites if there's an error
        setBettingSites(["Hollywoodbets", "Betway", "Supabets", "Sportsbets", "Betfred", "World Sports Betting"]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBettingSites();
  }, []);

  return (
    <section className="py-16 px-4 bg-betting-black border-t border-betting-light-gray">
      <div className="container mx-auto">
        <h2 className="text-2xl font-medium mb-8 text-center">
          Compatible with All Major South African Betting Sites
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((skeleton) => (
              <div 
                key={skeleton} 
                className="bg-betting-dark-gray rounded-lg p-4 h-[90px] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {bettingSites.map((site) => (
              <BettingSiteLogo key={site} site={site} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BettingSitesSection;
