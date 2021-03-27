# callback-handler

API Gateway を通さないコールバックリクエストを受ける

## 環境変数

`.env.example` を見ると雰囲気がわかります。`.env` にコピーして編集してください。

## エンドポイント

### /v1/auth/${provider}

各プロバイダのサービス画面に遷移して OAuth 認証を行います。クエリパラメータで `redirect_uri` を設定すると、認証後にその URL に遷移します。

`provider` は今のところ `google`, `twitter`, `apple` に対応しています。

ex: http://localhost:3001/v1/auth/google?redirect_uri=https%3A%2F%2Fgoogle.com

### /v1/auth/${provider}/callback

各プロバイダのサービスからのコールバックをうけるエンドポイントです。明示的にここを叩くことは基本的にありません。
