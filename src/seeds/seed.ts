
import { Product } from '../modules/products/entities/product.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Brand } from '../modules/brands/entities/brand.entity';
import { User } from '../modules/users/entities/user.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/orderitem.entity';
import { Review } from '../modules/reviews/entities/review.entity';
import { Notification, NotificationType } from '../modules/notifications/entities/notification.entity';
import { FAQ } from '../modules/faqs/entities/faq.entity';
import { GiveawayEntry } from '../modules/giveaways/entities/giveawayentry.entity';
import { LoyaltyPoints } from '../modules/loyalty/entities/loyaltypoints.entity';
import { PolicyPage } from '../modules/policies/entities/policy.entity';
import { WarrantyRecord } from '../modules/warranty/entities/warrantyrecord.entity';
import { HomeCategory } from '../modules/homecategory/entities/homecategory.entity';
import { HeroBanner } from '../modules/herobanner/entities/herobanner.entity';
import { ProductVariant } from '../modules/products/entities/productvariant.entity';

import { faker } from '@faker-js/faker';
import AppDataSource from '../config/data-source';

async function seed() {
    await AppDataSource.initialize();

    // Brands
    const brandRepo = AppDataSource.getMongoRepository(Brand);
    const brands = Array.from({ length: 5 }, () => brandRepo.create({
        name: faker.company.name(),
        slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
        logo: faker.image.avatar(),
    }));
    await brandRepo.save(brands);

    // Categories (guarantee unique names)
    const categoryRepo = AppDataSource.getMongoRepository(Category);
    const categoryNames = new Set<string>();
    const categories: Category[] = [];
    while (categories.length < 5) {
        const name = faker.commerce.department();
        if (categoryNames.has(name)) continue;
        categoryNames.add(name);
        categories.push(categoryRepo.create({
            name,
            slug: faker.helpers.slugify(name).toLowerCase(),
            description: faker.lorem.sentence(),
            banner: faker.image.url(),
            priority: faker.number.int({ min: 1, max: 10 }),
        }));
    }
    await categoryRepo.save(categories);

    // Users
    const userRepo = AppDataSource.getMongoRepository(User);
    const users = Array.from({ length: 10 }, () => userRepo.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        password: faker.internet.password(),
        role: 'user',
        isAdmin: false,
        image: faker.image.avatar(),
    }));
    await userRepo.save(users);

    // Products
    const productRepo = AppDataSource.getMongoRepository(Product);
    const products = Array.from({ length: 10 }, () => productRepo.create({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        basePrice: faker.number.int({ min: 100, max: 1000 }),
        brandId: brands[faker.number.int({ min: 0, max: brands.length - 1 })].id.toString(),
        categoryId: categories[faker.number.int({ min: 0, max: categories.length - 1 })].id.toString(),
        sku: faker.string.alphanumeric(8),
        isFeatured: faker.datatype.boolean(),
        isNew: faker.datatype.boolean(),
        isHot: faker.datatype.boolean(),
        isOfficial: faker.datatype.boolean(),
        isComing: faker.datatype.boolean(),
        isPreOrder: faker.datatype.boolean(),
        seoTitle: faker.lorem.words(3),
        seoDescription: faker.lorem.sentence(),
        tags: [faker.commerce.productAdjective(), faker.commerce.productAdjective()],
        badges: [faker.commerce.productMaterial()],
        thumbnail: faker.image.url(),
        gallery: [faker.image.url(), faker.image.url()],
        seoKeywords: [faker.commerce.productAdjective()],
        dynamicInputs: {},
        details: {},
        slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
    }));
    await productRepo.save(products);

    // Product Variants
    const productVariantRepo = AppDataSource.getMongoRepository(ProductVariant);
    const productVariants = Array.from({ length: 10 }, () => productVariantRepo.create({
        color: faker.color.human(),
        storage: `${faker.number.int({ min: 32, max: 512 })}GB`,
        ram: `${faker.number.int({ min: 2, max: 16 })}GB`,
        sim: faker.helpers.arrayElement(['Single', 'Dual']),
        price: faker.number.int({ min: 100, max: 1000 }),
        inStock: faker.datatype.boolean(),
        sku: faker.string.alphanumeric(8),
        productId: products[faker.number.int({ min: 0, max: products.length - 1 })].id.toString(),
        seoTitle: faker.lorem.words(3),
        seoDescription: faker.lorem.sentence(),
        seoKeywords: [faker.commerce.productAdjective()],
    }));
    await productVariantRepo.save(productVariants);

    // Orders
    const orderRepo = AppDataSource.getMongoRepository(Order);
    const orders = Array.from({ length: 5 }, () => orderRepo.create({
        customer: { name: faker.person.fullName(), phone: faker.phone.number() },
        orderItems: [],
        total: faker.number.int({ min: 100, max: 2000 }),
        status: 'pending',
        paymentStatus: 'pending',
        orderNumber: faker.string.alphanumeric(10),
    }));
    await orderRepo.save(orders);

    // Order Items
    const orderItemRepo = AppDataSource.getMongoRepository(OrderItem);
    const orderItems = Array.from({ length: 10 }, () => orderItemRepo.create({
        productName: faker.commerce.productName(),
        price: faker.number.int({ min: 100, max: 1000 }),
        quantity: faker.number.int({ min: 1, max: 5 }),
        color: faker.color.human(),
        storage: `${faker.number.int({ min: 32, max: 512 })}GB`,
        RAM: `${faker.number.int({ min: 2, max: 16 })}GB`,
        sim: faker.helpers.arrayElement(['Single', 'Dual']),
        display: faker.lorem.word(),
        region: faker.location.country(),
        image: faker.image.url(),
        dynamicInputs: {},
        orderId: orders[faker.number.int({ min: 0, max: orders.length - 1 })].id.toString(),
        productId: products[faker.number.int({ min: 0, max: products.length - 1 })].id.toString(),
    }));
    await orderItemRepo.save(orderItems);

    // Reviews
    const reviewRepo = AppDataSource.getMongoRepository(Review);
    const reviews = Array.from({ length: 10 }, () => reviewRepo.create({
        userId: users[faker.number.int({ min: 0, max: users.length - 1 })].id.toString(),
        productId: products[faker.number.int({ min: 0, max: products.length - 1 })].id.toString(),
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
    }));
    await reviewRepo.save(reviews);

    // Notifications
    const notificationRepo = AppDataSource.getMongoRepository(Notification);
    const notifications = Array.from({ length: 10 }, () => notificationRepo.create({
        userId: users[faker.number.int({ min: 0, max: users.length - 1 })].id.toString(),
        type: faker.helpers.arrayElement(Object.values(NotificationType)),
        title: faker.lorem.words(3),
        message: faker.lorem.sentence(),
        link: faker.internet.url(),
        read: faker.datatype.boolean(),
    }));
    await notificationRepo.save(notifications);

    // FAQs
    const faqRepo = AppDataSource.getMongoRepository(FAQ);
    const faqs = Array.from({ length: 5 }, () => faqRepo.create({
        question: faker.lorem.sentence(),
        answer: faker.lorem.paragraph(),
        productId: products[faker.number.int({ min: 0, max: products.length - 1 })].id.toString(),
    }));
    await faqRepo.save(faqs);

    // Giveaway Entries
    const giveawayEntryRepo = AppDataSource.getMongoRepository(GiveawayEntry);
    const giveawayEntries = Array.from({ length: 5 }, () => giveawayEntryRepo.create({
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        facebook: faker.internet.username(),
    }));
    await giveawayEntryRepo.save(giveawayEntries);

    // Loyalty Points
    const loyaltyRepo = AppDataSource.getMongoRepository(LoyaltyPoints);
    const loyaltyPoints = users.map((user) => loyaltyRepo.create({
        userId: user.id.toString(),
        points: faker.number.int({ min: 0, max: 1000 }),
        level: faker.helpers.arrayElement(['Bronze', 'Silver', 'Gold', 'Platinum']),
    }));
    await loyaltyRepo.save(loyaltyPoints);

    // Policy Pages
    const policyRepo = AppDataSource.getMongoRepository(PolicyPage);
    const policies = Array.from({ length: 3 }, () => policyRepo.create({
        slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
        title: faker.lorem.words(3),
        contentBn: faker.lorem.paragraph(),
        contentEn: faker.lorem.paragraph(),
    }));
    await policyRepo.save(policies);

    // Warranty Records
    const warrantyRepo = AppDataSource.getMongoRepository(WarrantyRecord);
    const warrantyRecords = Array.from({ length: 5 }, () => warrantyRepo.create({
        productId: products[faker.number.int({ min: 0, max: products.length - 1 })].id.toString(),
        imei: faker.string.numeric(15),
        serial: faker.string.alphanumeric(10),
        phone: faker.phone.number(),
        purchaseDate: faker.date.past(),
        expiryDate: faker.date.future(),
        status: faker.helpers.arrayElement(['active', 'expired', 'pending']),
        activatedBy: users[faker.number.int({ min: 0, max: users.length - 1 })].id.toString(),
        orderId: orders[faker.number.int({ min: 0, max: orders.length - 1 })].id.toString(),
    }));
    await warrantyRepo.save(warrantyRecords);

    // Home Categories
    const homeCategoryRepo = AppDataSource.getMongoRepository(HomeCategory);
    const homeCategories = Array.from({ length: 3 }, () => homeCategoryRepo.create({
        name: faker.commerce.department(),
        priority: faker.number.int({ min: 1, max: 10 }),
        categoryIds: [categories[faker.number.int({ min: 0, max: categories.length - 1 })].id.toString()],
        productIds: [products[faker.number.int({ min: 0, max: products.length - 1 })].id.toString()],
    }));
    await homeCategoryRepo.save(homeCategories);

    // Hero Banners
    const heroBannerRepo = AppDataSource.getMongoRepository(HeroBanner);
    const heroBanners = Array.from({ length: 3 }, () => heroBannerRepo.create({
        img: faker.image.url(),
    }));
    await heroBannerRepo.save(heroBanners);

    console.log('All mock data seeded!');
    await AppDataSource.destroy();
}

seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
