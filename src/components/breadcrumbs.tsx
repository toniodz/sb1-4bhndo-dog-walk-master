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

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        <li>
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <React.Fragment key={item.path}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              {index === items.length - 1 ? (
                <span className="text-gray-800">{item.label}</span>
              ) : (
                <Link to={item.path} className="hover:text-primary">
                  {item.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
