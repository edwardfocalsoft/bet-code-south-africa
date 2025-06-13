
import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Trophy } from 'lucide-react';

const LiveScores: React.FC = () => {
  useEffect(() => {
    // Load the widget script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://ls.soccersapi.com/widget/res/awo_w9144_6849e14318760/widget.js';
    script.async = true;
    
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://ls.soccersapi.com/widget/res/awo_w9144_6849e14318760/widget.js"]');
    if (!existingScript) {
      document.body.appendChild(script);
    }

    return () => {
      // Clean up script on unmount
      if (!existingScript && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-betting-green" />
            Live Scores
          </h1>
          <p className="text-muted-foreground">
            Stay updated with real-time football scores and match results
          </p>
        </div>

        <div className="w-full">
          <div 
            id="ls-widget" 
            data-w="awo_w9144_6849e14318760" 
            className="livescore-widget w-full"
          />
        </div>
      </div>
    </Layout>
  );
};

export default LiveScores;
