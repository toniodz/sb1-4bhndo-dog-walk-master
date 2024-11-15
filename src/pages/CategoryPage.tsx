import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchWalks, fetchCounties, fetchTowns } from '../api/strapi';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

const CategoryPage: React.FC = () => {
  const { county, town } = useParams<{ county?: string; town?: string }>();
  const [walks, setWalks] = useState<any[]>([]);
  const [counties, setCounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Log current route params
        console.log('Route params:', { county, town });

        if (!county) {
          // On counties page - just load counties
          const countiesData = await fetchCounties();
          console.log('Counties data:', countiesData);
          setCounties(countiesData);
        } else {
          // On county or town page - load walks
          const walksData = await fetchWalks({
            county: county,
            ...(town && { town })
          });
          console.log('Walks data:', walksData);
          setWalks(walksData);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [county, town]);

  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Dog Walks', path: '/dog-walks' }
    ];

    if (county) {
      items.push({
        label: `Dog Walks in ${county}`,
        path: `/dog-walks/${county}`
      });

      if (town) {
        items.push({
          label: `Dog Walks in ${town}`,
          path: `/dog-walks/${county}/${town}`
        });
      }
    }

    return items;
  };

  if (loading) return <div>Loading...</div>;

  // Counties listing page
  if (!county) {
    return (
      <div>
        <Breadcrumbs items={getBreadcrumbItems()} />
        <h1>Dog Walks by County</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counties.map(county => (
            <Link 
              key={county.id}
              to={`/dog-walks/${county.slug}`}
              className="p-4 border rounded hover:shadow-lg"
            >
              <h2>{county.name}</h2>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // County or town page
  return (
    <div>
      <Breadcrumbs items={getBreadcrumbItems()} />
      <h1>
        {town ? `Dog Walks in ${town}, ${county}` : `Dog Walks in ${county}`}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {walks.map(walk => (
          <Link 
            key={walk.id}
            to={`/walks/${walk.slug}`}
            className="p-4 border rounded hover:shadow-lg"
          >
            <h2>{walk.Title}</h2>
            <p>{walk.address}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;