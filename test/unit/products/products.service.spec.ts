import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from '../../../src/modules/products/products.service';
import { ProductRepository } from '../../../src/modules/products/infrastructure/product.repository';
import { CreateProductDto } from '../../../src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from '../../../src/modules/products/dto/update-product.dto';
import { ListProductsQuery } from '../../../src/modules/products/dto/list-products.query';
import { ProductEntity } from '../../../src/domain/products/entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: jest.Mocked<ProductRepository>;

  const mockProductRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<ProductRepository>(ProductRepository) as jest.Mocked<ProductRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      // Arrange
      const createDto: CreateProductDto = {
        name: 'Test Product',
        barcode: '12345678',
      };

      const mockProduct: ProductEntity = {
        id: 'product-1',
        name: 'Test Product',
        barcode: '12345678',
        box_id: null,
        box: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      productRepository.create.mockResolvedValue(mockProduct);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(productRepository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProduct);
    });

    it('should handle repository errors during creation', async () => {
      // Arrange
      const createDto: CreateProductDto = {
        name: 'Test Product',
        barcode: '12345678',
      };

      const error = new Error('Database constraint violation');
      productRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow('Database constraint violation');
      expect(productRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('list', () => {
    it('should return paginated products', async () => {
      // Arrange
      const query: ListProductsQuery = {
        limit: 20,
        offset: 0,
        sort_by: 'created_at',
        direction: 'desc',
      };

      const mockProducts: ProductEntity[] = [
        {
          id: 'product-1',
          name: 'Product 1',
          barcode: '12345678',
          box_id: null,
          box: null,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        {
          id: 'product-2',
          name: 'Product 2',
          barcode: '87654321',
          box_id: null,
          box: null,
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
        },
      ];

      productRepository.findAndCount.mockResolvedValue([mockProducts, 2]);

      // Act
      const result = await service.list(query);

      // Assert
      expect(productRepository.findAndCount).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: mockProducts,
        pagination: {
          limit: 20,
          offset: 0,
          total: 2,
        },
      });
    });

    it('should return empty result when no products found', async () => {
      // Arrange
      const query: ListProductsQuery = {
        limit: 20,
        offset: 0,
        sort_by: 'created_at',
        direction: 'desc',
      };

      productRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      const result = await service.list(query);

      // Assert
      expect(productRepository.findAndCount).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: [],
        pagination: {
          limit: 20,
          offset: 0,
          total: 0,
        },
      });
    });
  });

  describe('getById', () => {
    it('should return product by id', async () => {
      // Arrange
      const productId = 'product-1';
      const mockProduct: ProductEntity = {
        id: 'product-1',
        name: 'Test Product',
        barcode: '12345678',
        box_id: null,
        box: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      productRepository.findById.mockResolvedValue(mockProduct);

      // Act
      const result = await service.getById(productId);

      // Assert
      expect(productRepository.findById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      const productId = 'non-existent-product';
      productRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getById(productId)).rejects.toThrow(NotFoundException);
      await expect(service.getById(productId)).rejects.toThrow('Product not found');
      expect(productRepository.findById).toHaveBeenCalledWith(productId);
    });
  });

  describe('update', () => {
    it('should update existing product', async () => {
      // Arrange
      const productId = 'product-1';
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      const mockUpdatedProduct: ProductEntity = {
        id: 'product-1',
        name: 'Updated Product',
        barcode: '12345678',
        box_id: null,
        box: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      productRepository.update.mockResolvedValue(mockUpdatedProduct);

      // Act
      const result = await service.update(productId, updateDto);

      // Assert
      expect(productRepository.update).toHaveBeenCalledWith(productId, updateDto);
      expect(result).toEqual(mockUpdatedProduct);
    });

    it('should throw NotFoundException when product not found for update', async () => {
      // Arrange
      const productId = 'non-existent-product';
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      productRepository.update.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(productId, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(productId, updateDto)).rejects.toThrow('Product not found');
      expect(productRepository.update).toHaveBeenCalledWith(productId, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove existing product', async () => {
      // Arrange
      const productId = 'product-1';
      productRepository.remove.mockResolvedValue(true);

      // Act
      await service.remove(productId);

      // Assert
      expect(productRepository.remove).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException when product not found for removal', async () => {
      // Arrange
      const productId = 'non-existent-product';
      productRepository.remove.mockResolvedValue(false);

      // Act & Assert
      await expect(service.remove(productId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(productId)).rejects.toThrow('Product not found');
      expect(productRepository.remove).toHaveBeenCalledWith(productId);
    });

    it('should handle repository errors during removal', async () => {
      // Arrange
      const productId = 'product-1';
      const error = new Error('Database constraint violation');
      productRepository.remove.mockRejectedValue(error);

      // Act & Assert
      await expect(service.remove(productId)).rejects.toThrow('Database constraint violation');
      expect(productRepository.remove).toHaveBeenCalledWith(productId);
    });
  });
});
