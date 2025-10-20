import { Test, TestingModule } from '@nestjs/testing';
import { BoxesService } from '../../../src/modules/boxes/boxes.service';
import { BoxRepository } from '../../../src/modules/boxes/infrastructure/box.repository';
import { ListBoxesQuery } from '../../../src/modules/boxes/dto/list-boxes.query';
import { BoxEntity } from '../../../src/domain/boxes/entities/box.entity';
import { BoxStatus } from '../../../src/domain/boxes/enums/box-status.enum';

describe('BoxesService', () => {
  let service: BoxesService;
  let boxRepository: jest.Mocked<BoxRepository>;

  const mockBoxRepository = {
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoxesService,
        {
          provide: BoxRepository,
          useValue: mockBoxRepository,
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

    it('should return paginated boxes with search filter', async () => {
      // Arrange
      const query: ListBoxesQuery = {
        limit: 10,
        offset: 0,
        search: 'BOX-001',
        sort_by: 'label',
        direction: 'asc',
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
      ];

      boxRepository.findAndCount.mockResolvedValue([mockBoxes, 1]);

      // Act
      const result = await service.list(query);

      // Assert
      expect(boxRepository.findAndCount).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: mockBoxes,
        pagination: {
          limit: 10,
          offset: 0,
          total: 1,
        },
      });
    });

    it('should return paginated boxes with status filter', async () => {
      // Arrange
      const query: ListBoxesQuery = {
        limit: 5,
        offset: 10,
        status: BoxStatus.SEALED,
        sort_by: 'status',
        direction: 'desc',
      };

      const mockBoxes: BoxEntity[] = [
        {
          id: 'box-2',
          label: 'BOX-002',
          status: BoxStatus.SEALED,
          products: [],
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
        },
      ];

      boxRepository.findAndCount.mockResolvedValue([mockBoxes, 1]);

      // Act
      const result = await service.list(query);

      // Assert
      expect(boxRepository.findAndCount).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: mockBoxes,
        pagination: {
          limit: 5,
          offset: 10,
          total: 1,
        },
      });
    });

    it('should return empty result when no boxes found', async () => {
      // Arrange
      const query: ListBoxesQuery = {
        limit: 20,
        offset: 0,
        sort_by: 'created_at',
        direction: 'desc',
      };

      boxRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      const result = await service.list(query);

      // Assert
      expect(boxRepository.findAndCount).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: [],
        pagination: {
          limit: 20,
          offset: 0,
          total: 0,
        },
      });
    });

    it('should handle repository errors', async () => {
      // Arrange
      const query: ListBoxesQuery = {
        limit: 20,
        offset: 0,
        sort_by: 'created_at',
        direction: 'desc',
      };

      const error = new Error('Database connection failed');
      boxRepository.findAndCount.mockRejectedValue(error);

      // Act & Assert
      await expect(service.list(query)).rejects.toThrow('Database connection failed');
      expect(boxRepository.findAndCount).toHaveBeenCalledWith(query);
    });
  });
});
