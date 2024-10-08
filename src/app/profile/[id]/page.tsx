'use client';

export default function Profile({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center">
        Single Profile <span className="text-blue-500">{params.id}</span>
      </h1>
    </div>
  );
}
