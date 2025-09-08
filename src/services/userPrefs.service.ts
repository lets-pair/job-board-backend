import {
  UserPrefs,
  Languages,
  SkillLevel,
  ProjectRole,
  OperatingSystem,
  Prisma
} from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import userService from './user.service';
//import { encryptPassword } from '../utils/encryption';

/**
 * Create a userPrefs
 * @param {Object} userPrefsBody
 * @returns {Promise<UserPrefs>}
 */
const createUserPrefs = async (
  userId: number,
  language: Languages,
  skillLevel: SkillLevel,
  partnerSkillLevel: SkillLevel,
  projectRole: ProjectRole,
  os: OperatingSystem
): Promise<UserPrefs> => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User does not exist');
  }
  if (await getUserPrefsByUserId(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'UserPrefs already exists');
  }
  return prisma.userPrefs.create({
    data: {
      userId,
      language,
      skillLevel,
      partnerSkillLevel,
      projectRole,
      os
    }
  });
};

/**
 * Query for userPrefs
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUserPrefs = async <Key extends keyof UserPrefs>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = [
    'id',
    'userId',
    'language',
    'skillLevel',
    'partnerSkillLevel',
    'projectRole',
    'os',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<UserPrefs, Key>[]> => {
  const page = options.page ?? 0;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? 'desc';
  const userPrefs = await prisma.userPrefs.findMany({
    where: filter,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: page * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined
  });
  return userPrefs as Pick<UserPrefs, Key>[];
};

/**
 * Get userPrefs by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<UserPrefs, Key> | null>}
 */
const getUserPrefsById = async <Key extends keyof UserPrefs>(
  id: string,
  keys: Key[] = [
    'id',
    'userId',
    'language',
    'skillLevel',
    'partnerSkillLevel',
    'projectRole',
    'os',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<UserPrefs, Key> | null> => {
  return prisma.userPrefs.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<UserPrefs, Key> | null>;
};

/**
 * Update userPrefs by id
 * @param {ObjectId} userPrefsId
 * @param {Object} updateBody
 * @returns {Promise<UserPrefs>}
 */
const updateUserPrefsById = async <Key extends keyof UserPrefs>(
  userPrefsId: string,
  updateBody: Prisma.UserPrefsUpdateInput,
  keys: Key[] = [
    'id',
    'userId',
    'language',
    'skillLevel',
    'partnerSkillLevel',
    'projectRole',
    'os',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<UserPrefs, Key> | null> => {
  const userPrefs = await getUserPrefsById(userPrefsId, ['id', 'userId']);
  if (!userPrefs) {
    throw new ApiError(httpStatus.NOT_FOUND, 'UserPrefs not found');
  }
  const updatedUserPrefs = await prisma.userPrefs.update({
    where: { id: userPrefs.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  });
  return updatedUserPrefs as Pick<UserPrefs, Key> | null;
};

/**
 * Delete userPrefs by id
 * @param {ObjectId} userPrefsId
 * @returns {Promise<UserPrefs>}
 */
const deleteUserPrefsById = async (userPrefsId: string): Promise<UserPrefs> => {
  const userPrefs = await getUserPrefsById(userPrefsId);
  if (!userPrefs) {
    throw new ApiError(httpStatus.NOT_FOUND, 'UserPrefs not found');
  }
  await prisma.userPrefs.delete({ where: { id: userPrefs.id } });
  return userPrefs;
};

const getUserPrefsByUserId = async <Key extends keyof UserPrefs>(
  userId: number,
  keys: Key[] = [
    'id',
    'userId',
    'language',
    'skillLevel',
    'partnerSkillLevel',
    'projectRole',
    'os',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<UserPrefs, Key> | null> => {
  return prisma.userPrefs.findUnique({
    where: { userId },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<UserPrefs, Key> | null>;
};

export default {
  createUserPrefs,
  queryUserPrefs,
  getUserPrefsById,
  getUserPrefsByUserId,
  updateUserPrefsById,
  deleteUserPrefsById
};
