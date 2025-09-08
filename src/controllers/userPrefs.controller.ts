import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { userPrefsService } from '../services';
import { User } from '@prisma/client';

const createUserPrefs = catchAsync(async (req, res) => {
  const { userId, language, skillLevel, partnerSkillLevel, projectRole, os } = req.body;
  const userPrefs = await userPrefsService.createUserPrefs(
    userId,
    language,
    skillLevel,
    partnerSkillLevel,
    projectRole,
    os
  );
  res.status(httpStatus.CREATED).send(userPrefs);
});

const getUserPrefs = catchAsync(async (req, res) => {
  const user = req.user as User;
  if (user.role !== 'ADMIN') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }
  const filter = pick(req.query, [
    'language',
    'skillLevel',
    'partnerSkillLevel',
    'projectRole',
    'os'
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userPrefsService.queryUserPrefs(filter, options);
  res.send(result);
});

const getUserPrefsById = catchAsync(async (req, res) => {
  const userPrefs = await userPrefsService.getUserPrefsById(req.params.userPrefsId);
  if (!userPrefs) {
    throw new ApiError(httpStatus.NOT_FOUND, 'UserPrefs not found');
  }
  res.send(userPrefs);
});

const getUserPrefsByUserId = catchAsync(async (req, res) => {
  const user = req.user as User;
  if (user.id !== req.params.userId && user.role !== 'ADMIN') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }
  const userPrefs = await userPrefsService.getUserPrefsByUserId(req.params.userId);
  if (!userPrefs) {
    throw new ApiError(httpStatus.NOT_FOUND, 'UserPrefs not found');
  }
  res.send(userPrefs);
});

const updateUserPrefs = catchAsync(async (req, res) => {
  const userPrefs = await userPrefsService.updateUserPrefsById(req.params.userPrefsId, req.body);
  res.send(userPrefs);
});

const deleteUserPrefs = catchAsync(async (req, res) => {
  await userPrefsService.deleteUserPrefsById(req.params.userPrefsId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createUserPrefs,
  getUserPrefs,
  getUserPrefsById,
  getUserPrefsByUserId,
  updateUserPrefs,
  deleteUserPrefs
};
