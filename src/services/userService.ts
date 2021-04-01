import { UserService, Provider as GProvider } from '../../generated/services/user';
import { Provider } from '../models/provider';
import { createClient, wrapGrpcRequestMethodFactory } from './grpc';

const userServiceClient = createClient(
  ['services/user-service/protos/UserService.proto'],
  UserService,
  process.env.USER_SERVICE_HOST || 'user:50051',
);

const methodWrapper = wrapGrpcRequestMethodFactory(userServiceClient);

export const userService = {
  getOrCreateUser: methodWrapper(userServiceClient.getOrCreateUser, {
    to: (req: { provider: Provider; socialId: string }) => ({
      provider: toGrpcProvider(req.provider),
      socialId: req.socialId,
    }),
  }),
};

function toGrpcProvider(p: Provider): GProvider {
  switch (p) {
    case 'google':
      return GProvider.Google;
    case 'twitter':
      return GProvider.Twitter;
    case 'apple':
      return GProvider.Apple;
  }
}
