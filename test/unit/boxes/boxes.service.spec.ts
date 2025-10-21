import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BoxesService } from '../../../src/modules/boxes/boxes.service';
import { BoxRepository } from '../../../src/modules/boxes/infrastructure/box.repository';
import { ListBoxesQuery } from '../../../src/modules/boxes/dto/list-boxes.query';
import { UpdateBoxDto } from '../../../src/modules/boxes/dto/update-box.dto';
import { BoxEntity } from '../../../src/domain/boxes/entities/box.entity';
import { BoxStatus } from '../../../src/domain/boxes/enums/box-status.enum';
import { BusinessRuleViolationException, InvalidStatusTransitionException } from '../../../src/common/exceptions';

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

      const result = await service.list(query);

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
      const query: ListBoxesQuery = {
        limit: 20,
        offset: 0,
        sort_by: 'created_at',
        direction: 'desc',
      };

      boxRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.list(query);

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
      const query: ListBoxesQuery = {
        limit: 20,
        offset: 0,
        sort_by: 'created_at',
        direction: 'desc',
      };

      const error = new Error('Database connection failed');
      boxRepository.findAndCount.mockRejectedValue(error);

      await expect(service.list(query)).rejects.toThrow('Database connection failed');
      expect(boxRepository.findAndCount).toHaveBeenCalledWith(query);
    });
  });

  describe('getById', () => {
    it('should return a box by id', async () => {
      const boxId = 'box-1';
      const mockBox: BoxEntity = {
        id: boxId,
        label: 'BOX-001',
        status: BoxStatus.CREATED,
        products: [],
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      boxRepository.findById.mockResolvedValue(mockBox);

      // Act
      const result = await service.getById(boxId);

      // Assert
      expect(boxRepository.findById).toHaveBeenCalledWith(boxId);
      expect(result).toEqual(mockBox);
    });

    it('should throw NotFoundException when box not found', async () => {
      const boxId = 'non-existent-box';
      boxRepository.findById.mockResolvedValue(null);

      await expect(service.getById(boxId)).rejects.toThrow(NotFoundException);
      expect(boxRepository.findById).toHaveBeenCalledWith(boxId);
    });
  });

  describe('update', () => {
    it('should update a box successfully', async () => {
      const boxId = 'box-1';
      const updateDto: UpdateBoxDto = { label: 'BOX-002' };
      const existingBox: BoxEntity = {
        id: boxId,
        label: 'BOX-001',
        status: BoxStatus.CREATED,
        products: [],
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };
      const updatedBox: BoxEntity = {
        ...existingBox,
        label: 'BOX-002',
      };

      boxRepository.findById.mockResolvedValue(existingBox);
      boxRepository.update.mockResolvedValue(updatedBox);

      const result = await service.update(boxId, updateDto);

      expect(boxRepository.findById).toHaveBeenCalledWith(boxId);
      expect(boxRepository.update).toHaveBeenCalledWith(boxId, updateDto);
      expect(result).toEqual(updatedBox);
    });

    it('should throw NotFoundException when box not found', async () => {
      const boxId = 'non-existent-box';
      const updateDto: UpdateBoxDto = { label: 'BOX-002' };
      boxRepository.findById.mockResolvedValue(null);

      await expect(service.update(boxId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should allow valid status transition CREATED -> SEALED', async () => {
      const boxId = 'box-1';
      const updateDto: UpdateBoxDto = { status: BoxStatus.SEALED };
      const existingBox: BoxEntity = {
        id: boxId,
        label: 'BOX-001',
        status: BoxStatus.CREATED,
        products: [],
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };
      const updatedBox: BoxEntity = {
        ...existingBox,
        status: BoxStatus.SEALED,
      };

      boxRepository.findById.mockResolvedValue(existingBox);
      boxRepository.update.mockResolvedValue(updatedBox);

      const result = await service.update(boxId, updateDto);

      expect(result).toEqual(updatedBox);
    });

    it('should allow valid status transition SEALED -> SHIPPED', async () => {
      const boxId = 'box-1';
      const updateDto: UpdateBoxDto = { status: BoxStatus.SHIPPED };
      const existingBox: BoxEntity = {
        id: boxId,
        label: 'BOX-001',
        status: BoxStatus.SEALED,
        products: [],
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };
      const updatedBox: BoxEntity = {
        ...existingBox,
        status: BoxStatus.SHIPPED,
      };

      boxRepository.findById.mockResolvedValue(existingBox);
      boxRepository.update.mockResolvedValue(updatedBox);

      const result = await service.update(boxId, updateDto);

      expect(result).toEqual(updatedBox);
    });

    it('should throw InvalidStatusTransitionException for invalid transition CREATED -> SHIPPED', async () => {
      const boxId = 'box-1';
      const updateDto: UpdateBoxDto = { status: BoxStatus.SHIPPED };
      const existingBox: BoxEntity = {
        id: boxId,
        label: 'BOX-001',
        status: BoxStatus.CREATED,
        products: [],
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      boxRepository.findById.mockResolvedValue(existingBox);

      await expect(service.update(boxId, updateDto)).rejects.toThrow(InvalidStatusTransitionException);
    });

    it('should throw InvalidStatusTransitionException for invalid transition SHIPPED -> CREATED', async () => {
      const boxId = 'box-1';
      const updateDto: UpdateBoxDto = { status: BoxStatus.CREATED };
      const existingBox: BoxEntity = {
        id: boxId,
        label: 'BOX-001',
        status: BoxStatus.SHIPPED,
        products: [],
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      boxRepository.findById.mockResolvedValue(existingBox);

      await expect(service.update(boxId, updateDto)).rejects.toThrow(InvalidStatusTransitionException);
    });
  });

  describe('remove', () => {
    it('should delete a box with CREATED status', async () => {
      const boxId = 'box-1';
      const existingBox: BoxEntity = {
        id: boxId,
        label: 'BOX-001',
        status: BoxStatus.CREATED,
        products: [],
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      boxRepository.findById.mockResolvedValue(existingBox);
      boxRepository.remove.mockResolvedValue(true);

      await service.remove(boxId);

      expect(boxRepository.findById).toHaveBeenCalledWith(boxId);
      expect(boxRepository.remove).toHaveBeenCalledWith(boxId);
    });

    it('should throw NotFoundException when box not found', async () => {
      // Arrange
      const boxId = 'non-existent-box';
      boxRepository.findById.mockResolvedValue(null);

      await expect(service.remove(boxId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BusinessRuleViolationException when trying to delete SEALED box', async () => {
      const boxId = 'box-1';
      const existingBox: BoxEntity = {
        id: boxId,
        label: 'BOX-001',
        status: BoxStatus.SEALED,
        products: [],
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      boxRepository.findById.mockResolvedValue(existingBox);

      await expect(service.remove(boxId)).rejects.toThrow(BusinessRuleViolationException);
    });

    it('should throw BusinessRuleViolationException when trying to delete SHIPPED box', async () => {
      const boxId = 'box-1';
      const existingBox: BoxEntity = {
        id: boxId,
        label: 'BOX-001',
        status: BoxStatus.SHIPPED,
        products: [],
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      boxRepository.findById.mockResolvedValue(existingBox);

      await expect(service.remove(boxId)).rejects.toThrow(BusinessRuleViolationException);
    });
  });
});
