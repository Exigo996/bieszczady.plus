import React from 'react';
import ProducerCard from '../components/products/ProducerCard';

const ProductsPage: React.FC = () => {
  const producers = [
    {
      id: 1,
      name: 'Ogród Bieszczadzki',
      image: '/dron.jpg',
      description: `Ogród Bieszczadzki specjalizuje się w produkcji wysokiej jakości przetworów z własnych upraw. Nasza plantacja obejmuje borówkę amerykańską, jagodę kamczacką oraz ogórki gruntowe.

Dysponujemy inkubatorem przetwórstwa lokalnego, który udostępniamy lokalnym rolnikom i producentom, wspierając rozwój regionalnej przedsiębiorczości.

Regularnie organizujemy warsztaty z zakresu ogrodnictwa i zielarstwa, dzieląc się naszą wiedzą i doświadczeniem z pasjonatami naturalnej uprawy i przetwórstwa.`,
      website: 'https://www.bieszczadzkiogrod.pl/',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Lokalni Producenci</h1>
          <p className="text-lg text-gray-600">
            Poznaj lokalnych producentów z Bieszczadów - naturalne produkty prosto od źródła
          </p>
        </div>

        {/* Producers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {producers.map((producer) => (
            <ProducerCard
              key={producer.id}
              name={producer.name}
              image={producer.image}
              description={producer.description}
              website={producer.website}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
