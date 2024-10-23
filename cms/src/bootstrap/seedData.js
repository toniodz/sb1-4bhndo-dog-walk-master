import fs from 'fs';
import path from 'path';

export default async ({ strapi }) => {
  if (process.env.NODE_ENV === 'development') {
    const dataPath = path.join(__dirname, '../../../walk-test-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const walks = JSON.parse(rawData);

    for (const walk of walks) {
      const existingWalk = await strapi.entityService.findMany('api::walk.walk', {
        filters: { slug: walk.slug },
      });

      if (existingWalk.length === 0) {
        await strapi.entityService.create('api::walk.walk', {
          data: {
            ...walk,
            publishedAt: new Date(),
          },
        });
        console.log(`Created walk: ${walk.title}`);
      } else {
        console.log(`Walk already exists: ${walk.title}`);
      }
    }

    console.log('Sample data seeding completed');
  }
};