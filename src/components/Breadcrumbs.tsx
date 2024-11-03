// src/components/Breadcrumbs.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const BreadcrumbSchema: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@id": `https://dogwalksnearme.uk${item.path}`,
        "name": item.label
      }
    }))
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <>
      <BreadcrumbSchema items={items} />
      
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center space-x-2 text-sm text-gray-600">
          <li className="flex items-center">
            <Link 
              to="/" 
              className="hover:text-primary transition-colors duration-200"
            >
              Home
            </Link>
          </li>

          {items.map((item, index) => (
            <React.Fragment key={item.path}>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                {index === items.length - 1 ? (
                  // Last item - no link, different style
                  <span 
                    className="ml-2 text-gray-800 font-medium"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  // Not last item - show as link
                  <Link 
                    to={item.path}
                    className="ml-2 hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;

// Example usage in a page:
/*
const breadcrumbItems = [
  { label: 'Dog Walks in Kent', path: '/dog-walks-in-kent' },
  { label: 'Dog Walks in Dover', path: '/dog-walks-in-dover' },
  { label: 'White Cliffs Walk', path: '/walks/white-cliffs-walk' }
];

return (
  <Breadcrumbs items={breadcrumbItems} />
);
*/
