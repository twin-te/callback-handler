import { SessionService } from '../../generated/services/session';
import { createClient, wrapGrpcRequestMethodFactory } from './grpc';

const sessionServiceClient = createClient(
  ['services/session-service/protos/SessionService.proto'],
  SessionService,
  process.env.SESSION_SERVICE_HOST || 'session:50051',
);

const methodWrapper = wrapGrpcRequestMethodFactory(sessionServiceClient);

export const sessionService = {
  startSession: methodWrapper<typeof sessionServiceClient.startSession>(sessionServiceClient.startSession),
};
