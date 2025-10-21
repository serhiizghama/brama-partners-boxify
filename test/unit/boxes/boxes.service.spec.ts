import { Test, TestingModule } from '@nestjs/testing';
import { BoxesService } from '../../../src/modules/boxes/boxes.service';
import { BoxRepository } from '../../../src/modules/boxes/infrastructure/box.repository';
import { ListBoxesQuery } from '../../../src/modules/boxes/dto/list-boxes.query';
import { BoxEntity } from '../../../src/domain/boxes/entities/box.entity';
import { BoxStatus } from '../../../src/domain/boxes/enums/box-status.enum';
import { ProductRepository } from '../../../src/modules/products/infrastructure/product.repository';
import { ProductEntity } from '../../../src/domain/products/entities/product.entity';
import { DataSource, EntityManager } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BusinessRuleViolationException, InvalidStatusTransitionException } from '../../../src/common/exceptions';
import { TransactionRepository } from '../../../src/modules/boxes/infrastructure/transaction.repository';

jest.mock('../../../src/modules/boxes/infrastructure/transaction.repository');

describe('BoxesService', () => {
  let service: BoxesService;
  let boxRepository: jest.Mocked<BoxRepository>;
  let transactionRepository: jest.Mocked<TransactionRepository>;

  const mockBoxRepository = {
    findAndCount: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    create: jest.fn().mockImplementation((dto) => ({ id: 'new-box-id', ...dto, created_at: new Date(), updated_at: new Date() })),
    save: jest.fn().mockImplementation((entity) => entity),
    findOne: jest.fn(),
  };

  const mockProductRepository = {
    findById: jest.fn(),
    update: jest.fn(),
    save: jest.fn().mockImplementation((entity) => entity),
    findOne: jest.fn(),
  };

  // Define transactionRepository as a mock object directly
  const mockTransactionRepositoryInstance = {
    createBox: jest.fn(),
    findBoxById: jest.fn(),
    findProductById: jest.fn(),
    updateProductBoxId: jest.fn(),
  };

  // Mock the TransactionRepository class to return our pre-defined mock instance
  (TransactionRepository as jest.Mock).mockImplementation(() => mockTransactionRepositoryInstance);

  const mockDataSource = {
    transaction: jest.fn().mockImplementation(async (callback: (manager: EntityManager) => Promise<any>) => {
      const manager = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === BoxEntity) {
            return mockBoxRepository;
          }
          if (entity === ProductEntity) {
            return mockProductRepository;
          }
          return {};
        }),
      } as unknown as EntityManager;
      return await callback(manager);
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoxesService,
        {
          provide: BoxRepository,
          useValue: mockBoxRepository,
        },
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<BoxesService>(BoxesService);
    boxRepository = module.get<BoxRepository>(BoxRepository) as jest.Mocked<BoxRepository>;
    transactionRepository = mockTransactionRepositoryInstance as unknown as jest.Mocked<TransactionRepository>;

    // Clear mocks for transactionRepository methods before each test
    transactionRepository.createBox.mockClear();
    transactionRepository.findBoxById.mockClear();
    transactionRepository.findProductById.mockClear();
    transactionRepository.updateProductBoxId.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new box without products', async () => {
      const createDto = { label: 'NEW-BOX' };
      const mockBox: BoxEntity = { id: 'box-new', label: 'NEW-BOX', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };

      transactionRepository.createBox.mockResolvedValue(mockBox);

      const result = await service.create(createDto);

      expect(transactionRepository.createBox).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockBox);
    });

    it('should create a new box with products', async () => {
      const createDto = { label: 'NEW-BOX-WITH-PRODUCTS', productIds: ['prod-1', 'prod-2'] };
      const mockBox: BoxEntity = { id: 'box-new', label: 'NEW-BOX-WITH-PRODUCTS', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };
      const mockProduct1 = { id: 'prod-1', box_id: null };
      const mockProduct2 = { id: 'prod-2', box_id: null };

      transactionRepository.createBox.mockResolvedValue(mockBox);
      transactionRepository.findProductById.mockResolvedValueOnce(mockProduct1).mockResolvedValueOnce(mockProduct2);
      transactionRepository.updateProductBoxId.mockResolvedValue(undefined);

      const result = await service.create(createDto);

      expect(transactionRepository.createBox).toHaveBeenCalledWith(createDto);
      expect(transactionRepository.findProductById).toHaveBeenCalledWith('prod-1');
      expect(transactionRepository.findProductById).toHaveBeenCalledWith('prod-2');
      expect(transactionRepository.updateProductBoxId).toHaveBeenCalledWith('prod-1', mockBox.id);
      expect(transactionRepository.updateProductBoxId).toHaveBeenCalledWith('prod-2', mockBox.id);
      expect(result).toEqual(mockBox);
    });

    it('should throw NotFoundException if a product is not found during creation', async () => {
      const createDto = { label: 'BOX-INVALID-PRODUCT', productIds: ['prod-invalid'] };
      const mockBox: BoxEntity = { id: 'box-new', label: 'BOX-INVALID-PRODUCT', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };

      transactionRepository.createBox.mockResolvedValue(mockBox);
      transactionRepository.findProductById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto)).rejects.toThrow('Product with id prod-invalid not found');
    });

    it('should throw BusinessRuleViolationException if a product is already in another box during creation', async () => {
      const createDto = { label: 'BOX-PRODUCT-IN-USE', productIds: ['prod-in-use'] };
      const mockBox: BoxEntity = { id: 'box-new', label: 'BOX-PRODUCT-IN-USE', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };
      const mockProductInUse = { id: 'prod-in-use', box_id: 'another-box' };

      transactionRepository.createBox.mockResolvedValue(mockBox);
      transactionRepository.findProductById.mockResolvedValue(mockProductInUse);

      await expect(service.create(createDto)).rejects.toThrow(BusinessRuleViolationException);
      await expect(service.create(createDto)).rejects.toThrow('Product with id prod-in-use is already in another box.');
    });
  });

  describe('remove', () => {
    it('should remove a box in CREATED status', async () => {
      const boxId = 'box-1';
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };

      boxRepository.findById.mockResolvedValue(mockBox);
      boxRepository.remove.mockResolvedValue(true);

      await service.remove(boxId);

      expect(boxRepository.findById).toHaveBeenCalledWith(boxId);
      expect(boxRepository.remove).toHaveBeenCalledWith(boxId);
    });

    it('should throw NotFoundException if box not found for removal', async () => {
      const boxId = 'non-existent-box';

      boxRepository.findById.mockResolvedValue(null);

      await expect(service.remove(boxId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(boxId)).rejects.toThrow('Box not found');
      expect(boxRepository.findById).toHaveBeenCalledWith(boxId);
      expect(boxRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw BusinessRuleViolationException if box status is not CREATED for removal', async () => {
      const boxId = 'box-1';
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.SEALED, products: [], created_at: new Date(), updated_at: new Date() };

      boxRepository.findById.mockResolvedValue(mockBox);

      await expect(service.remove(boxId)).rejects.toThrow(BusinessRuleViolationException);
      await expect(service.remove(boxId)).rejects.toThrow('Cannot delete box with status SEALED. Only boxes with status CREATED can be deleted.');
      expect(boxRepository.findById).toHaveBeenCalledWith(boxId);
      expect(boxRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('removeProducts', () => {
    it('should remove products from a box in CREATED status', async () => {
      const boxId = 'box-1';
      const removeProductsDto = { productIds: ['prod-1'] };
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.CREATED, products: [{ id: 'prod-1', box_id: boxId } as any], created_at: new Date(), updated_at: new Date() };
      const mockProduct1 = { id: 'prod-1', box_id: boxId };
      const updatedBoxWithoutProducts: BoxEntity = { ...mockBox, products: [] };

      transactionRepository.findBoxById
        .mockResolvedValueOnce(mockBox) // First call - check if box exists
        .mockResolvedValueOnce(updatedBoxWithoutProducts); // Second call - get updated box
      transactionRepository.findProductById.mockResolvedValue(mockProduct1);
      transactionRepository.updateProductBoxId.mockResolvedValue(undefined);

      const result = await service.removeProducts(boxId, removeProductsDto);

      expect(transactionRepository.findBoxById).toHaveBeenCalledWith(boxId);
      expect(transactionRepository.findProductById).toHaveBeenCalledWith('prod-1');
      expect(transactionRepository.updateProductBoxId).toHaveBeenCalledWith('prod-1', null);
      expect(result).toEqual(updatedBoxWithoutProducts);
    });

    it('should throw NotFoundException if box not found when removing products', async () => {
      const boxId = 'non-existent-box';
      const removeProductsDto = { productIds: ['prod-1'] };

      transactionRepository.findBoxById.mockResolvedValue(null);

      await expect(service.removeProducts(boxId, removeProductsDto)).rejects.toThrow(NotFoundException);
      await expect(service.removeProducts(boxId, removeProductsDto)).rejects.toThrow('Box with id non-existent-box not found');
    });

    it('should throw BusinessRuleViolationException if box status is not CREATED when removing products', async () => {
      const boxId = 'box-1';
      const removeProductsDto = { productIds: ['prod-1'] };
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.SEALED, products: [], created_at: new Date(), updated_at: new Date() };

      transactionRepository.findBoxById.mockResolvedValue(mockBox);

      await expect(service.removeProducts(boxId, removeProductsDto)).rejects.toThrow(BusinessRuleViolationException);
      await expect(service.removeProducts(boxId, removeProductsDto)).rejects.toThrow('Cannot remove products from a box with status SEALED. Only boxes with status CREATED can be modified.');
    });

    it('should throw NotFoundException if a product is not found when removing products', async () => {
      const boxId = 'box-1';
      const removeProductsDto = { productIds: ['prod-invalid'] };
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };

      transactionRepository.findBoxById.mockResolvedValue(mockBox);
      transactionRepository.findProductById.mockResolvedValue(null);

      await expect(service.removeProducts(boxId, removeProductsDto)).rejects.toThrow(NotFoundException);
      await expect(service.removeProducts(boxId, removeProductsDto)).rejects.toThrow('Product with id prod-invalid not found');
    });

    it('should throw BusinessRuleViolationException if a product is not in the specified box when removing products', async () => {
      const boxId = 'box-1';
      const removeProductsDto = { productIds: ['prod-not-in-this-box'] };
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };
      const mockProductNotInThisBox = { id: 'prod-not-in-this-box', box_id: 'another-box' };

      transactionRepository.findBoxById.mockResolvedValue(mockBox);
      transactionRepository.findProductById.mockResolvedValue(mockProductNotInThisBox);

      await expect(service.removeProducts(boxId, removeProductsDto)).rejects.toThrow(BusinessRuleViolationException);
      await expect(service.removeProducts(boxId, removeProductsDto)).rejects.toThrow('Product with id prod-not-in-this-box is not in this box.');
    });
  });

  describe('addProducts', () => {
    it('should add products to a box in CREATED status', async () => {
      const boxId = 'box-1';
      const addProductsDto = { productIds: ['prod-1', 'prod-2'] };
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };
      const mockProduct1 = { id: 'prod-1', box_id: null };
      const mockProduct2 = { id: 'prod-2', box_id: null };
      const updatedBoxWithProducts: BoxEntity = { ...mockBox, products: [{ id: 'prod-1' } as any, { id: 'prod-2' } as any] };

      transactionRepository.findBoxById
        .mockResolvedValueOnce(mockBox) // First call - check if box exists
        .mockResolvedValueOnce(updatedBoxWithProducts); // Second call - get updated box
      transactionRepository.findProductById.mockResolvedValueOnce(mockProduct1).mockResolvedValueOnce(mockProduct2);
      transactionRepository.updateProductBoxId.mockResolvedValue(undefined);

      const result = await service.addProducts(boxId, addProductsDto);

      expect(transactionRepository.findBoxById).toHaveBeenCalledWith(boxId);
      expect(transactionRepository.findProductById).toHaveBeenCalledWith('prod-1');
      expect(transactionRepository.findProductById).toHaveBeenCalledWith('prod-2');
      expect(transactionRepository.updateProductBoxId).toHaveBeenCalledWith('prod-1', boxId);
      expect(transactionRepository.updateProductBoxId).toHaveBeenCalledWith('prod-2', boxId);
      expect(result).toEqual(updatedBoxWithProducts);
    });

    it('should throw NotFoundException if box not found when adding products', async () => {
      const boxId = 'non-existent-box';
      const addProductsDto = { productIds: ['prod-1'] };

      transactionRepository.findBoxById.mockResolvedValue(null);

      await expect(service.addProducts(boxId, addProductsDto)).rejects.toThrow(NotFoundException);
      await expect(service.addProducts(boxId, addProductsDto)).rejects.toThrow('Box with id non-existent-box not found');
    });

    it('should throw BusinessRuleViolationException if box status is not CREATED when adding products', async () => {
      const boxId = 'box-1';
      const addProductsDto = { productIds: ['prod-1'] };
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.SEALED, products: [], created_at: new Date(), updated_at: new Date() };

      transactionRepository.findBoxById.mockResolvedValue(mockBox);

      await expect(service.addProducts(boxId, addProductsDto)).rejects.toThrow(BusinessRuleViolationException);
      await expect(service.addProducts(boxId, addProductsDto)).rejects.toThrow('Cannot add products to a box with status SEALED. Only boxes with status CREATED can be modified.');
    });

    it('should throw NotFoundException if a product is not found when adding products', async () => {
      const boxId = 'box-1';
      const addProductsDto = { productIds: ['prod-invalid'] };
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };

      transactionRepository.findBoxById.mockResolvedValue(mockBox);
      transactionRepository.findProductById.mockResolvedValue(null);

      await expect(service.addProducts(boxId, addProductsDto)).rejects.toThrow(NotFoundException);
      await expect(service.addProducts(boxId, addProductsDto)).rejects.toThrow('Product with id prod-invalid not found');
    });

    it('should throw BusinessRuleViolationException if a product is already in another box when adding products', async () => {
      const boxId = 'box-1';
      const addProductsDto = { productIds: ['prod-in-use'] };
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };
      const mockProductInUse = { id: 'prod-in-use', box_id: 'another-box' };

      transactionRepository.findBoxById.mockResolvedValue(mockBox);
      transactionRepository.findProductById.mockResolvedValue(mockProductInUse);

      await expect(service.addProducts(boxId, addProductsDto)).rejects.toThrow(BusinessRuleViolationException);
      await expect(service.addProducts(boxId, addProductsDto)).rejects.toThrow('Product with id prod-in-use is already in another box.');
    });
  });

  describe('update', () => {
    it('should update a box label', async () => {
      const boxId = 'box-1';
      const updateDto = { label: 'UPDATED-BOX' };
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };
      const mockUpdatedBox: BoxEntity = { ...mockBox, label: 'UPDATED-BOX' };

      mockBoxRepository.findById.mockResolvedValue(mockBox);
      mockBoxRepository.update.mockResolvedValue(mockUpdatedBox);

      const result = await service.update(boxId, updateDto);

      expect(mockBoxRepository.findById).toHaveBeenCalledWith(boxId);
      expect(mockBoxRepository.update).toHaveBeenCalledWith(boxId, updateDto);
      expect(result).toEqual(mockUpdatedBox);
    });

    it('should update a box status with a valid transition', async () => {
      const boxId = 'box-1';
      const updateDto = { status: BoxStatus.SEALED };
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };
      const mockUpdatedBox: BoxEntity = { ...mockBox, status: BoxStatus.SEALED };

      mockBoxRepository.findById.mockResolvedValue(mockBox);
      mockBoxRepository.update.mockResolvedValue(mockUpdatedBox);

      const result = await service.update(boxId, updateDto);

      expect(mockBoxRepository.findById).toHaveBeenCalledWith(boxId);
      expect(mockBoxRepository.update).toHaveBeenCalledWith(boxId, updateDto);
      expect(result).toEqual(mockUpdatedBox);
    });

    it('should throw InvalidStatusTransitionException for an invalid status transition', async () => {
      const boxId = 'box-1';
      const updateDto = { status: BoxStatus.SHIPPED }; // Invalid from CREATED
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };

      mockBoxRepository.findById.mockResolvedValue(mockBox);

      await expect(service.update(boxId, updateDto)).rejects.toThrow(InvalidStatusTransitionException);
      await expect(service.update(boxId, updateDto)).rejects.toThrow('Invalid status transition from CREATED to SHIPPED.');
      expect(mockBoxRepository.findById).toHaveBeenCalledWith(boxId);
      expect(mockBoxRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if box not found for update', async () => {
      const boxId = 'non-existent-box';
      const updateDto = { label: 'UPDATED-BOX' };

      mockBoxRepository.findById.mockResolvedValue(null);

      await expect(service.update(boxId, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(boxId, updateDto)).rejects.toThrow('Box not found');
      expect(mockBoxRepository.findById).toHaveBeenCalledWith(boxId);
      expect(mockBoxRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return a box by id', async () => {
      const boxId = 'box-1';
      const mockBox: BoxEntity = { id: boxId, label: 'BOX-001', status: BoxStatus.CREATED, products: [], created_at: new Date(), updated_at: new Date() };
      mockBoxRepository.findById.mockResolvedValue(mockBox);

      const result = await service.getById(boxId);

      expect(mockBoxRepository.findById).toHaveBeenCalledWith(boxId);
      expect(result).toEqual(mockBox);
    });

    it('should throw NotFoundException if box not found', async () => {
      const boxId = 'non-existent-box';
      mockBoxRepository.findById.mockResolvedValue(null);

      await expect(service.getById(boxId)).rejects.toThrow(NotFoundException);
      await expect(service.getById(boxId)).rejects.toThrow('Box not found');
      expect(mockBoxRepository.findById).toHaveBeenCalledWith(boxId);
    });
  });

  describe('list', () => {
    it('should return paginated boxes with default parameters', async () => {
      // Arrange
      const query: ListBoxesQuery = {
        limit: 20,
        offset: 0,
        sort_by: 'created_at',
        direction: 'desc',
      };

      const mockBoxes: BoxEntity[] = [
        {
          id: 'box-1',
          label: 'BOX-001',
          status: BoxStatus.CREATED,
          products: [],
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        {
          id: 'box-2',
          label: 'BOX-002',
          status: BoxStatus.SEALED,
          products: [],
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
        },
      ];

      boxRepository.findAndCount.mockResolvedValue([mockBoxes, 2]);

      // Act
      const result = await service.list(query);

      // Assert
      expect(boxRepository.findAndCount).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: mockBoxes,
        pagination: {
          limit: 20,
          offset: 0,
          total: 2,
        },
      });
    });
  });
});
