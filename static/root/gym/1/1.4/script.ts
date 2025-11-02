// @process
export {};

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
};
type Filters = {
  category: string;
  inStock: boolean;
  minPrice: number;
};

const products: Product[] = [
  {
    id: 1,
    name: 'Laptop Pro',
    category: 'Electronics',
    price: 1500,
    inStock: true,
  },
  {
    id: 2,
    name: 'Laptop Air',
    category: 'Electronics',
    price: 1200,
    inStock: false,
  },
  { id: 3, name: 'Mouse', category: 'Accessories', price: 50, inStock: true },
  {
    id: 4,
    name: 'Keyboard',
    category: 'Accessories',
    price: 100,
    inStock: true,
  },
];

// Создать функцию: filterAndSort(products, filters, sortBy)
// filters = { category: 'Electronics', inStock: true, minPrice: 1000 }
// sortBy = 'price' | 'name' (ascending)

const filterAndSort = (
  products: Product[],
  filters: Filters,
  sortBy: 'price' | 'name',
): Product[] => {
  const result: Product[] = products
    .filter(
      (item) =>
        item.category === filters.category &&
        item.inStock === filters.inStock &&
        item.price >= filters.minPrice,
    )
    .sort((a, b) => {
      if (sortBy === 'price') {
        return a.price - b.price;
      }
      return a.name.localeCompare(b.name);
    });

  return result;
};

const result = filterAndSort(
  products,
  { category: 'Electronics', inStock: true, minPrice: 1000 },
  'price',
);
console.log(result);
