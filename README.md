## программа содуржит несколько сущностей

в том числе

Track, Playlist, вспомогательный класс Uploader

Track содержит длину трэка, опционально содержит обложку, содержит называние файла с трэком и путь до этого файла (локальный путь)

пример объекта трэк

```javascript
const track = {
  cover: {
      fileBuffer: [...],
      url: 'https://example.com/image'
  },
  duration: 227,
  filename: 'track1.mp3',
  filepath: 'path/to/track1.mp3'
}
```

для хранения и изменеения трэков используется класс Playlist

плейлист содержит трэки, список обработанных трэков, и список уже отправленных в cloudflare трэков

и выглядит примерно так


```javascript
class Playlist {
  tracks: [...]

  addTrack()

  addMultipleTracks()

  deletePlaylistLocally()
}
```

да, кроме того, класс для работы с плейлистами, как видно, также содержит несколько методов для упрощения работы с трэками, для упрощения составления плейлиста

