export type Book = {
  id?: string;

  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publishDate: string;
  category: string;

  imageUrl: string;
  imagePublicId: string;

  stock: number;

  createdAt?: any;
  updatedAt?: any;

  salesName?: string;
};