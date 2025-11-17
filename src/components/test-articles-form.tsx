import EntitiesForm from '@/features/entities/components/entities-form';

// Test component for entities form with backend response structure
export default function TestEntitiesForm() {
  // Mock backend response structure
  const mockBackendEntity = {
    id: 11,
    title: 'Sarah Photo',
    slug: 'sarah-photo',
    summary: 'Sarah kinda cute',
    content: 'dawg',
    status: 'published' as const,
    coverImageId: 7,
    coverImageUrl: '/uploads/entities/1755534057665-iw1u6rf48y.png',
    images: [
      {
        id: 7,
        entityId: 11,
        url: '/uploads/entities/1755534057665-iw1u6rf48y.png',
        storageKey: 'uploads/entities/1755534057665-iw1u6rf48y.png',
        alt: 'Sarah',
        isCover: true,
        position: 0,
        createdAt: '2025-08-18T16:20:57.739Z'
      }
    ],
    categories: [
      {
        id: 1,
        name: 'Mental Health',
        slug: 'mental-health'
      },
      {
        id: 2,
        name: 'Nutrition',
        slug: 'nutrition'
      },
      {
        id: 3,
        name: 'Wellness',
        slug: 'wellness'
      }
    ]
  };

  return (
    <div className='container mx-auto py-8'>
      <h1 className='mb-8 text-2xl font-bold'>
        Test Entities Form with Backend Data
      </h1>

      {/* Test with backend response structure */}
      <div className='mb-8'>
        <h2 className='mb-4 text-lg font-semibold'>
          Edit Mode (with backend response data)
        </h2>
        <EntitiesForm
          initialData={mockBackendEntity as any}
          pageTitle='Edit Entity'
        />
      </div>

      {/* Test without existing data */}
      <div className='mb-8'>
        <h2 className='mb-4 text-lg font-semibold'>Create Mode (empty form)</h2>
        <EntitiesForm initialData={null} pageTitle='Create Entity' />
      </div>
    </div>
  );
}
