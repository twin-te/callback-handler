import { UserService } from '../../generated/services/user';
import { Provider } from '../models/provider';
import { createClient, wrapGrpcRequestMethodFactory } from './grpc';

const userServiceClient = createClient(
  ['services/user-service/protos/UserService.proto'],
  UserService,
  process.env.USER_SERVICE_HOST || 'user:50051',
);

const methodWrapper = wrapGrpcRequestMethodFactory(userServiceClient);

export const userService = {
  getOrCreateUser: methodWrapper<typeof userServiceClient.getOrCreateUser, { provider: Provider; socialId: string }>(
    userServiceClient.getOrCreateUser,
  ),
};
