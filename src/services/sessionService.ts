import { SessionService } from '../../generated/services/session';
import { createClient, wrapGrpcRequestMethodFactory } from './grpc';

const sessionServiceClient = createClient(
  ['services/session-service/protos/SessionService.proto'],
  SessionService,
  'localhost:50052',
);

const methodWrapper = wrapGrpcRequestMethodFactory(sessionServiceClient);

export const sessionService = {
  startSession: methodWrapper<typeof sessionServiceClient.startSession>(sessionServiceClient.startSession),
};
