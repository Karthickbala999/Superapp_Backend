'use strict';

const Permission = require('../../models/Permission');
const Role = require('../../models/Role');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🌱 Seeding permissions...');

      // Define all permissions for category-specific access
      const permissions = [
        // E-commerce Module - Electronics
        { name: 'products:create:electronics', description: 'Can create electronics products', resource: 'products', action: 'create', category: 'electronics', module: 'ecommerce' },
        { name: 'products:read:electronics', description: 'Can read electronics products', resource: 'products', action: 'read', category: 'electronics', module: 'ecommerce' },
        { name: 'products:update:electronics', description: 'Can update electronics products', resource: 'products', action: 'update', category: 'electronics', module: 'ecommerce' },
        { name: 'products:delete:electronics', description: 'Can delete electronics products', resource: 'products', action: 'delete', category: 'electronics', module: 'ecommerce' },
        { name: 'orders:read:electronics', description: 'Can read electronics orders', resource: 'orders', action: 'read', category: 'electronics', module: 'ecommerce' },
        { name: 'orders:update:electronics', description: 'Can update electronics orders', resource: 'orders', action: 'update', category: 'electronics', module: 'ecommerce' },
        { name: 'categories:read:electronics', description: 'Can read electronics categories', resource: 'categories', action: 'read', category: 'electronics', module: 'ecommerce' },

        // E-commerce Module - Clothing
        { name: 'products:create:clothing', description: 'Can create clothing products', resource: 'products', action: 'create', category: 'clothing', module: 'ecommerce' },
        { name: 'products:read:clothing', description: 'Can read clothing products', resource: 'products', action: 'read', category: 'clothing', module: 'ecommerce' },
        { name: 'products:update:clothing', description: 'Can update clothing products', resource: 'products', action: 'update', category: 'clothing', module: 'ecommerce' },
        { name: 'products:delete:clothing', description: 'Can delete clothing products', resource: 'products', action: 'delete', category: 'clothing', module: 'ecommerce' },
        { name: 'orders:read:clothing', description: 'Can read clothing orders', resource: 'orders', action: 'read', category: 'clothing', module: 'ecommerce' },
        { name: 'orders:update:clothing', description: 'Can update clothing orders', resource: 'orders', action: 'update', category: 'clothing', module: 'ecommerce' },
        { name: 'categories:read:clothing', description: 'Can read clothing categories', resource: 'categories', action: 'read', category: 'clothing', module: 'ecommerce' },

        // Grocery Module
        { name: 'products:create:groceries', description: 'Can create grocery products', resource: 'products', action: 'create', category: 'groceries', module: 'grocery' },
        { name: 'products:read:groceries', description: 'Can read grocery products', resource: 'products', action: 'read', category: 'groceries', module: 'grocery' },
        { name: 'products:update:groceries', description: 'Can update grocery products', resource: 'products', action: 'update', category: 'groceries', module: 'grocery' },
        { name: 'products:delete:groceries', description: 'Can delete grocery products', resource: 'products', action: 'delete', category: 'groceries', module: 'grocery' },
        { name: 'orders:read:groceries', description: 'Can read grocery orders', resource: 'orders', action: 'read', category: 'groceries', module: 'grocery' },
        { name: 'orders:update:groceries', description: 'Can update grocery orders', resource: 'orders', action: 'update', category: 'groceries', module: 'grocery' },
        { name: 'categories:read:groceries', description: 'Can read grocery categories', resource: 'categories', action: 'read', category: 'groceries', module: 'grocery' },

        // Restaurant Module
        { name: 'products:create:restaurants', description: 'Can create restaurant products', resource: 'products', action: 'create', category: 'restaurants', module: 'restaurant' },
        { name: 'products:read:restaurants', description: 'Can read restaurant products', resource: 'products', action: 'read', category: 'restaurants', module: 'restaurant' },
        { name: 'products:update:restaurants', description: 'Can update restaurant products', resource: 'products', action: 'update', category: 'restaurants', module: 'restaurant' },
        { name: 'products:delete:restaurants', description: 'Can delete restaurant products', resource: 'products', action: 'delete', category: 'restaurants', module: 'restaurant' },
        { name: 'orders:read:restaurants', description: 'Can read restaurant orders', resource: 'orders', action: 'read', category: 'restaurants', module: 'restaurant' },
        { name: 'orders:update:restaurants', description: 'Can update restaurant orders', resource: 'orders', action: 'update', category: 'restaurants', module: 'restaurant' },
        { name: 'categories:read:restaurants', description: 'Can read restaurant categories', resource: 'categories', action: 'read', category: 'restaurants', module: 'restaurant' },

        // Hotel Module
        { name: 'products:create:hotels', description: 'Can create hotel products', resource: 'products', action: 'create', category: 'hotels', module: 'hotel' },
        { name: 'products:read:hotels', description: 'Can read hotel products', resource: 'products', action: 'read', category: 'hotels', module: 'hotel' },
        { name: 'products:update:hotels', description: 'Can update hotel products', resource: 'products', action: 'update', category: 'hotels', module: 'hotel' },
        { name: 'products:delete:hotels', description: 'Can delete hotel products', resource: 'products', action: 'delete', category: 'hotels', module: 'hotel' },
        { name: 'orders:read:hotels', description: 'Can read hotel orders', resource: 'orders', action: 'read', category: 'hotels', module: 'hotel' },
        { name: 'orders:update:hotels', description: 'Can update hotel orders', resource: 'orders', action: 'update', category: 'hotels', module: 'hotel' },
        { name: 'categories:read:hotels', description: 'Can read hotel categories', resource: 'categories', action: 'read', category: 'hotels', module: 'hotel' },

        // Taxi Module
        { name: 'products:create:taxi', description: 'Can create taxi products', resource: 'products', action: 'create', category: 'taxi', module: 'taxi' },
        { name: 'products:read:taxi', description: 'Can read taxi products', resource: 'products', action: 'read', category: 'taxi', module: 'taxi' },
        { name: 'products:update:taxi', description: 'Can update taxi products', resource: 'products', action: 'update', category: 'taxi', module: 'taxi' },
        { name: 'products:delete:taxi', description: 'Can delete taxi products', resource: 'products', action: 'delete', category: 'taxi', module: 'taxi' },
        { name: 'orders:read:taxi', description: 'Can read taxi orders', resource: 'orders', action: 'read', category: 'taxi', module: 'taxi' },
        { name: 'orders:update:taxi', description: 'Can update taxi orders', resource: 'orders', action: 'update', category: 'taxi', module: 'taxi' },
        { name: 'categories:read:taxi', description: 'Can read taxi categories', resource: 'categories', action: 'read', category: 'taxi', module: 'taxi' },

        // Admin Module - All categories
        { name: 'products:create:all', description: 'Can create products in all categories', resource: 'products', action: 'create', category: 'all', module: 'admin' },
        { name: 'products:read:all', description: 'Can read products in all categories', resource: 'products', action: 'read', category: 'all', module: 'admin' },
        { name: 'products:update:all', description: 'Can update products in all categories', resource: 'products', action: 'update', category: 'all', module: 'admin' },
        { name: 'products:delete:all', description: 'Can delete products in all categories', resource: 'products', action: 'delete', category: 'all', module: 'admin' },
        { name: 'orders:read:all', description: 'Can read orders in all categories', resource: 'orders', action: 'read', category: 'all', module: 'admin' },
        { name: 'orders:update:all', description: 'Can update orders in all categories', resource: 'orders', action: 'update', category: 'all', module: 'admin' },
        { name: 'categories:read:all', description: 'Can read categories in all modules', resource: 'categories', action: 'read', category: 'all', module: 'admin' },
        { name: 'categories:create:all', description: 'Can create categories in all modules', resource: 'categories', action: 'create', category: 'all', module: 'admin' },
        { name: 'categories:update:all', description: 'Can update categories in all modules', resource: 'categories', action: 'update', category: 'all', module: 'admin' },
        { name: 'categories:delete:all', description: 'Can delete categories in all modules', resource: 'categories', action: 'delete', category: 'all', module: 'admin' },

        // User Management
        { name: 'users:create:all', description: 'Can create users', resource: 'users', action: 'create', category: 'all', module: 'admin' },
        { name: 'users:read:all', description: 'Can read users', resource: 'users', action: 'read', category: 'all', module: 'admin' },
        { name: 'users:update:all', description: 'Can update users', resource: 'users', action: 'update', category: 'all', module: 'admin' },
        { name: 'users:delete:all', description: 'Can delete users', resource: 'users', action: 'delete', category: 'all', module: 'admin' },

        // Role Management
        { name: 'roles:create:all', description: 'Can create roles', resource: 'roles', action: 'create', category: 'all', module: 'admin' },
        { name: 'roles:read:all', description: 'Can read roles', resource: 'roles', action: 'read', category: 'all', module: 'admin' },
        { name: 'roles:update:all', description: 'Can update roles', resource: 'roles', action: 'update', category: 'all', module: 'admin' },
        { name: 'roles:delete:all', description: 'Can delete roles', resource: 'roles', action: 'delete', category: 'all', module: 'admin' },

        // Permission Management
        { name: 'permissions:create:all', description: 'Can create permissions', resource: 'permissions', action: 'create', category: 'all', module: 'admin' },
        { name: 'permissions:read:all', description: 'Can read permissions', resource: 'permissions', action: 'read', category: 'all', module: 'admin' },
        { name: 'permissions:update:all', description: 'Can update permissions', resource: 'permissions', action: 'update', category: 'all', module: 'admin' },
        { name: 'permissions:delete:all', description: 'Can delete permissions', resource: 'permissions', action: 'delete', category: 'all', module: 'admin' },

        // Staff Management
        { name: 'staff:create:all', description: 'Can create staff', resource: 'staff', action: 'create', category: 'all', module: 'admin' },
        { name: 'staff:read:all', description: 'Can read staff', resource: 'staff', action: 'read', category: 'all', module: 'admin' },
        { name: 'staff:update:all', description: 'Can update staff', resource: 'staff', action: 'update', category: 'all', module: 'admin' },
        { name: 'staff:delete:all', description: 'Can delete staff', resource: 'staff', action: 'delete', category: 'all', module: 'admin' }
      ];

      // Create permissions
      const createdPermissions = await Permission.insertMany(permissions);
      console.log(`✅ Created ${createdPermissions.length} permissions`);

      // Create roles with permissions
      const electronicsVendorPermissions = createdPermissions.filter(p => 
        p.category === 'electronics' && ['products:create', 'products:read', 'products:update', 'orders:read'].includes(`${p.resource}:${p.action}`)
      );

      const groceryVendorPermissions = createdPermissions.filter(p => 
        p.category === 'groceries' && ['products:create', 'products:read', 'products:update', 'orders:read'].includes(`${p.resource}:${p.action}`)
      );

      const restaurantVendorPermissions = createdPermissions.filter(p => 
        p.category === 'restaurants' && ['products:create', 'products:read', 'products:update', 'orders:read'].includes(`${p.resource}:${p.action}`)
      );

      const adminPermissions = createdPermissions.filter(p => 
        p.category === 'all' || p.resource === 'users' || p.resource === 'roles' || p.resource === 'permissions' || p.resource === 'staff'
      );

      const roles = [
        {
          name: 'electronics_vendor',
          description: 'Electronics product vendor with limited access',
          permissions: electronicsVendorPermissions.map(p => p._id),
          legacy_role: 'ecommerce_admin',
          status: true
        },
        {
          name: 'grocery_vendor',
          description: 'Grocery product vendor with limited access',
          permissions: groceryVendorPermissions.map(p => p._id),
          legacy_role: 'grocery_admin',
          status: true
        },
        {
          name: 'restaurant_vendor',
          description: 'Restaurant product vendor with limited access',
          permissions: restaurantVendorPermissions.map(p => p._id),
          legacy_role: 'restaurant_admin',
          status: true
        },
        {
          name: 'super_admin',
          description: 'Super administrator with full access',
          permissions: adminPermissions.map(p => p._id),
          legacy_role: 'admin',
          status: true
        }
      ];

      const createdRoles = await Role.insertMany(roles);
      console.log(`✅ Created ${createdRoles.length} roles with permissions`);

      console.log('✅ Permission seeding completed successfully!');
    } catch (error) {
      console.error('❌ Permission seeding failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🗑️  Removing permissions and roles...');
      
      await Role.deleteMany({});
      await Permission.deleteMany({});
      
      console.log('✅ Permissions and roles removed successfully!');
    } catch (error) {
      console.error('❌ Error removing permissions and roles:', error);
      throw error;
    }
  }
}; 