import * as grpc from '@grpc/grpc-js';
import * as protobuf from 'protobufjs';
import * as protoLoader from '@grpc/proto-loader';
import { ServiceClientConstructor } from '@grpc/grpc-js/build/src/make-client';

export type All<T> = {
  [P in keyof T]-?: All<NonNullable<T[P]>>;
};

export type DeepRequired<T> = {
  [K in keyof T]-?: NonNullable<DeepRequired<T[K]>>;
};

type FilteredKeys<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

type ProtobufFn = (request: {}) => PromiseLike<{}>;
type RequestArgType<T extends ProtobufFn> = T extends (request: infer U) => PromiseLike<any> ? U : never;
type ResponseType<T extends ProtobufFn> = T extends (request: any) => PromiseLike<infer U> ? U : never;

export type GrpcClient<T extends protobuf.rpc.Service> = grpc.Client &
  {
    [K in FilteredKeys<T, ProtobufFn>]: (
      req: RequestArgType<T[K]>,
      callback: grpc.requestCallback<ResponseType<T[K]>>,
    ) => void;
  };

type GrpcClientCallMethod = (req: any, callback: grpc.requestCallback<any>) => void;

type ResponseTypeFromMethod<T extends GrpcClientCallMethod> = Parameters<T> extends [
  any,
  grpc.requestCallback<infer Res>,
]
  ? Res
  : never;

type RequestTypeFromMethod<T extends GrpcClientCallMethod> = Parameters<T> extends [
  infer Req,
  grpc.requestCallback<any>,
]
  ? Req
  : never;

type WrappedGrpcClient<T extends GrpcClient<protobuf.rpc.Service>> = {
  [K in FilteredKeys<T, GrpcClientCallMethod>]: (
    req: RequestTypeFromMethod<T[K]>,
  ) => Promise<All<ResponseTypeFromMethod<T[K]>>>;
};

/**
 * grpcClientを作成する
 * @param protos .protoファイルへのパス
 * @param service 生成されるサービスの型定義
 * @param address 接続先
 * @returns 引数のserviceによって静的型付けされたgrpc-js純正のgrpcクライアント
 */
export function createClient<T extends typeof protobuf.rpc.Service>(
  protos: string[],
  service: T,
  address: string,
): GrpcClient<InstanceType<T>> {
  const def = protoLoader.loadSync(protos, { defaults: true });
  const Client = grpc.loadPackageDefinition(def)[service.name] as ServiceClientConstructor;
  const client = (new Client(address, grpc.ChannelCredentials.createInsecure()) as unknown) as GrpcClient<
    InstanceType<T>
  >;

  return client;
}

/**
 * grpc-js純正のクライアントのメソッドをpromisifyする
 * @param method promisifyするメソッドの参照
 * @param binder methodのthisになる。通常methodが所属しているgrpc-js純正クライアントを指定する
 * @param transform 変形する関数
 * @returns promisifyされたメソッド
 */
function wrapGrpcRequestMethod<
  Method extends GrpcClientCallMethod,
  RequestType = RequestTypeFromMethod<Method>,
  ReturnType = All<ResponseTypeFromMethod<Method>>
>(
  method: Method,
  binder: any,
  transform?: {
    to?: (req: RequestType) => RequestTypeFromMethod<Method>;
    from?: (res: All<ResponseTypeFromMethod<Method>>) => ReturnType;
  },
): (req: RequestType) => Promise<ReturnType> {
  return (req: RequestType) =>
    new Promise<ReturnType>((resolve, reject) => {
      method.bind(binder)(transform?.to ? transform.to(req) : req, (err, res) => {
        if (err || !res) reject(err);
        else resolve(transform?.from ? transform.from(res) : res);
      });
    });
}

/**
 * grpc-js純正のクライアントのメソッドをpromisifyする関数を生成する
 * @param client grpc-js純正クライアント
 * @returns 指定されたgrpc-js純正クライアントのメソッドをpromisifyできる関数
 */
export function wrapGrpcRequestMethodFactory(client: GrpcClient<protobuf.rpc.Service>) {
  return <
    Method extends GrpcClientCallMethod,
    RequestType = RequestTypeFromMethod<Method>,
    ReturnType = All<ResponseTypeFromMethod<Method>>
  >(
    /** ラップするメソッド */
    method: Method,
    transform?: {
      /** リクエスト時変換 */
      to?: (req: RequestType) => RequestTypeFromMethod<Method>;
      /** レスポンス時変換 */
      from?: (res: All<ResponseTypeFromMethod<Method>>) => ReturnType;
    },
  ) => wrapGrpcRequestMethod(method, client, transform);
}

// type WrapConfig<Client extends GrpcClient<protobuf.rpc.Service>> = {
//   [MethodName in FilteredKeys<Client, GrpcClientCallMethod>]: {
//     transform?: {
//       to?: <RequestType = RequestTypeFromMethod<Client[MethodName]>>(
//         req: RequestType
//       ) => RequestTypeFromMethod<Client[MethodName]>
//       from?: <ReturnType>(
//         res: All<ResponseTypeFromMethod<Client[MethodName]>>
//       ) => ReturnType
//     }
//   }
// }

// export function wrapGrpcClientNext<
//   Client extends GrpcClient<protobuf.rpc.Service>
// >(client: Client, config: WrapConfig<Client>): WrappedGrpcClient<Client> {
//   const wrapper = wrapGrpcRequestMethodFactory(client)
//   const wrapped: { [key: string]: any } = {}
//   // @ts-ignore
//   // eslint-disable-next-line no-proto
//   Object.keys(client.__proto__).forEach((k) => {
//     const methodName = k as keyof WrapConfig<Client>
//     const targetConfig = config[methodName]
//     const fn = client[methodName]
//     // @ts-ignore
//     wrapped[k] = wrapper(fn, targetConfig?.transform)
//   })
//   // @ts-ignore
//   return wrapped
// }

/**
 *  grpc-js純正のクライアントの全てのメソッドをpromisifyする
 * {@link wrapGrpcRequestMethod} で指定できるtransformは指定できない
 * @param client promisifyしたいgrpc-js純正クライアント
 * @returns promisifyされたクライアント
 */
export function wrapGrpcClient<Client extends GrpcClient<protobuf.rpc.Service>>(
  client: Client,
): WrappedGrpcClient<Client> {
  const wrapper = wrapGrpcRequestMethodFactory(client);
  const wrapped: { [key: string]: any } = {};
  // @ts-ignore
  // eslint-disable-next-line no-proto
  Object.keys(client.__proto__).forEach((k) => {
    // @ts-ignore
    const fn = client[k];
    if (typeof fn === 'function') {
      wrapped[k] = wrapper(fn.bind(client) as GrpcClientCallMethod);
    }
  });
  // @ts-ignore
  return wrapped;
}
