// src/components/WalkStats.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWalks } from '../api/strapi';

const WalkStats: React.FC = () => {
  const [stats, setStats] = useState<{
    totalWalks: number;
    byTown: Record<string, number>;
  }>({
    totalWalks: 0,
    byTown: {}
  });

  useEffect(() => {
    const loadStats = async () => {
      const walks = await fetchWalks();
      const byTown: Record<string, number> = {};
      
      walks.forEach(walk => {
        if (walk.Town) {
          byTown[walk.Town] = (byTown[walk.Town] || 0) + 1;
        }
      });

      setStats({
        totalWalks: walks.length,
        byTown
      });
    };

    loadStats();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Browse by Location</h2>
      <ul className="space-y-2">
        {Object.entries(stats.byTown).map(([town, count]) => (
          <li key={town}>
            <Link 
              to={`/dog-walks/kent/${town.toLowerCase()}`}
              className="flex items-center justify-between hover:text-primary"
            >
              <span>{town}</span>
              <span className="text-gray-500">{count} walks</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WalkStats;
