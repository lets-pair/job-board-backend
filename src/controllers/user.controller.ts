import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { tokenService, userService } from '../services';
import exclude from '../utils/exclude';
import { User } from '@prisma/client';
import prisma from '../client';

const createUser = catchAsync(async (req, res) => {
  const { email, password, name, birthDay, guardianEmail, role } = req.body;
  const user = await userService.createUser(email, password, name, birthDay, guardianEmail, role);
  res.status(httpStatus.CREATED).send(user);
});

const createAdmin = catchAsync(async (req, res) => {
  const adminCount = await prisma.user.count({
    where: {
      role: 'ADMIN'
    }
  });
  if (adminCount == 2) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You can not create admins');
  }
  const { email, password, name, birthDay, guardianEmail, role } = req.body;
  const user = await userService.createUser(email, password, name, birthDay, guardianEmail, role);
  const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user: userWithoutPassword, tokens });
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role', 'isEmailVerified', 'isConsented', 'isDisabled']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortType', 'search']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const getUserInfo = catchAsync(async (req, res) => {
  const userCheck = req.user as User;
  if (userCheck.id !== req.params.userId && userCheck.role !== 'ADMIN') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }
  const user = await userService.getUserById(req.params.userId, [
    'id',
    'address',
    'birthDay',
    'email',
    'isEmailVerified',
    'name',
    'phoneNumber',
    'role'
  ]);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createAdmin,
  getUserInfo
};
