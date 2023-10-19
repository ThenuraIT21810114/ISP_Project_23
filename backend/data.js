import bcrypt from 'bcryptjs';
const data = {
  users: [
    {
      name: 'Thenura',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: true,
      isSupplier: false,
    },
    {
      name: 'John',
      email: 'user@example.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: false,
      isSupplier: false,
    },
  ],
  products: [
    {
      //_id: '1',
      name: 'Wrapround Linen Dress',
      slug: 'Wrapround-Linen-Dress',
      category: 'Dress',
      Image: '/images/p1.jpg',
      price: 3500,
      countInStock: 0,
      Material: 'Linen',
      rating: 4.5,
      numReviews: 25,
      description: 'Good quality Linen Wrapround Dress',
    },
    {
      //_id: '2',
      name: 'Sleevless Shift Dress',
      slug: 'Sleevless-Shift-Dress',
      category: 'Dress',
      Image: '/images/p2.jpg',
      price: 2500,
      countInStock: 20,
      Material: 'Linen',
      rating: 2.5,
      numReviews: 10,
      description: 'Good quality Linen Sleevless Shift Dress',
    },
    {
      //_id: '3',
      name: 'BackButton Sleevless Top',
      slug: 'Back-Button-Sleevless-Top',
      category: 'Tops',
      Image: '/images/p3.jpg',
      price: 1700,
      countInStock: 20,
      Material: 'Linen',
      rating: 4.5,
      numReviews: 20,
      description: 'Good quality Linen Back Button Sleevless Top',
    },
    {
      //_id: '4',
      name: 'Sleeveless FrontButton Dress',
      slug: 'Sleeveless-Front-Button-Dress',
      category: 'Dress',
      Image: '/images/p4.jpg',
      price: 3500,
      countInStock: 20,
      Material: 'Linen',
      rating: 4.5,
      numReviews: 25,
      description: 'Good quality Linen Sleeveless Front Button Dress',
    },
    {
      //_id: '5',
      name: 'Red Color Bottom Top',
      slug: 'Red-Color-Bottom-Top',
      category: 'Tops',
      Image: '/images/p5.jpg',
      price: 2800,
      countInStock: 20,
      Material: 'Linen',
      rating: 4.5,
      numReviews: 30,
      description: 'Good quality Linen Sleeveless Bottom Top',
    },
    {
      //_id: '6',
      name: 'Yellow Color Top',
      slug: 'Yellow-Color-Top',
      category: 'Tops',
      Image: '/images/p6.jpg',
      price: 4500,
      countInStock: 20,
      Material: 'Linen',
      rating: 4.5,
      numReviews: 25,
      description: 'Good quality Tops',
    },
    {
      //_id: '7',
      name: 'Red Short Skirt',
      slug: 'Red-Short-Skirt',
      category: 'Skirts',
      Image: '/images/p7.jpg',
      price: 2500,
      countInStock: 20,
      Material: 'Linen',
      rating: 4.5,
      numReviews: 25,
      description: 'Good quality Linen Skirts',
    },
    {
      //_id: '8',
      name: 'Sleevless Black Top',
      slug: 'Sleevless-Black-Top',
      category: 'Top',
      Image: '/images/p8.jpg',
      price: 4500,
      countInStock: 20,
      Material: 'Linen',
      rating: 3.5,
      numReviews: 35,
      description: 'Good quality Linen Top',
    },
  ],
};

export default data;
