// pages/index.tsx
import Head from 'next/head';
import SearchableTable from '../components/SearchableTable';

const Home = () => {
  return (
    <div>
      <Head>
        <title>Equipment Search</title>
      </Head>
      <main className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold text-center mb-4">Equipment Search Table</h1>
        <SearchableTable />
      </main>
    </div>
  );
};

export default Home;
