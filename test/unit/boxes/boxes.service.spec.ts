import { Test, TestingModule } from '@nestjs/testing';
import { BoxesService } from '../../../src/modules/boxes/boxes.service';
import { BoxRepository } from '../../../src/modules/boxes/infrastructure/box.repository';
import { ListBoxesQuery } from '../../../src/modules/boxes/dto/list-boxes.query';
import { BoxEntity } from '../../../src/domain/boxes/entities/box.entity';
import { BoxStatus } from '../../../src/domain/boxes/enums/box-status.enum';
import { ProductRepository } from '../../../src/modules/products/infrastructure/product.repository';
import { DataSource, EntityManager } from 'typeorm';

describe('BoxesService', () => {
  let service: BoxesService;
  let boxRepository: jest.Mocked<BoxRepository>;

  const mockBoxRepository = {
    findAndCount: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
  };

  const mockProductRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation(async (callback) => {
      const manager: Partial<EntityManager> = {
        withRepository: jest.fn().mockImplementation((repo) => {
          if (repo === mockBoxRepository) {
            return mockBoxRepository;
          }
          if (repo === mockProductRepository) {
            return mockProductRepository;
          }
          return repo;
        }),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return await callback(manager as EntityManager);
    }),
  };

  beforeEach(async () => {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
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
