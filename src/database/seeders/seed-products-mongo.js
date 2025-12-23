const mongoose = require('mongoose');
const Brand = require('../../models/brand');
const Product = require('../../models/product');
const ProductVariation = require('../../models/productvariation');
const Category = require('../../models/category');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;
console.log('Connecting to:', MONGO_URI);
// 1. Define all brands (from your brandNameToId mapping)
const brands = [
  { name: 'LG', slug: 'lg' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Whirlpool', slug: 'whirlpool' },
  { name: 'Godrej', slug: 'godrej' },
  { name: 'Haier', slug: 'haier' },
  { name: 'Panasonic', slug: 'panasonic' },
  { name: 'Bosch', slug: 'bosch' },
  { name: 'Hitachi', slug: 'hitachi' },
  { name: 'IFB', slug: 'ifb' },
  { name: 'Voltas', slug: 'voltas' },
  { name: 'Blue Star', slug: 'blue-star' },
  { name: 'Symphony', slug: 'symphony' },
  { name: 'Crompton', slug: 'crompton' },
  { name: 'Daikin', slug: 'daikin' },
  { name: 'Kenstar', slug: 'kenstar' },
  { name: 'Preethi', slug: 'preethi' },
  { name: 'Philips', slug: 'philips' },
  { name: 'Bajaj', slug: 'bajaj' },
  { name: 'Prestige', slug: 'prestige' },
  { name: 'Morphy Richards', slug: 'morphy-richards' },
  { name: 'Butterfly', slug: 'butterfly' },
  { name: 'Sujata', slug: 'sujata' },
  { name: 'Kent', slug: 'kent' },
  { name: 'Sony', slug: 'sony' },
  { name: 'TCL', slug: 'tcl' },
  { name: 'OnePlus', slug: 'oneplus' },
  { name: 'Vu', slug: 'vu' },
  { name: 'Mi', slug: 'mi' },
  { name: 'Havells', slug: 'havells' },
  { name: 'Usha', slug: 'usha' },
  { name: 'Orient', slug: 'orient' },
  { name: 'V-Guard', slug: 'v-guard' },
  { name: 'Khaitan', slug: 'khaitan' },
  { name: 'Polycab', slug: 'polycab' }
];

// 2. All products from 20250611065420-demo-products.js
const products = [
  // Home Appliances
  {
    id: 1,
    name: 'LG Double Door Refrigerator',
    description: '260L Frost Free Double Door',
    slug: 'lg-double-door-refrigerator',
    sku: 'REF-001',
    price: 24999.99,
    stock: 20,
    category_slug: 'refrigerators',
    status: true,
    brand_slug: 'lg',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: 'Samsung Single Door Refrigerator',
    description: '192L Direct Cool Single Door',
    slug: 'samsung-single-door-refrigerator',
    sku: 'REF-002',
    price: 15999.99,
    stock: 15,
    category_slug: 'refrigerators',
    status: true,
    brand_slug: 'samsung',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    name: 'Whirlpool Multi Door Refrigerator',
    description: '300L Multi Door',
    slug: 'whirlpool-multi-door-refrigerator',
    sku: 'REF-003',
    price: 28999.99,
    stock: 10,
    category_slug: 'refrigerators',
    status: true,
    brand_slug: 'whirlpool',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    name: 'Godrej Mini Refrigerator',
    description: '99L Mini Fridge',
    slug: 'godrej-mini-refrigerator',
    sku: 'REF-004',
    price: 8999.99,
    stock: 25,
    category_slug: 'refrigerators',
    status: true,
    brand_slug: 'godrej',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 5,
    name: 'Haier Side by Side Refrigerator',
    description: '570L Side by Side',
    slug: 'haier-side-by-side-refrigerator',
    sku: 'REF-005',
    price: 49999.99,
    stock: 8,
    category_slug: 'refrigerators',
    status: true,
    brand_slug: 'haier',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 6,
    name: 'Panasonic Inverter Refrigerator',
    description: '307L Inverter Refrigerator',
    slug: 'panasonic-inverter-refrigerator',
    sku: 'REF-006',
    price: 21999.99,
    stock: 12,
    category_slug: 'refrigerators',
    status: true,
    brand_slug: 'panasonic',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 7,
    name: 'Bosch Bottom Freezer Refrigerator',
    description: '350L Bottom Freezer',
    slug: 'bosch-bottom-freezer-refrigerator',
    sku: 'REF-007',
    price: 32999.99,
    stock: 9,
    category_slug: 'refrigerators',
    status: true,
    brand_slug: 'bosch',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 8,
    name: 'Hitachi French Door Refrigerator',
    description: '456L French Door',
    slug: 'hitachi-french-door-refrigerator',
    sku: 'REF-008',
    price: 55999.99,
    stock: 7,
    category_slug: 'refrigerators',
    status: true,
    brand_slug: 'hitachi',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Washing Machines
  {
    id: 9,
    name: 'LG Front Load Washing Machine',
    description: '6kg Inverter Front Load',
    slug: 'lg-front-load-washing-machine',
    sku: 'WM-001',
    price: 22999.99,
    stock: 12,
    category_slug: 'washing-machines',
    status: true,
    brand_slug: 'lg',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 10,
    name: 'Samsung Top Load Washing Machine',
    description: '7kg Top Load',
    slug: 'samsung-top-load-washing-machine',
    sku: 'WM-002',
    price: 17999.99,
    stock: 18,
    category_slug: 'washing-machines',
    status: true,
    brand_slug: 'samsung',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 11,
    name: 'Whirlpool Semi Automatic Washing Machine',
    description: '7.5kg Semi Automatic',
    slug: 'whirlpool-semi-automatic-washing-machine',
    sku: 'WM-003',
    price: 12999.99,
    stock: 20,
    category_slug: 'washing-machines',
    status: true,
    brand_slug: 'whirlpool',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 12,
    name: 'Bosch Fully Automatic Washing Machine',
    description: '8kg Fully Automatic',
    slug: 'bosch-fully-automatic-washing-machine',
    sku: 'WM-004',
    price: 25999.99,
    stock: 10,
    category_slug: 'washing-machines',
    status: true,
    brand_slug: 'bosch',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 13,
    name: 'IFB Top Load Washing Machine',
    description: '6.5kg Top Load',
    slug: 'ifb-top-load-washing-machine',
    sku: 'WM-005',
    price: 15999.99,
    stock: 14,
    category_slug: 'washing-machines',
    status: true,
    brand_slug: 'ifb',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 14,
    name: 'Panasonic Fully Automatic Washing Machine',
    description: '7kg Fully Automatic',
    slug: 'panasonic-fully-automatic-washing-machine',
    sku: 'WM-006',
    price: 18999.99,
    stock: 11,
    category_slug: 'washing-machines',
    status: true,
    brand_slug: 'panasonic',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 15,
    name: 'Godrej Semi Automatic Washing Machine',
    description: '6kg Semi Automatic',
    slug: 'godrej-semi-automatic-washing-machine',
    sku: 'WM-007',
    price: 10999.99,
    stock: 13,
    category_slug: 'washing-machines',
    status: true,
    brand_slug: 'godrej',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 16,
    name: 'Haier Top Load Washing Machine',
    description: '7.5kg Top Load',
    slug: 'haier-top-load-washing-machine',
    sku: 'WM-008',
    price: 16999.99,
    stock: 10,
    category_slug: 'washing-machines',
    status: true,
    brand_slug: 'haier',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Air Conditioners & Coolers
  {
    id: 17,
    name: 'LG Split AC',
    description: '1.5 Ton 5 Star Split AC',
    slug: 'lg-split-ac',
    sku: 'AC-001',
    price: 34999.99,
    stock: 10,
    category_slug: 'air-conditioners-coolers',
    status: true,
    brand_slug: 'lg',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 18,
    name: 'Voltas Window AC',
    description: '1.5 Ton 3 Star Window AC',
    slug: 'voltas-window-ac',
    sku: 'AC-002',
    price: 25999.99,
    stock: 8,
    category_slug: 'air-conditioners-coolers',
    status: true,
    brand_slug: 'voltas',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 19,
    name: 'Blue Star Tower AC',
    description: '2 Ton Tower AC',
    slug: 'blue-star-tower-ac',
    sku: 'AC-003',
    price: 49999.99,
    stock: 5,
    category_slug: 'air-conditioners-coolers',
    status: true,
    brand_slug: 'blue-star',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 20,
    name: 'Symphony Air Cooler',
    description: '70L Desert Air Cooler',
    slug: 'symphony-air-cooler',
    sku: 'AC-004',
    price: 8999.99,
    stock: 20,
    category_slug: 'air-conditioners-coolers',
    status: true,
    brand_slug: 'symphony',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 21,
    name: 'Crompton Personal Cooler',
    description: '20L Personal Air Cooler',
    slug: 'crompton-personal-cooler',
    sku: 'AC-005',
    price: 5999.99,
    stock: 25,
    category_slug: 'air-conditioners-coolers',
    status: true,
    brand_slug: 'crompton',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 22,
    name: 'Daikin Inverter Split AC',
    description: '1.8 Ton Inverter Split AC',
    slug: 'daikin-inverter-split-ac',
    sku: 'AC-006',
    price: 42999.99,
    stock: 7,
    category_slug: 'air-conditioners-coolers',
    status: true,
    brand_slug: 'daikin',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 23,
    name: 'Hitachi Window AC',
    description: '1.5 Ton Window AC',
    slug: 'hitachi-window-ac',
    sku: 'AC-007',
    price: 28999.99,
    stock: 9,
    category_slug: 'air-conditioners-coolers',
    status: true,
    brand_slug: 'hitachi',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 24,
    name: 'Kenstar Tower Cooler',
    description: '40L Tower Air Cooler',
    slug: 'kenstar-tower-cooler',
    sku: 'AC-008',
    price: 7999.99,
    stock: 11,
    category_slug: 'air-conditioners-coolers',
    status: true,
    brand_slug: 'kenstar',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Kitchen Appliances
  {
    id: 25,
    name: 'Preethi Mixer Grinder',
    description: '750W Mixer Grinder',
    slug: 'preethi-mixer-grinder',
    sku: 'KA-001',
    price: 4999.99,
    stock: 30,
    category_slug: 'kitchen-appliances',
    status: true,
    brand_slug: 'preethi',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 26,
    name: 'Philips Air Fryer',
    description: 'Rapid Air Technology',
    slug: 'philips-air-fryer',
    sku: 'KA-002',
    price: 7999.99,
    stock: 18,
    category_slug: 'kitchen-appliances',
    status: true,
    brand_slug: 'philips',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 27,
    name: 'Bajaj Electric Kettle',
    description: '1.5L Electric Kettle',
    slug: 'bajaj-electric-kettle',
    sku: 'KA-003',
    price: 1999.99,
    stock: 22,
    category_slug: 'kitchen-appliances',
    status: true,
    brand_slug: 'bajaj',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 28,
    name: 'Prestige Induction Cooktop',
    description: '2000W Induction Cooktop',
    slug: 'prestige-induction-cooktop',
    sku: 'KA-004',
    price: 3499.99,
    stock: 16,
    category_slug: 'kitchen-appliances',
    status: true,
    brand_slug: 'prestige',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 29,
    name: 'Morphy Richards OTG',
    description: '28L Oven Toaster Grill',
    slug: 'morphy-richards-otg',
    sku: 'KA-005',
    price: 8999.99,
    stock: 10,
    category_slug: 'kitchen-appliances',
    status: true,
    brand_slug: 'morphy-richards',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 30,
    name: 'Butterfly Wet Grinder',
    description: '2L Wet Grinder',
    slug: 'butterfly-wet-grinder',
    sku: 'KA-006',
    price: 5999.99,
    stock: 14,
    category_slug: 'kitchen-appliances',
    status: true,
    brand_slug: 'butterfly',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 31,
    name: 'Sujata Juicer Mixer',
    description: '900W Juicer Mixer',
    slug: 'sujata-juicer-mixer',
    sku: 'KA-007',
    price: 6499.99,
    stock: 12,
    category_slug: 'kitchen-appliances',
    status: true,
    brand_slug: 'sujata',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 32,
    name: 'Kent Water Purifier',
    description: 'RO+UV+UF Water Purifier',
    slug: 'kent-water-purifier',
    sku: 'KA-008',
    price: 11999.99,
    stock: 9,
    category_slug: 'kitchen-appliances',
    status: true,
    brand_slug: 'kent',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Televisions
  {
    id: 33,
    name: 'Sony Bravia 4K TV',
    description: '55 inch Ultra HD Smart TV',
    slug: 'sony-bravia-4k-tv',
    sku: 'TV-001',
    price: 59999.99,
    stock: 7,
    category_slug: 'televisions',
    status: true,
    brand_slug: 'sony',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 34,
    name: 'Samsung Crystal UHD TV',
    description: '50 inch 4K Smart TV',
    slug: 'samsung-crystal-uhd-tv',
    sku: 'TV-002',
    price: 44999.99,
    stock: 9,
    category_slug: 'televisions',
    status: true,
    brand_slug: 'samsung',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 35,
    name: 'LG OLED TV',
    description: '48 inch OLED Smart TV',
    slug: 'lg-oled-tv',
    sku: 'TV-003',
    price: 79999.99,
    stock: 5,
    category_slug: 'televisions',
    status: true,
    brand_slug: 'lg',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 36,
    name: 'TCL Android TV',
    description: '43 inch Full HD Android TV',
    slug: 'tcl-android-tv',
    sku: 'TV-004',
    price: 29999.99,
    stock: 12,
    category_slug: 'televisions',
    status: true,
    brand_slug: 'tcl',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 37,
    name: 'OnePlus Q1 Series TV',
    description: '55 inch QLED TV',
    slug: 'oneplus-q1-series-tv',
    sku: 'TV-005',
    price: 69999.99,
    stock: 6,
    category_slug: 'televisions',
    status: true,
    brand_slug: 'oneplus',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 38,
    name: 'Panasonic 4K Smart TV',
    description: '65 inch 4K Smart TV',
    slug: 'panasonic-4k-smart-tv',
    sku: 'TV-006',
    price: 74999.99,
    stock: 8,
    category_slug: 'televisions',
    status: true,
    brand_slug: 'panasonic',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 39,
    name: 'Vu Premium Android TV',
    description: '43 inch Android TV',
    slug: 'vu-premium-android-tv',
    sku: 'TV-007',
    price: 25999.99,
    stock: 10,
    category_slug: 'televisions',
    status: true,
    brand_slug: 'vu',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 40,
    name: 'Mi 4A Pro TV',
    description: '32 inch HD Ready Smart TV',
    slug: 'mi-4a-pro-tv',
    sku: 'TV-008',
    price: 15999.99,
    stock: 15,
    category_slug: 'televisions',
    status: true,
    brand_slug: 'mi',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Fans & Other appliances
  {
    id: 41,
    name: 'Havells Ceiling Fan',
    description: '1200mm Energy Saving Fan',
    slug: 'havells-ceiling-fan',
    sku: 'FAN-001',
    price: 2499.99,
    stock: 30,
    category_slug: 'fans-other',
    status: true,
    brand_slug: 'havells',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 42,
    name: 'Usha Table Fan',
    description: '400mm Table Fan',
    slug: 'usha-table-fan',
    sku: 'FAN-002',
    price: 1599.99,
    stock: 18,
    category_slug: 'fans-other',
    status: true,
    brand_slug: 'usha',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 43,
    name: 'Bajaj Pedestal Fan',
    description: 'High Speed Pedestal Fan',
    slug: 'bajaj-pedestal-fan',
    sku: 'FAN-003',
    price: 1999.99,
    stock: 22,
    category_slug: 'fans-other',
    status: true,
    brand_slug: 'bajaj',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 44,
    name: 'Orient Wall Fan',
    description: '400mm Wall Fan',
    slug: 'orient-wall-fan',
    sku: 'FAN-004',
    price: 1799.99,
    stock: 15,
    category_slug: 'fans-other',
    status: true,
    brand_slug: 'orient',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 45,
    name: 'Crompton Exhaust Fan',
    description: '250mm Exhaust Fan',
    slug: 'crompton-exhaust-fan',
    sku: 'FAN-005',
    price: 1299.99,
    stock: 20,
    category_slug: 'fans-other',
    status: true,
    brand_slug: 'crompton',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 46,
    name: 'V-Guard Pedestal Fan',
    description: 'High Speed Pedestal Fan',
    slug: 'v-guard-pedestal-fan',
    sku: 'FAN-006',
    price: 2199.99,
    stock: 13,
    category_slug: 'fans-other',
    status: true,
    brand_slug: 'v-guard',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 47,
    name: 'Khaitan Table Fan',
    description: '300mm Table Fan',
    slug: 'khaitan-table-fan',
    sku: 'FAN-007',
    price: 1399.99,
    stock: 17,
    category_slug: 'fans-other',
    status: true,
    brand_slug: 'khaitan',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 48,
    name: 'Polycab Ceiling Fan',
    description: '1200mm Decorative Fan',
    slug: 'polycab-ceiling-fan',
    sku: 'FAN-008',
    price: 2699.99,
    stock: 11,
    category_slug: 'fans-other',
    status: true,
    brand_slug: 'polycab',
    photo: 'products/homeAppliance.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Men's Wear
  {
    id: 50,
    name: 'Cotton T-Shirt',
    description: 'Comfortable cotton t-shirt for everyday wear',
    slug: 'cotton-tshirt',
    sku: 'CT-001',
    price: 960.00,
    stock: 100,
    category_slug: 'mens-tops',
    brand_slug: 'zara',
    status: true,
    photo: 'products/TShirt.png',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 51,
    name: 'Sports T-Shirt',
    description: 'Moisture-wicking sports t-shirt for active lifestyle',
    slug: 'sports-tshirt',
    sku: 'ST-001',
    price: 800.00,
    stock: 80,
    category_slug: 'mens-tops',
    brand_slug: 'nike',
    status: true,
    photo: 'products/TShirt.png',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 52,
    name: 'Graphic Print T-Shirt',
    description: 'Stylish t-shirt with unique graphic print',
    slug: 'graphic-tshirt',
    sku: 'GT-001',
    price: 1040.00,
    stock: 60,
    category_slug: 'mens-tops',
    brand_slug: 'levis',
    status: true,
    photo: 'products/TShirt.png',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 53,
    name: 'V-Neck Casual Tee',
    description: 'Comfortable V-neck tee for casual occasions',
    slug: 'vneck-tee',
    sku: 'VT-001',
    price: 720.00,
    stock: 90,
    category_slug: 'mens-tops',
    brand_slug: 'hm',
    status: true,
    photo: 'products/TShirt.png',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 54,
    name: 'Polo Shirt',
    description: 'Classic polo shirt for smart casual look',
    slug: 'polo-shirt',
    sku: 'PS-001',
    price: 1440.00,
    stock: 70,
    category_slug: 'mens-tops',
    brand_slug: 'allen-solly',
    status: true,
    photo: 'products/TShirt.png',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Bottoms
  {
    id: 55,
    name: 'Slim Fit Denim Jeans',
    description: 'Classic denim jeans with slim fit',
    slug: 'slim-fit-jeans',
    sku: 'SFJ-001',
    price: 1600.00,
    stock: 80,
    category_slug: 'mens-bottoms',
    brand_slug: 'levis',
    status: true,
    photo: 'products/FormalTrouser.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 56,
    name: 'Comfortable Track Pants',
    description: 'Soft and comfortable track pants',
    slug: 'track-pants',
    sku: 'TP-001',
    price: 1200.00,
    stock: 90,
    category_slug: 'mens-bottoms',
    brand_slug: 'adidas',
    status: true,
    photo: 'products/FormalTrouser.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 57,
    name: 'Cargo Shorts',
    description: 'Durable cargo shorts with multiple pockets',
    slug: 'cargo-shorts',
    sku: 'CS-001',
    price: 880.00,
    stock: 70,
    category_slug: 'mens-bottoms',
    brand_slug: 'zara',
    status: true,
    photo: 'products/FormalTrouser.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 58,
    name: 'Chinos',
    description: 'Versatile chinos for smart casual look',
    slug: 'chinos',
    sku: 'CH-001',
    price: 1520.00,
    stock: 60,
    category_slug: 'mens-bottoms',
    brand_slug: 'van-heusen',
    status: true,
    photo: 'products/FormalTrouser.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 59,
    name: 'Formal Trousers',
    description: 'Elegant formal trousers for business',
    slug: 'formal-trousers',
    sku: 'FT-001',
    price: 1760.00,
    stock: 50,
    category_slug: 'mens-bottoms',
    brand_slug: 'peter-england',
    status: true,
    photo: 'products/FormalTrouser.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Footwear
  {
    id: 60,
    name: "Men's Casual Sneakers",
    description: 'Comfortable and stylish casual sneakers',
    slug: 'mens-casual-sneakers',
    sku: 'MCS-001',
    price: 2000.00,
    stock: 100,
    category_slug: 'mens-footwear',
    brand_slug: 'nike',
    status: true,
    photo: 'products/MensCasualSneakers.png',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 61,
    name: 'Formal Leather Shoes',
    description: 'Elegant leather shoes for formal occasions',
    slug: 'formal-leather-shoes',
    sku: 'FLS-001',
    price: 3200.00,
    stock: 60,
    category_slug: 'mens-footwear',
    brand_slug: 'bata',
    status: true,
    photo: 'products/MensCasualSneakers.png',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 62,
    name: 'Running Sports Shoes',
    description: 'Lightweight running shoes for athletes',
    slug: 'running-shoes',
    sku: 'RS-001',
    price: 2400.00,
    stock: 75,
    category_slug: 'mens-footwear',
    brand_slug: 'adidas',
    status: true,
    photo: 'products/MensCasualSneakers.png',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Accessories
  {
    id: 63,
    name: 'Leather Wallet',
    description: 'Stylish and durable leather wallet',
    slug: 'leather-wallet',
    sku: 'LW-001',
    price: 960.00,
    stock: 120,
    category_slug: 'mens-accessories',
    brand_slug: 'levis',
    status: true,
    photo: 'products/AviatorSunglasses.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 64,
    name: "Men's Watch",
    description: 'Classic analog watch for men',
    slug: 'mens-watch',
    sku: 'MW-001',
    price: 2400.00,
    stock: 80,
    category_slug: 'mens-accessories',
    brand_slug: 'fossil',
    status: true,
    photo: 'products/AviatorSunglasses.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 65,
    name: 'Aviator Sunglasses',
    description: 'Classic aviator sunglasses with UV protection',
    slug: 'aviator-sunglasses',
    sku: 'AS-001',
    price: 1200.00,
    stock: 90,
    category_slug: 'mens-accessories',
    brand_slug: 'ray-ban',
    status: true,
    photo: 'products/AviatorSunglasses.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Outerwear
  {
    id: 66,
    name: 'Stylish Winter Jacket',
    description: 'Warm and stylish winter jacket',
    slug: 'winter-jacket',
    sku: 'WJ-001',
    price: 4000.00,
    stock: 45,
    category_slug: 'mens-outerwear',
    brand_slug: 'zara',
    status: true,
    photo: 'products/ClassicDenimJacket.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 67,
    name: 'Classic Denim Jacket',
    description: 'Timeless denim jacket for casual wear',
    slug: 'denim-jacket',
    sku: 'DJ-001',
    price: 2800.00,
    stock: 70,
    category_slug: 'mens-outerwear',
    brand_slug: 'levis',
    status: true,
    photo: 'products/ClassicDenimJacket.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 68,
    name: 'Leather Biker Jacket',
    description: 'Edgy leather biker jacket',
    slug: 'biker-jacket',
    sku: 'BJ-001',
    price: 6400.00,
    stock: 25,
    category_slug: 'mens-outerwear',
    brand_slug: 'jack-jones',
    status: true,
    photo: 'products/ClassicDenimJacket.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Suits & Formals
  {
    id: 69,
    name: 'Navy Blue Business Suit',
    description: 'Premium quality navy blue business suit',
    slug: 'navy-business-suit',
    sku: 'NBS-001',
    price: 6400.00,
    stock: 30,
    category_slug: 'mens-suits-formals',
    brand_slug: 'louis-philippe',
    status: true,
    photo: 'products/ThreePieceSuit.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 70,
    name: 'Formal White Shirt',
    description: 'Crisp white formal shirt',
    slug: 'formal-white-shirt',
    sku: 'FWS-001',
    price: 1440.00,
    stock: 85,
    category_slug: 'mens-suits-formals',
    brand_slug: 'arrow',
    status: true,
    photo: 'products/ThreePieceSuit.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 71,
    name: 'Black Tuxedo',
    description: 'Elegant black tuxedo for special events',
    slug: 'black-tuxedo',
    sku: 'BT-001',
    price: 9600.00,
    stock: 20,
    category_slug: 'mens-suits-formals',
    brand_slug: 'van-heusen',
    status: true,
    photo: 'products/ThreePieceSuit.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Underwear & Loungewear
  {
    id: 72,
    name: 'Cotton Boxer Briefs',
    description: 'Comfortable cotton boxer briefs',
    slug: 'cotton-boxer-briefs',
    sku: 'CBB-001',
    price: 599.00,
    stock: 200,
    category_slug: 'mens-underwear-loungewear',
    brand_slug: 'jockey',
    status: true,
    photo: 'products/TerryRobe.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 73,
    name: 'Silk Pajamas',
    description: 'Luxurious silk pajamas for comfortable sleep',
    slug: 'silk-pajamas',
    sku: 'SP-001',
    price: 2000.00,
    stock: 50,
    category_slug: 'mens-underwear-loungewear',
    brand_slug: 'zara',
    status: true,
    photo: 'products/TerryRobe.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // New Arrivals
  {
    id: 74,
    name: 'Hooded Sweatshirt',
    description: 'Warm hooded sweatshirt for cooler days',
    slug: 'hooded-sweatshirt',
    sku: 'HS-001',
    price: 2000.00,
    stock: 50,
    category_slug: 'mens-new-arrivals',
    brand_slug: 'hm',
    status: true,
    photo: 'products/JerseyLoungePants.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 75,
    name: 'Running Top',
    description: 'Lightweight performance top for running',
    slug: 'running-top',
    sku: 'RT-001',
    price: 880.00,
    stock: 75,
    category_slug: 'mens-new-arrivals',
    brand_slug: 'nike',
    status: true,
    photo: 'products/JerseyLoungePants.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Seasonal Collections
  {
    id: 76,
    name: 'Holiday Sweater',
    description: 'Festive sweater for the holiday season',
    slug: 'holiday-sweater',
    sku: 'HS-002',
    price: 1440.00,
    stock: 40,
    category_slug: 'mens-seasonal-collections',
    brand_slug: 'zara',
    status: true,
    photo: 'products/SummerCollectionTShirt.jpg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 77,
    name: 'Beach Shorts',
    description: 'Quick-dry beach shorts for summer',
    slug: 'beach-shorts',
    sku: 'BS-001',
    price: 800.00,
    stock: 60,
    category_slug: 'mens-seasonal-collections',
    brand_slug: 'zara',
    status: true,
    photo: 'products/SummerCollectionTShirt.jpg',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const productVariations = [
  // Example: { product_sku: 'CT-001', sku: 'CT-001-S-White', ... }
  { product_sku: 'CT-001', sku: 'CT-001-S-White', price: 960.00, stock: 25, attributes: JSON.stringify({ size: 'S', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'CT-001', sku: 'CT-001-M-Black', price: 960.00, stock: 35, attributes: JSON.stringify({ size: 'M', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'CT-001', sku: 'CT-001-L-Blue', price: 960.00, stock: 40, attributes: JSON.stringify({ size: 'L', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Sports T-Shirt (id: 51)
  { product_sku: 'ST-001', sku: 'ST-001-S-Grey', price: 800.00, stock: 20, attributes: JSON.stringify({ size: 'S', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'ST-001', sku: 'ST-001-M-Blue', price: 800.00, stock: 30, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'ST-001', sku: 'ST-001-L-Black', price: 800.00, stock: 30, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Graphic Print T-Shirt (id: 52)
  { product_sku: 'GT-001', sku: 'GT-001-M-White', price: 1040.00, stock: 20, attributes: JSON.stringify({ size: 'M', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'GT-001', sku: 'GT-001-L-Black', price: 1040.00, stock: 20, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'GT-001', sku: 'GT-001-XL-Red', price: 1040.00, stock: 20, attributes: JSON.stringify({ size: 'XL', color: 'Red' }), status: true, created_at: new Date(), updated_at: new Date() },

  // V-Neck Casual Tee (id: 53)
  { product_sku: 'VT-001', sku: 'VT-001-S-Green', price: 720.00, stock: 30, attributes: JSON.stringify({ size: 'S', color: 'Green' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'VT-001', sku: 'VT-001-M-Blue', price: 720.00, stock: 30, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'VT-001', sku: 'VT-001-L-Black', price: 720.00, stock: 30, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Polo Shirt (id: 54)
  { product_sku: 'PS-001', sku: 'PS-001-M-Navy', price: 1200.00, stock: 20, attributes: JSON.stringify({ size: 'M', color: 'Navy' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'PS-001', sku: 'PS-001-L-White', price: 1200.00, stock: 20, attributes: JSON.stringify({ size: 'L', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Hooded Sweatshirt (id: 55)
  { product_sku: 'HS-001', sku: 'HS-001-M-Grey', price: 1600.00, stock: 15, attributes: JSON.stringify({ size: 'M', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'HS-001', sku: 'HS-001-L-Black', price: 1600.00, stock: 15, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Long Sleeve Henley (id: 72)
  { product_sku: 'LSH-001', sku: 'LSH-001-M-White', price: 1200.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'LSH-001', sku: 'LSH-001-L-Grey', price: 1200.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Running Top (id: 75)
  { product_sku: 'RT-001', sku: 'RT-001-M-Blue', price: 880.00, stock: 25, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'RT-001', sku: 'RT-001-L-Black', price: 880.00, stock: 25, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Flannel Shirt (id: 73)
  { product_sku: 'FS-001', sku: 'FS-001-M-Red', price: 1440.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Red' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'FS-001', sku: 'FS-001-L-Green', price: 1440.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Green' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Check Shirt (id: 74)
  { product_sku: 'CS-001', sku: 'CS-001-M-Blue', price: 1200.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'CS-001', sku: 'CS-001-L-Red', price: 1200.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Red' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Denim Shirt (id: 70)
  { product_sku: 'DS-001', sku: 'DS-001-M-Blue', price: 1600.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'DS-001', sku: 'DS-001-L-Black', price: 1600.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Printed Shirt (id: 71)
  { product_sku: 'PRS-001', sku: 'PRS-001-M-White', price: 1360.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'PRS-001', sku: 'PRS-001-L-Blue', price: 1360.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Linen Shirt (id: 69)
  { product_sku: 'LS-001', sku: 'LS-001-M-Beige', price: 1760.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Beige' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'LS-001', sku: 'LS-001-L-White', price: 1760.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Cuban Collar Shirt (id: 68)
  { product_sku: 'CCS-001', sku: 'CCS-001-M-Green', price: 1520.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Green' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'CCS-001', sku: 'CCS-001-L-Blue', price: 1520.00, stock: 10, attributes: JSON.stringify({ size: 'L', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Bottoms (category_slug: 102)
  // Jeans (id: 56)
  { product_sku: 'JNS-001', sku: 'JNS-001-30-Blue', price: 1760.00, stock: 20, attributes: JSON.stringify({ waist: '30', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'JNS-001', sku: 'JNS-001-32-Black', price: 1760.00, stock: 20, attributes: JSON.stringify({ waist: '32', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'JNS-001', sku: 'JNS-001-34-Grey', price: 1760.00, stock: 20, attributes: JSON.stringify({ waist: '34', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Chinos (id: 58)
  { product_sku: 'CH-001', sku: 'CH-001-32-Khaki', price: 1520.00, stock: 20, attributes: JSON.stringify({ waist: '32', color: 'Khaki' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'CH-001', sku: 'CH-001-34-Navy', price: 1520.00, stock: 20, attributes: JSON.stringify({ waist: '34', color: 'Navy' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Formal Trousers (id: 59)
  { product_sku: 'FT-001', sku: 'FT-001-32-Grey', price: 1760.00, stock: 15, attributes: JSON.stringify({ waist: '32', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'FT-001', sku: 'FT-001-34-Black', price: 1760.00, stock: 15, attributes: JSON.stringify({ waist: '34', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Shorts (id: 57)
  { product_sku: 'SH-001', sku: 'SH-001-M-Navy', price: 1040.00, stock: 20, attributes: JSON.stringify({ size: 'M', color: 'Navy' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'SH-001', sku: 'SH-001-L-Grey', price: 1040.00, stock: 20, attributes: JSON.stringify({ size: 'L', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Footwear (category_slug: 103)
  // Men's Casual Sneakers (id: 60)
  { product_sku: 'MCS-001', sku: 'MCS-001-8-White', price: 2000.00, stock: 30, attributes: JSON.stringify({ size: '8', color: 'White' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'MCS-001', sku: 'MCS-001-9-Black', price: 2000.00, stock: 40, attributes: JSON.stringify({ size: '9', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'MCS-001', sku: 'MCS-001-10-Blue', price: 2000.00, stock: 30, attributes: JSON.stringify({ size: '10', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Formal Leather Shoes (id: 61)
  { product_sku: 'FLS-001', sku: 'FLS-001-8-Brown', price: 3200.00, stock: 20, attributes: JSON.stringify({ size: '8', color: 'Brown' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'FLS-001', sku: 'FLS-001-9-Black', price: 3200.00, stock: 20, attributes: JSON.stringify({ size: '9', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Running Sports Shoes (id: 62)
  { product_sku: 'RS-001', sku: 'RS-001-8-Blue', price: 2400.00, stock: 25, attributes: JSON.stringify({ size: '8', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'RS-001', sku: 'RS-001-9-Grey', price: 2400.00, stock: 25, attributes: JSON.stringify({ size: '9', color: 'Grey' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Accessories (category_slug: 104)
  // Leather Wallet (id: 63)
  { product_sku: 'LW-001', sku: 'LW-001-Brown', price: 960.00, stock: 60, attributes: JSON.stringify({ color: 'Brown' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'LW-001', sku: 'LW-001-Black', price: 960.00, stock: 60, attributes: JSON.stringify({ color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Men's Watch (id: 64)
  { product_sku: 'MW-001', sku: 'MW-001-Silver', price: 2400.00, stock: 40, attributes: JSON.stringify({ color: 'Silver' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'MW-001', sku: 'MW-001-Black', price: 2400.00, stock: 40, attributes: JSON.stringify({ color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Aviator Sunglasses (id: 65)
  { product_sku: 'AS-001', sku: 'AS-001-Gold', price: 1200.00, stock: 45, attributes: JSON.stringify({ color: 'Gold' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'AS-001', sku: 'AS-001-Silver', price: 1200.00, stock: 45, attributes: JSON.stringify({ color: 'Silver' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Outerwear (category_slug: 105)
  // Stylish Winter Jacket (id: 66)
  { product_sku: 'WJ-001', sku: 'WJ-001-M-Black', price: 4000.00, stock: 20, attributes: JSON.stringify({ size: 'M', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'WJ-001', sku: 'WJ-001-L-Navy', price: 4000.00, stock: 25, attributes: JSON.stringify({ size: 'L', color: 'Navy' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Classic Denim Jacket (id: 67)
  { product_sku: 'DJ-001', sku: 'DJ-001-M-Blue', price: 2800.00, stock: 35, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'DJ-001', sku: 'DJ-001-L-Black', price: 2800.00, stock: 35, attributes: JSON.stringify({ size: 'L', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Leather Biker Jacket (id: 68)
  { product_sku: 'BJ-001', sku: 'BJ-001-M-Black', price: 6400.00, stock: 10, attributes: JSON.stringify({ size: 'M', color: 'Black' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'BJ-001', sku: 'BJ-001-L-Brown', price: 6400.00, stock: 15, attributes: JSON.stringify({ size: 'L', color: 'Brown' }), status: true, created_at: new Date(), updated_at: new Date() },

  // New Arrivals (category_slug: 108)
  // Hooded Sweatshirt (id: 55) - already above
  // Running Top (id: 75) - already above

  // Seasonal Collections (category_slug: 109)
  // Holiday Sweater (id: 76)
  { product_sku: 'HS-002', sku: 'HS-002-M-Red', price: 1440.00, stock: 20, attributes: JSON.stringify({ size: 'M', color: 'Red' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'HS-002', sku: 'HS-002-L-Green', price: 1440.00, stock: 20, attributes: JSON.stringify({ size: 'L', color: 'Green' }), status: true, created_at: new Date(), updated_at: new Date() },

  // Beach Shorts (id: 77)
  { product_sku: 'BS-001', sku: 'BS-001-M-Blue', price: 800.00, stock: 30, attributes: JSON.stringify({ size: 'M', color: 'Blue' }), status: true, created_at: new Date(), updated_at: new Date() },
  { product_sku: 'BS-001', sku: 'BS-001-L-Yellow', price: 800.00, stock: 30, attributes: JSON.stringify({ size: 'L', color: 'Yellow' }), status: true, created_at: new Date(), updated_at: new Date() }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Import Category model
    const Category = require('../../models/category');

    // Clear existing data
    await Product.deleteMany({});
    await ProductVariation.deleteMany({});
    // Do not clear categories here!
    console.log('Cleared products and product variations');

    // Get all categories and build slug->ObjectId map
    const categoryDocs = await Category.find({});
    const categorySlugToId = {};
    categoryDocs.forEach(c => { categorySlugToId[c.slug] = c._id; });

    // DEBUG: Log missing category slugs
    let missingSlugs = new Set();
    products.forEach(p => {
      if (!categorySlugToId[p.category_slug]) {
        console.error('Missing category for slug:', p.category_slug, 'in product:', p.name);
        missingSlugs.add(p.category_slug);
      }
    });
    if (missingSlugs.size > 0) {
      console.error('All missing category slugs:', Array.from(missingSlugs));
    }

    // Remove brand deletion and insertion. Fetch brands from DB instead.
    const brandDocs = await Brand.find({});
    const brandSlugToId = {};
    brandDocs.forEach(b => { brandSlugToId[b.slug] = b._id; });

    // DEBUG: Log missing brand slugs before inserting products
    products.forEach(p => {
      if (!brandSlugToId[p.brand_slug]) {
        console.error('Missing brand for slug:', p.brand_slug, 'in product:', p.name);
      }
    });

    // Insert products (update brand_id, category_id, sub_category_id to ObjectId)
    const productDocs = await Product.insertMany(products.map(p => {
      const categoryDoc = categoryDocs.find(c => c.slug === p.category_slug);
      let category_id = null;
      let sub_category_id = null;
      if (categoryDoc) {
        if (categoryDoc.parent_id) {
          // This is a subcategory
          category_id = categoryDoc.parent_id;
          sub_category_id = categoryDoc._id;
        } else {
          // This is a parent category
          category_id = categoryDoc._id;
          sub_category_id = null;
        }
      }
      return {
        ...p,
        brand_id: brandSlugToId[p.brand_slug],
        category_id,
        sub_category_id,
      };
    }));
    const skuToProductId = {};
    productDocs.forEach(p => { skuToProductId[p.sku] = p._id; });

    // Insert product variations (update product_id to ObjectId)
    const skuToProductName = {};
    products.forEach(p => { skuToProductName[p.sku] = p.name; });

    // DEBUG: Log missing product_sku
    let missingProductSkus = new Set();
    const validVariations = productVariations.map(v => {
      const attrs = v.attributes ? Object.entries(JSON.parse(v.attributes)).map(([k, val]) => `${val}`).join(' / ') : '';
      const product_id = skuToProductId[v.product_sku];
      if (!product_id) {
        console.error('Missing product for variation SKU:', v.product_sku, 'variation:', v.sku);
        missingProductSkus.add(v.product_sku);
      }
      return {
        ...v,
        name: `${skuToProductName[v.product_sku] || v.product_sku}${attrs ? ' - ' + attrs : ''}`,
        product_id
      };
    }).filter(v => v.product_id);
    if (missingProductSkus.size > 0) {
      console.error('All missing product SKUs for variations:', Array.from(missingProductSkus));
    }

    await ProductVariation.insertMany(validVariations);

    console.log('Products and product variations seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
}

seed(); 