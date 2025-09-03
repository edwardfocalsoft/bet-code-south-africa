import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeedSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FeedSidebar: React.FC<FeedSidebarProps> = ({ searchQuery, onSearchChange }) => {
  useEffect(() => {
    // Add the ad script to the page
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//pl26465491.revenuecpmgate.com/ed83677474b8eab41fc0c4d7d53391fd/invoke.js';
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="w-80 space-y-6 p-4">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Search Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ads Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sponsored</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="container-ed83677474b8eab41fc0c4d7d53391fd"></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedSidebar;