import { NextResponse, type NextRequest } from "next/server";

type QQMusicPlaylistSong = {
  songid: number;
  songmid: string;
  songname: string;
  singers: string[];
  albumName: string;
  durationSec: number;
};

type QQMusicPlaylistResponse = {
  disstid: string;
  name: string;
  cover: string;
  desc: string;
  songs: QQMusicPlaylistSong[];
};

export async function GET(request: NextRequest) {
  const disstid = request.nextUrl.searchParams.get("disstid")?.trim() ?? "";
  if (!/^\d+$/.test(disstid)) {
    return NextResponse.json({ message: "invalid_disstid" }, { status: 400 });
  }

  const upstream =
    `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg` +
    `?type=1&json=1&utf8=1&onlysong=0&disstid=${encodeURIComponent(disstid)}&format=json`;

  const res = await fetch(upstream, {
    headers: {
      referer: "https://y.qq.com/",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "upstream_failed", status: res.status },
      { status: 502 }
    );
  }

  const data: unknown = await res.json().catch(() => null);
  const root = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const cdlist = root && Array.isArray(root.cdlist) ? root.cdlist : [];
  const first = cdlist[0] && typeof cdlist[0] === "object" ? (cdlist[0] as Record<string, unknown>) : null;

  const rawSongs = first && Array.isArray(first.songlist) ? first.songlist : [];
  const songs: QQMusicPlaylistSong[] = rawSongs
    .map(raw => {
      if (!raw || typeof raw !== "object") return null;
      const r = raw as Record<string, unknown>;

      const songid = typeof r.songid === "number" ? r.songid : Number(r.songid);
      const songmid = typeof r.songmid === "string" ? r.songmid : "";
      const songname = typeof r.songname === "string" ? r.songname : "";
      const durationSec = typeof r.interval === "number" ? r.interval : Number(r.interval);

      const singerArr = Array.isArray(r.singer) ? (r.singer as unknown[]) : [];
      const singers = singerArr
        .map(s => (s && typeof s === "object" ? (s as Record<string, unknown>).name : null))
        .filter((n): n is string => typeof n === "string" && n.trim().length > 0);

      const album = r.album && typeof r.album === "object" ? (r.album as Record<string, unknown>) : null;
      const albumName = typeof album?.name === "string" ? album.name : "";

      if (!songmid || !songname) return null;

      return {
        songid: Number.isFinite(songid) ? songid : 0,
        songmid,
        songname,
        singers,
        albumName,
        durationSec: Number.isFinite(durationSec) ? durationSec : 0,
      };
    })
    .filter((x): x is QQMusicPlaylistSong => x !== null);

  const payload: QQMusicPlaylistResponse = {
    disstid,
    name: typeof first?.dissname === "string" ? first.dissname : "",
    cover: typeof first?.logo === "string" ? first.logo : "",
    desc: typeof first?.desc === "string" ? first.desc : "",
    songs,
  };

  return NextResponse.json(payload);
}
