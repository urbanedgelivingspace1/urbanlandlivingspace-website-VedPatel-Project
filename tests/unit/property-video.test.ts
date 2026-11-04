import { describe, expect, it } from "vitest";
import { parsePropertyVideo, videoPlaybackUrls } from "@/lib/media/property-video";

describe("property video URL boundary", () => {
  it.each([
    "https://youtu.be/AbCdEf12345?si=tracking&t=90",
    "https://www.youtube.com/watch?v=AbCdEf12345&list=ignored&autoplay=1",
    "https://m.youtube.com/shorts/AbCdEf12345",
    "https://www.youtube.com/embed/AbCdEf12345?start=30",
    "https://www.youtube-nocookie.com/embed/AbCdEf12345",
  ])("normalizes a single YouTube video: %s", (url) => {
    expect(parsePropertyVideo(url)).toEqual({
      provider: "YOUTUBE",
      mediaId: "AbCdEf12345",
      resourceKey: null,
      canonicalUrl: "https://www.youtube.com/watch?v=AbCdEf12345",
    });
  });
  it.each([
    "https://drive.google.com/file/d/ABCDEFGHIJ_123/view?resourcekey=0-Abc_123&usp=sharing",
    "https://drive.google.com/file/u/0/d/ABCDEFGHIJ_123/preview?resourcekey=0-Abc_123",
    "https://drive.google.com/open?id=ABCDEFGHIJ_123&resourcekey=0-Abc_123",
  ])("preserves a Drive resource key: %s", (url) => {
    const source = parsePropertyVideo(url)!;
    expect(source.canonicalUrl).toBe(
      "https://drive.google.com/file/d/ABCDEFGHIJ_123/view?resourcekey=0-Abc_123",
    );
    expect(videoPlaybackUrls(source.provider, source.mediaId, source.resourceKey)?.embed).toBe(
      "https://drive.google.com/file/d/ABCDEFGHIJ_123/preview?resourcekey=0-Abc_123",
    );
  });
  it.each([
    "javascript:alert(1)",
    "http://youtu.be/AbCdEf12345",
    "https://youtube.com.evil.test/watch?v=AbCdEf12345",
    "https://user:pass@youtube.com/watch?v=AbCdEf12345",
    "https://www.youtube.com:444/watch?v=AbCdEf12345",
    "https://www.youtube.com/playlist?list=AbCdEf12345",
    "https://youtube.com/@channel",
    "https://youtu.be/AbCdEf12345/extra",
    "https://youtube.com/shorts/AbCdEf12345/extra",
    "https://drive.google.com/drive/folders/ABCDEFGHIJ_123",
    "https://drive.google.com/file/d/ABCDEFGHIJ_123/view?resourcekey=bad%26key",
    '<iframe src="https://youtube.com/embed/AbCdEf12345"></iframe>',
    "https://youtu.be/short",
    "https://example.com/video.mp4",
  ])("rejects unsupported or deceptive input: %s", (url) =>
    expect(parsePropertyVideo(url)).toBeNull(),
  );
  it("fails safely for an unknown provider while preserving Vimeo and Matterport", () => {
    expect(videoPlaybackUrls("UNKNOWN", "AbCdEf12345")).toBeNull();
    expect(videoPlaybackUrls("VIMEO", "12345678")?.embed).toBe(
      "https://player.vimeo.com/video/12345678",
    );
    expect(videoPlaybackUrls("MATTERPORT", "ABCDE12345")?.embed).toContain("my.matterport.com");
  });
});
