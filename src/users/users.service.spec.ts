import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { faker } from '@faker-js/faker';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { EntityNotFoundError } from 'typeorm';
import { HttpException } from '@nestjs/common';

function generateRandomUserDto(): UserDto {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
}

const mockRepository = {
  find: jest.fn(),
  findOneByOrFail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should call save user in the repository', async () => {
      const userDto = generateRandomUserDto();
      await service.create(userDto);
      expect(mockRepository.save).toHaveBeenCalledWith(userDto);
    });
  });

  describe('findAll', () => {
    it('should use the repository to find all users', async () => {
      await service.findAll();
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should use the repository to find one user by id', async () => {
      const id = faker.number.int();
      await service.findOne(id);
      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith({ id });
    });

    it('should throw a HttpException when the repository cannot find the user', async () => {
      const id = faker.number.int();
      mockRepository.findOneByOrFail.mockRejectedValueOnce(
        new EntityNotFoundError(User, id),
      );
      await expect(service.findOne(id)).rejects.toThrow(HttpException);
    });

    it('should throw the same error if the repository throws any error that is not an EntityNotFoundError', async () => {
      const id = faker.number.int();
      mockRepository.findOneByOrFail.mockRejectedValueOnce(new Error());
      await expect(service.findOne(id)).rejects.toThrow(Error);
    });
  });

  describe('update', () => {
    it('should throw a HttpException when the repository cannot find the user', async () => {
      const id = faker.number.int();
      const userDto = generateRandomUserDto();
      mockRepository.findOneByOrFail.mockRejectedValueOnce(
        new EntityNotFoundError(User, id),
      );
      await expect(service.update(id, userDto)).rejects.toThrow(HttpException);
    });

    it('should throw the same error if the repository throws any error that is not an EntityNotFoundError', async () => {
      const id = faker.number.int();
      const userDto = generateRandomUserDto();
      mockRepository.findOneByOrFail.mockRejectedValueOnce(new Error());
      await expect(service.update(id, userDto)).rejects.toThrow(Error);
    });

    it('should use the repository to update the user', async () => {
      const id = faker.number.int();
      const userDto = generateRandomUserDto();
      await service.update(id, userDto);
      expect(mockRepository.update).toHaveBeenCalledWith(id, userDto);
    });
  });

  describe('delete', () => {
    it('should use the repository to delete the user for the given id', async () => {
      const id = faker.number.int();
      await service.delete(id);
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
