import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TransformationCard } from './TransformationCard';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transformation {
  id: string;
  service_category: string;
  before_image_url: string;
  after_image_url: string;
  description: string;
  is_featured: boolean;
  display_order: number;
}

const CATEGORIES = ['All', 'Hair', 'Nails', 'Spa', 'Makeup', 'Skin Care'];

interface BeforeAfterGalleryProps {
  featuredOnly?: boolean;
  maxItems?: number;
  showFilters?: boolean;
  gridCols?: 'single' | 'double' | 'triple';
}

export const BeforeAfterGallery = ({
  featuredOnly = false,
  maxItems,
  showFilters = true,
  gridCols = 'triple',
}: BeforeAfterGalleryProps) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch transformations from Supabase
  const { data: transformations, isLoading, error } = useQuery({
    queryKey: ['transformations', selectedCategory, featuredOnly],
    queryFn: async () => {
      let query = supabase
        .from('transformation_gallery')
        .select('*')
        .order('display_order', { ascending: true });

      // Filter by featured if needed
      if (featuredOnly) {
        query = query.eq('is_featured', true);
      }

      // Filter by category
      if (selectedCategory !== 'All') {
        query = query.eq('service_category', selectedCategory);
      }

      // Limit results if specified
      if (maxItems) {
        query = query.limit(maxItems);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Transformation[];
    },
  });

  const getGridClass = () => {
    switch (gridCols) {
      case 'single':
        return 'grid-cols-1';
      case 'double':
        return 'grid-cols-1 md:grid-cols-2';
      case 'triple':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (error) {
    return (
      <div className="bg-slate-950 rounded-xl p-8 border border-red-500/50">
        <p className="text-red-400 text-center">
          Failed to load transformations. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-6 py-3 rounded-full font-semibold transition-all duration-300',
                selectedCategory === category
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && transformations && transformations.length === 0 && (
        <div className="bg-slate-950 rounded-xl p-12 border border-slate-800 text-center">
          <p className="text-slate-400 text-lg">
            No transformations found for this category.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Check back soon for new before & after showcases!
          </p>
        </div>
      )}

      {/* Gallery Grid */}
      {!isLoading && transformations && transformations.length > 0 && (
        <div className={cn('grid gap-6', getGridClass())}>
          {transformations.map((transformation) => (
            <TransformationCard
              key={transformation.id}
              id={transformation.id}
              beforeImage={transformation.before_image_url}
              afterImage={transformation.after_image_url}
              description={transformation.description || ''}
              category={transformation.service_category}
              featured={transformation.is_featured}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && transformations && transformations.length > 0 && (
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            Showing {transformations.length}{' '}
            {transformations.length === 1 ? 'transformation' : 'transformations'}
            {selectedCategory !== 'All' && (
              <span className="text-emerald-400"> in {selectedCategory}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
