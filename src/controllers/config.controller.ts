import httpStatus from 'http-status';
import pick from '../utils/pick';
import catchAsync from '../utils/catchAsync';
import { configService } from '../services';

const createConfig = catchAsync(async (req, res) => {
  const { numComputers, startDay, endDay, duration } = req.body;
  const config = await configService.createConfig(numComputers, startDay, endDay, duration);
  res.status(httpStatus.CREATED).send(config);
});

const getConfig = catchAsync(async (req, res) => {
  const filter = pick(req.query, []);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await configService.queryConfig(filter, options);
  res.send(result);
});

const updateConfig = catchAsync(async (req, res) => {
  const config = await configService.updateConfigById(req.params.configId, req.body);
  res.send(config);
});

export default {
  createConfig,
  getConfig,
  updateConfig
};
