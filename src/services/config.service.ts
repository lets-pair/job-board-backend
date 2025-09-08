import { Config, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';

/**
 * Create a config
 * @param {Object} configBody
 * @returns {Promise<Config>}
 */
const createConfig = async (
  numComputers: number,
  startDay: string,
  endDay: string,
  duration: number
): Promise<Config> => {
  const configExists = await prisma.config.findFirst();
  if (configExists) {
    throw new ApiError(httpStatus.CONFLICT, 'Config already exists.');
  }
  return prisma.config.create({
    data: { numComputers, startDay, endDay, duration }
  });
};

/**
 * Query for config
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryConfig = async <Key extends keyof Config>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = [
    'id',
    'numComputers',
    'startDay',
    'endDay',
    'duration',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Config, Key>[]> => {
  const page = options.page ?? 0;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? 'desc';
  const config = await prisma.config.findMany({
    where: filter,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: page * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined
  });
  return config as Pick<Config, Key>[];
};

/**
 * Get config by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Config, Key> | null>}
 */
const getConfigById = async <Key extends keyof Config>(
  id: string,
  keys: Key[] = [
    'id',
    'numComputers',
    'startDay',
    'endDay',
    'duration',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Config, Key> | null> => {
  return prisma.config.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Config, Key> | null>;
};

/**
 * Update config by id
 * @param {ObjectId} configId
 * @param {Object} updateBody
 * @returns {Promise<Config>}
 */
const updateConfigById = async <Key extends keyof Config>(
  configId: string,
  updateBody: Prisma.ConfigUpdateInput,
  keys: Key[] = [
    'id',
    'numComputers',
    'startDay',
    'endDay',
    'duration',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Config, Key> | null> => {
  const config = await getConfigById(configId, ['id']);
  if (!config) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Config not found');
  }
  const updatedConfig = await prisma.config.update({
    where: { id: config.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  });
  return updatedConfig as Pick<Config, Key> | null;
};

export default {
  createConfig,
  queryConfig,
  updateConfigById
};
