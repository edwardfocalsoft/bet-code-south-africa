
import React, { useState, useEffect } from "react";
import BettingSiteLogo from "./BettingSiteLogo";
import { supabase } from "@/integrations/supabase/client";
import { BettingSite } from "@/types";
import { Loader2 } from "lucide-react";

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
          .order("betting_site");

        if (error) throw error;

        // Extract unique betting sites
        const uniqueSites = [...new Set(data?.map(item => item.betting_site))] as BettingSite[];
        
        // Ensure we have at least 6 betting sites
        if (uniqueSites.length < 6) {
          // Add default sites if needed
          const defaultSites: BettingSite[] = ["Betway", "HollywoodBets", "Supabets", "10bet", "Playa", "Easybet"];
          // Filter out sites that are already in uniqueSites
          const missingCount = 6 - uniqueSites.length;
          const sitesToAdd = defaultSites
            .filter(site => !uniqueSites.includes(site))
            .slice(0, missingCount);
          
          setBettingSites([...uniqueSites, ...sitesToAdd]);
        } else {
          // If we have enough sites, just use the first 6
          setBettingSites(uniqueSites.slice(0, 6));
        }
      } catch (error) {
        console.error("Error fetching betting sites:", error);
        // Fallback to default betting sites if there's an error
        setBettingSites(["Betway", "HollywoodBets", "Supabets", "10bet", "Playa", "Easybet"]);
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((skeleton) => (
              <div 
                key={skeleton} 
                className="bg-betting-dark-gray rounded-lg p-4 h-[90px] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
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
