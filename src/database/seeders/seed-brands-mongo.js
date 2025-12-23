const mongoose = require('mongoose');
const Brand = require('../../models/Brand');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;
console.log('Connecting to:', MONGO_URI);

const brandsData = [
  { name: 'LG', slug: 'lg', photo: 'brands/lg.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Samsung', slug: 'samsung', photo: 'brands/samsung.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Whirlpool', slug: 'whirlpool', photo: 'brands/whirlpool.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Godrej', slug: 'godrej', photo: 'brands/godrej.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Haier', slug: 'haier', photo: 'brands/haier.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Panasonic', slug: 'panasonic', photo: 'brands/panasonic.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Bosch', slug: 'bosch', photo: 'brands/bosch.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Hitachi', slug: 'hitachi', photo: 'brands/hitachi.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'IFB', slug: 'ifb', photo: 'brands/ifb.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Voltas', slug: 'voltas', photo: 'brands/voltas.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Blue Star', slug: 'blue-star', photo: 'brands/bluestar.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Symphony', slug: 'symphony', photo: 'brands/symphony.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Crompton', slug: 'crompton', photo: 'brands/crompton.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Daikin', slug: 'daikin', photo: 'brands/daikin.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Kenstar', slug: 'kenstar', photo: 'brands/kenstar.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Preethi', slug: 'preethi', photo: 'brands/preethi.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Philips', slug: 'philips', photo: 'brands/philips.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Bajaj', slug: 'bajaj', photo: 'brands/bajaj.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Prestige', slug: 'prestige', photo: 'brands/prestige.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Morphy Richards', slug: 'morphy-richards', photo: 'brands/morphy-richards.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Butterfly', slug: 'butterfly', photo: 'brands/butterfly.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Sujata', slug: 'sujata', photo: 'brands/sujata.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Kent', slug: 'kent', photo: 'brands/kent.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Sony', slug: 'sony', photo: 'brands/sony.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'TCL', slug: 'tcl', photo: 'brands/tcl.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'OnePlus', slug: 'oneplus', photo: 'brands/oneplus.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Vu', slug: 'vu', photo: 'brands/vu.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Mi', slug: 'mi', photo: 'brands/mi.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Havells', slug: 'havells', photo: 'brands/havells.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Usha', slug: 'usha', photo: 'brands/usha.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Orient', slug: 'orient', photo: 'brands/orient.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'V-Guard', slug: 'v-guard', photo: 'brands/v-guard.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Khaitan', slug: 'khaitan', photo: 'brands/khaitan.png', status: true, created_at: new Date(), updated_at: new Date() },
  { name: 'Polycab', slug: 'polycab', photo: 'brands/polycab.png', status: true, created_at: new Date(), updated_at: new Date() },
  // --- Added relevant clothing, footwear, and accessories brands ---
  { name: "Nike", slug: "nike", photo: "brands/nike.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Adidas", slug: "adidas", photo: "brands/adidas.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Puma", slug: "puma", photo: "brands/puma.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Levi's", slug: "levis", photo: "brands/levis.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Zara", slug: "zara", photo: "brands/zara.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "H&M", slug: "hm", photo: "brands/hm.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Allen Solly", slug: "allen-solly", photo: "brands/allen-solly.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Ray-Ban", slug: "ray-ban", photo: "brands/ray-ban.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Fossil", slug: "fossil", photo: "brands/fossil.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Woodland", slug: "woodland", photo: "brands/woodland.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Bata", slug: "bata", photo: "brands/bata.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Arrow", slug: "arrow", photo: "brands/arrow.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Peter England", slug: "peter-england", photo: "brands/peter-england.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Van Heusen", slug: "van-heusen", photo: "brands/van-heusen.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Wrangler", slug: "wrangler", photo: "brands/wrangler.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Pepe Jeans", slug: "pepe-jeans", photo: "brands/pepe-jeans.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "United Colors of Benetton", slug: "ucb", photo: "brands/ucb.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Reebok", slug: "reebok", photo: "brands/reebok.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Skechers", slug: "skechers", photo: "brands/skechers.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Clarks", slug: "clarks", photo: "brands/clarks.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Red Tape", slug: "red-tape", photo: "brands/red-tape.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Louis Philippe", slug: "louis-philippe", photo: "brands/louis-philippe.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Tommy Hilfiger", slug: "tommy-hilfiger", photo: "brands/tommy-hilfiger.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Calvin Klein", slug: "calvin-klein", photo: "brands/calvin-klein.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Gucci", slug: "gucci", photo: "brands/gucci.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Prada", slug: "prada", photo: "brands/prada.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Hermes", slug: "hermes", photo: "brands/hermes.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Versace", slug: "versace", photo: "brands/versace.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Armani", slug: "armani", photo: "brands/armani.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Diesel", slug: "diesel", photo: "brands/diesel.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Jack & Jones", slug: "jack-jones", photo: "brands/jack-jones.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Spykar", slug: "spykar", photo: "brands/spykar.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Lee", slug: "lee", photo: "brands/lee.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Mufti", slug: "mufti", photo: "brands/mufti.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Crocs", slug: "crocs", photo: "brands/crocs.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Liberty", slug: "liberty", photo: "brands/liberty.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Relaxo", slug: "relaxo", photo: "brands/relaxo.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Hush Puppies", slug: "hush-puppies", photo: "brands/hush-puppies.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Catwalk", slug: "catwalk", photo: "brands/catwalk.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Metro", slug: "metro", photo: "brands/metro.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Paragon", slug: "paragon", photo: "brands/paragon.png", status: true, created_at: new Date(), updated_at: new Date() },
  { name: "Jockey", slug: "jockey", photo: "brands/jockey.png", status: true, created_at: new Date(), updated_at: new Date() }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Optionally clear existing brands
    await Brand.deleteMany({});
    console.log('Cleared existing brands');

    await Brand.insertMany(brandsData);
    console.log('Brands inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding brands:', err);
    process.exit(1);
  }
}

seed(); 