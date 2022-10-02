# Shodo-site

webサイトをクローリングしながら、日本語校正APIにかけるCLIツールです。
利用には[ShodoのAPI](https://blog.shodo.ink/entry/2022/05/18/161818)のトークンが必要です

**このツールは対象のサーバーに1request/10msの頻度でGETリクエストを要求します。必ず使用者の管理するサーバーを対象として利用ください**

```text
  shodo-site run               webサイトをクローリングして本文校正を行う  
  shodo-site list              webサイトをクローリングして対象のURLリストを出力する
  shodo-site check             APIルートとtokenがあっているかを確認します
  shodo-site --version, -v     バージョンを表示
  shodo-site --help, -h        ヘルプ
```


# インストール方法

```shell
npm i -g @9wick/shodo-site 
```

# 使い方

check → list → runの順での利用をおすすめします

## トークンの取得方法
[Shodoの公式ブログ](https://blog.shodo.ink/entry/2022/05/18/161818)の手順に従って、
APIルートとTOKENを取得します。

環境変数に展開します。
たとえば、下記のようにexportします。

```shell
export SHODO_API_ROUTE=https://api.shodo.ink/@{組織名}/{プロジェクト名}/
export SHODO_TOKEN=XXXXXXXXX
```


## check

ShodoのAPIがきちんと読み込めているかのチェックを行います。
たとえば、上記でexportができていれば下記のようにアカウントの確認ができます。

```shell
$ npx shodo-site check

✅SHODO_API_ROUTEとSHODO_TOKENを読み込みました
✅shodoアカウントの確認が取れました
```


認証に失敗した場合は下記のようになります
```shell
$ npx shodo-site check

✅SHODO_API_ROUTEとSHODO_TOKENを読み込みました
shodoアカウントの確認に失敗しました Error: 認証に失敗しました
```


## list
webサイトのクローリングのチェックを行います。

`https://9wick.com` をクローリング対象にする場合は下記のようにします。

```shell
$ npx shodo-site list https://9wick.com 
```

クローリング対象とShodoによる校正の対象は分けることができ、`https://9wick.com` をクローリング対象にし、
その中で `https://9wick.com/posts/` を校正対象とする場合には下記のようにします。

```shell
$ npx shodo-site list https://9wick.com --urlPrefix https://9wick.com/posts/
```


実行すると、URLの一覧と文字数が表示されます。
```shell
$ npx shodo-site list https://9wick.com 

本文抽出文字数:  5,854 https://9wick.com
本文抽出文字数:  5,854 https://9wick.com/
本文抽出文字数:  1,810 https://9wick.com/archives
本文抽出文字数:  1,072 https://9wick.com/uncategorized/new-coworking-space/

...

合計文字数:321,704

```


## run
実際に校正を走らせます。

```shell
$ npx shodo-site run https://9wick.com 

✅shodoアカウントの確認が取れました
本文抽出文字数:    294 https://9wick.com/2011/08/new-blog/ 
    2:15 もしかしてAI
                  ブログ（→ ブログは）こちらに移します。 
    2:113 冗長表現
        ツールを紹介or作成していきます（→ します）。 具体的には  
    5:32 IT用語の表記
        バー関係(PHP, Mysql（→ MySQL）, JavaScri
    7:25 もしかしてAI
        などを書いていく予定です（→ ですが） ときどきソースコー
本文抽出文字数:  1,060 https://9wick.com/2011/08/app-need-image/ 
    2:36 表現の改善
        イズを毎回調べるのがめんどくさ（→ 面倒くさ）くなってきたのでココ
    2:84 文の長さが100文字を超えています
        。 意外と知らないサイズ指定があって驚きま
    2:87 助詞「は」が近くで連続しています
        驚きました。 ソースはiOS Human 

...

合計文字数:21,704
```