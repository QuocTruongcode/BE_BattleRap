# ERD - BattleRap

![BattleRap ERD diagram](./ERD.svg)

Sơ đồ được dựng từ các model Sequelize trong `models/`. Các bảng có `id` và
`createdAt`/`updatedAt` do Sequelize tự sinh được ghi rõ bên dưới; riêng
`VideoBattlers` dùng khóa chính ghép và không có timestamps.

```mermaid
erDiagram
    Video {
        INTEGER id PK
        STRING title
        STRING linkVideo
        STRING linkBunny
        STRING storageId
        STRING thumbnailUrl
        INTEGER battlerID
        TEXT review
        INTEGER eventID
        FLOAT cleanScore
        DATE createdAt
        DATE updatedAt
    }

    VideoBattler {
        INTEGER videoID PK, FK
        INTEGER battlerID PK, FK
    }

    Battler {
        INTEGER id PK
        STRING RapName
        STRING FullName
        TEXT Describe
        STRING image
        DATE createdAt
        DATE updatedAt
    }

    Bar {
        INTEGER id PK
        FLOAT startTime
        TEXT content
        INTEGER videoId
        INTEGER barttelID FK
        STRING barType FK
        FLOAT averageScore
        FLOAT bayesianAverange
        INTEGER totalReaction
        DATE createdAt
        DATE updatedAt
    }

    BarRelationship {
        INTEGER id PK
        STRING RelationType FK
        INTEGER SourceBarID FK
        INTEGER EntityID FK
        DATE createdAt
        DATE updatedAt
    }

    BarReaction {
        INTEGER id PK
        INTEGER barID FK
        INTEGER userID FK
        STRING ReactionType FK
        DATE createdAt
        DATE updatedAt
    }

    Entity {
        INTEGER id PK
        STRING EntityType
        INTEGER RefID
        DATE createdAt
        DATE updatedAt
    }

    AllCode {
        INTEGER id PK
        STRING KeyMap UK
        STRING Type
        STRING ValueVi
        STRING ValueEn
        DATE createdAt
        DATE updatedAt
    }

    Explanation {
        INTEGER id PK
        TEXT meaning
        TEXT reference
        TEXT whyGood
        JSON images
        INTEGER barId FK
        DATE createdAt
        DATE updatedAt
    }

    Drama {
        INTEGER id PK
        STRING title
        TEXT summary
        DATE createdAt
        DATE updatedAt
    }

    DramaEvent {
        INTEGER id PK
        STRING link
        TEXT title
        TEXT review
        INTEGER dramaID FK
        INTEGER videoID FK
        STRING facebookUrl
        STRING pageName
        STRING postId
        DATE time
        DATE createdAt
        DATE updatedAt
    }

    User {
        INTEGER id PK
        STRING UserName
        STRING Email
        STRING google_sub UK
        STRING UserType FK
        DATE createdAt
        DATE updatedAt
    }

    CommentVideo {
        INTEGER id PK
        INTEGER videoID FK
        INTEGER userID FK
        INTEGER barID FK
        TEXT content
        DATE createdAt
        DATE updatedAt
    }

    ReplyComment {
        INTEGER id PK
        INTEGER commentID FK
        INTEGER userID FK
        INTEGER replyUserID FK
        TEXT content
        DATE createdAt
        DATE updatedAt
    }

    ReactionComment {
        INTEGER id PK
        INTEGER userID FK
        INTEGER commentID FK
        INTEGER replyCommentID FK
        INTEGER reaction
        DATE createdAt
        DATE updatedAt
    }

    KeyR2 {
        INTEGER id PK
        INTEGER VideoID FK, UK
        STRING key
        DATE createdAt
        DATE updatedAt
    }

    historyChatBot {
        INTEGER id PK
        STRING conversationID
        INTEGER UserID FK
        STRING role
        TEXT content
        DATE createdAt
        DATE updatedAt
    }

    Video ||--o{ CommentVideo : "videoID"
    User ||--o{ CommentVideo : "userID"
    Bar o|--o{ CommentVideo : "barID nullable"

    Video ||--o{ VideoBattler : "videoID"
    Battler ||--o{ VideoBattler : "battlerID"
    Battler ||--o{ Bar : "barttelID"

    Bar ||--o{ BarRelationship : "SourceBarID"
    Entity ||--o{ BarRelationship : "EntityID"
    AllCode ||--o{ BarRelationship : "KeyMap to RelationType"

    Bar ||--o{ BarReaction : "barID"
    User ||--o{ BarReaction : "userID"
    AllCode ||--o{ BarReaction : "KeyMap to ReactionType"
    AllCode ||--o{ Bar : "KeyMap to barType"
    AllCode ||--o{ User : "KeyMap to UserType"

    Bar ||--o{ Explanation : "barId; hasOne association, not unique in schema"

    Drama ||--o{ DramaEvent : "dramaID"
    Video o|--o{ DramaEvent : "videoID nullable"

    CommentVideo ||--o{ ReplyComment : "commentID"
    User ||--o{ ReplyComment : "userID author"
    User ||--o{ ReplyComment : "replyUserID recipient"
    User ||--o{ ReactionComment : "userID"
    CommentVideo o|--o{ ReactionComment : "commentID nullable"
    ReplyComment o|--o{ ReactionComment : "replyCommentID nullable"

    Video ||--o| KeyR2 : "VideoID unique"
    User ||--o{ historyChatBot : "UserID"

    Video ||..o{ Entity : "RefID when EntityType is Video; hasOne association, no FK or unique constraint"
    Bar ||..o{ Entity : "RefID when EntityType is Bar; hasOne association, no FK or unique constraint"
```

## Ghi chú

- `PK`: khóa chính; `FK`: quan hệ/khóa ngoại được khai báo qua model; `UK`: duy nhất.
- Các cột không ghi `PK` là nullable theo mặc định của Sequelize, trừ khi model
  chỉ định khác.
- `VideoBattler` là bảng nối nhiều-nhiều giữa `Video` và `Battler`.
- `Entity.RefID` là tham chiếu đa hình đến `Video.id` hoặc `Bar.id`, tùy
  `EntityType`; hai liên kết này không có ràng buộc khóa ngoại vật lý.
- `Video.battlerID`, `Video.eventID` và `Bar.videoId` có trong model nhưng không
  được khai báo association trong `models/`, nên không được vẽ thành quan hệ.
