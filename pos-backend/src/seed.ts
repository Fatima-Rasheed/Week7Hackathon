import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RawMaterial } from './raw-materials/schemas/raw-material.schema';
import { Product } from './products/schemas/product.schema';
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const rawMaterialModel = app.get<Model<RawMaterial>>(
    getModelToken(RawMaterial.name),
  );
  const productModel = app.get<Model<Product>>(getModelToken(Product.name));

  // Clear existing data
  await rawMaterialModel.deleteMany({});
  await productModel.deleteMany({});

  console.log('Cleared existing data...');

  // Seed raw materials
  const materials = await rawMaterialModel.insertMany([
    { name: 'Noodles', unit: 'g', currentStock: 5000, minStockAlert: 500 },
    { name: 'Seafood Mix', unit: 'g', currentStock: 3000, minStockAlert: 300 },
    { name: 'Broth', unit: 'ml', currentStock: 8000, minStockAlert: 1000 },
    { name: 'Mushroom', unit: 'g', currentStock: 2000, minStockAlert: 200 },
    { name: 'Pasta', unit: 'g', currentStock: 4000, minStockAlert: 400 },
    { name: 'Cream Sauce', unit: 'ml', currentStock: 3000, minStockAlert: 300 },
    { name: 'Beef Dumpling', unit: 'pcs', currentStock: 200, minStockAlert: 30 },
    { name: 'Sour Soup Base', unit: 'ml', currentStock: 5000, minStockAlert: 500 },
    { name: 'Spinach', unit: 'g', currentStock: 1500, minStockAlert: 150 },
    { name: 'Egg', unit: 'pcs', currentStock: 100, minStockAlert: 20 },
    { name: 'Rice', unit: 'g', currentStock: 10000, minStockAlert: 1000 },
    { name: 'Chili Sauce', unit: 'ml', currentStock: 2000, minStockAlert: 200 },
    { name: 'Instant Noodle Block', unit: 'pcs', currentStock: 80, minStockAlert: 15 },
    { name: 'Special Omelette Mix', unit: 'ml', currentStock: 2500, minStockAlert: 250 },
  ]);

  console.log(`Seeded ${materials.length} raw materials`);

  const matMap: Record<string, string> = {};
  materials.forEach((m: any) => {
    matMap[m.name] = m._id.toString();
  });

  // Seed products with recipes
  const products = await productModel.insertMany([
    {
      name: 'Spicy Seasoned Seafood Noodles',
      category: 'Hot Dishes',
      price: 2.29,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
      recipe: [
        { rawMaterialId: matMap['Noodles'], quantityRequired: 150 },
        { rawMaterialId: matMap['Seafood Mix'], quantityRequired: 100 },
        { rawMaterialId: matMap['Broth'], quantityRequired: 200 },
        { rawMaterialId: matMap['Chili Sauce'], quantityRequired: 30 },
      ],
    },
    {
      name: 'Salted Pasta with Mushroom Sauce',
      category: 'Hot Dishes',
      price: 2.69,
      image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400',
      recipe: [
        { rawMaterialId: matMap['Pasta'], quantityRequired: 200 },
        { rawMaterialId: matMap['Mushroom'], quantityRequired: 80 },
        { rawMaterialId: matMap['Cream Sauce'], quantityRequired: 100 },
      ],
    },
    {
      name: 'Beef Dumpling in Hot and Sour Soup',
      category: 'Soup',
      price: 2.99,
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
      recipe: [
        { rawMaterialId: matMap['Beef Dumpling'], quantityRequired: 8 },
        { rawMaterialId: matMap['Sour Soup Base'], quantityRequired: 300 },
        { rawMaterialId: matMap['Chili Sauce'], quantityRequired: 20 },
      ],
    },
    {
      name: 'Healthy Noodle with Spinach Leaf',
      category: 'Cold Dishes',
      price: 3.29,
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
      recipe: [
        { rawMaterialId: matMap['Noodles'], quantityRequired: 150 },
        { rawMaterialId: matMap['Spinach'], quantityRequired: 100 },
        { rawMaterialId: matMap['Broth'], quantityRequired: 150 },
      ],
    },
    {
      name: 'Hot Spicy Fried Rice with Omelet',
      category: 'Hot Dishes',
      price: 3.49,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
      recipe: [
        { rawMaterialId: matMap['Rice'], quantityRequired: 250 },
        { rawMaterialId: matMap['Egg'], quantityRequired: 2 },
        { rawMaterialId: matMap['Chili Sauce'], quantityRequired: 40 },
      ],
    },
    {
      name: 'Spicy Instant Noodle with Special Omelette',
      category: 'Hot Dishes',
      price: 3.59,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
      recipe: [
        { rawMaterialId: matMap['Instant Noodle Block'], quantityRequired: 1 },
        { rawMaterialId: matMap['Special Omelette Mix'], quantityRequired: 100 },
        { rawMaterialId: matMap['Chili Sauce'], quantityRequired: 30 },
        { rawMaterialId: matMap['Egg'], quantityRequired: 1 },
      ],
    },
  ]);

  console.log(`Seeded ${products.length} products`);

  console.log('\n✅ Seed complete!');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
