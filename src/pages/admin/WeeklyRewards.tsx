
import React from 'react';
import Layout from '@/components/layout/Layout';
import WeeklyRewardsManager from '@/components/admin/WeeklyRewardsManager';

const AdminWeeklyRewards: React.FC = () => {
  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Weekly Rewards Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor weekly rewards for top performing tipsters
          </p>
        </div>
        
        <WeeklyRewardsManager />
      </div>
    </Layout>
  );
};

export default AdminWeeklyRewards;
