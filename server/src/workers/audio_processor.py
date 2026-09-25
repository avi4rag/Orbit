"""
ORBIT Subliminal Media Pipeline — Python Audio Processing Worker
Downloads YouTube source audio, extracts & converts to MP3 via FFmpeg,
verifies container and audio streams via FFprobe, validates duration integrity,
and computes SHA256 checksum (audioFileHash).
"""

import sys
import os
import json
import hashlib
import argparse
import subprocess
from pathlib import Path


def compute_sha256(filepath: Path) -> str:
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def probe_audio_file(filepath: Path, ffprobe_bin: str) -> dict:
    cmd = [
        ffprobe_bin,
        "-v", "error",
        "-show_entries", "format=duration,size,bit_rate:stream=codec_name,sample_rate,channels",
        "-of", "json",
        str(filepath)
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    data = json.loads(result.stdout)
    
    fmt = data.get("format", {})
    streams = data.get("streams", [])
    
    audio_stream = next((s for s in streams if s.get("codec_name") in ["mp3", "mp3float"]), None)
    if not audio_stream and streams:
        audio_stream = streams[0]
        
    duration = float(fmt.get("duration", 0.0))
    file_size = int(fmt.get("size", filepath.stat().st_size))
    bit_rate = int(fmt.get("bit_rate", 0)) if fmt.get("bit_rate") else 128000
    sample_rate = int(audio_stream.get("sample_rate", 44100)) if audio_stream else 44100
    channels = int(audio_stream.get("channels", 2)) if audio_stream else 2

    return {
        "duration": duration,
        "fileSize": file_size,
        "bitRate": bit_rate,
        "sampleRate": sample_rate,
        "channels": channels,
        "codec": audio_stream.get("codec_name", "mp3") if audio_stream else "unknown"
    }


def process_video_audio(video_id: str, out_dir: Path, ffmpeg_bin: str, ffprobe_bin: str, expected_duration: float = None) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    target_mp3 = out_dir / f"{video_id}.mp3"

    # Step 1: If file already exists and valid, verify it
    if target_mp3.exists() and target_mp3.stat().st_size > 1024:
        try:
            probe = probe_audio_file(target_mp3, ffprobe_bin)
            if probe["duration"] > 0:
                audio_hash = compute_sha256(target_mp3)
                return {
                    "success": True,
                    "videoId": video_id,
                    "filename": f"{video_id}.mp3",
                    "filePath": str(target_mp3.resolve()),
                    "audioUrl": f"/api/subliminals/media/{video_id}.mp3",
                    "duration": int(round(probe["duration"])),
                    "fileSize": probe["fileSize"],
                    "audioFileHash": audio_hash,
                    "sampleRate": probe["sampleRate"],
                    "channels": probe["channels"],
                    "bitRate": probe["bitRate"],
                    "reusedExisting": True
                }
        except Exception:
            # Corrupted existing file, delete and reprocess
            target_mp3.unlink(missing_ok=True)

    # Step 2: Download & Extract with yt_dlp
    source_url = f"https://www.youtube.com/watch?v={video_id}"
    out_tmpl = str(out_dir / "%(id)s.%(ext)s")

    cmd = [
        sys.executable, "-m", "yt_dlp",
        "--no-playlist",
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "128K",
        "--ffmpeg-location", ffmpeg_bin,
        "-o", out_tmpl,
        source_url
    ]

    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if proc.returncode != 0:
        return {
            "success": False,
            "videoId": video_id,
            "errorCode": "AUDIO_DOWNLOAD_FAILED",
            "error": proc.stderr or proc.stdout
        }

    # Step 3: Verify output file exists and has content
    if not target_mp3.exists() or target_mp3.stat().st_size == 0:
        return {
            "success": False,
            "videoId": video_id,
            "errorCode": "OUTPUT_FILE_MISSING",
            "error": f"FFmpeg completed but {target_mp3.name} was not generated or is empty."
        }

    # Step 4: Probe and verify audio attributes
    try:
        probe = probe_audio_file(target_mp3, ffprobe_bin)
    except Exception as e:
        target_mp3.unlink(missing_ok=True)
        return {
            "success": False,
            "videoId": video_id,
            "errorCode": "CORRUPT_AUDIO_OUTPUT",
            "error": f"FFprobe failed to inspect output MP3: {str(e)}"
        }

    actual_duration = probe["duration"]
    if actual_duration <= 0:
        target_mp3.unlink(missing_ok=True)
        return {
            "success": False,
            "videoId": video_id,
            "errorCode": "INVALID_DURATION",
            "error": f"Audio file has non-positive duration: {actual_duration}s"
        }

    # Step 5: Integrity check on duration (Prompt §7)
    if expected_duration and expected_duration > 15:
        # If expected is e.g. 900s and actual is < 15s or mismatch is massive (> 50% truncated)
        if actual_duration < 10 or (expected_duration > 60 and actual_duration < expected_duration * 0.4):
            target_mp3.unlink(missing_ok=True)
            return {
                "success": False,
                "videoId": video_id,
                "errorCode": "AUDIO_DURATION_MISMATCH",
                "error": f"Metadata duration is {expected_duration}s but processed MP3 is only {actual_duration}s."
            }

    # Step 6: Compute audio hash fingerprint (Prompt §8)
    audio_hash = compute_sha256(target_mp3)

    return {
        "success": True,
        "videoId": video_id,
        "filename": f"{video_id}.mp3",
        "filePath": str(target_mp3.resolve()),
        "audioUrl": f"/api/subliminals/media/{video_id}.mp3",
        "duration": int(round(actual_duration)),
        "fileSize": probe["fileSize"],
        "audioFileHash": audio_hash,
        "sampleRate": probe["sampleRate"],
        "channels": probe["channels"],
        "bitRate": probe["bitRate"],
        "reusedExisting": False
    }


def main():
    parser = argparse.ArgumentParser(description="ORBIT Audio Processor Worker")
    parser.add_argument("--video-id", required=True, help="YouTube Video ID")
    parser.add_argument("--output-dir", required=True, help="Directory to store MP3 files")
    parser.add_argument("--ffmpeg-bin", required=True, help="Path to ffmpeg binary")
    parser.add_argument("--ffprobe-bin", required=True, help="Path to ffprobe binary")
    parser.add_argument("--expected-duration", type=float, default=None, help="Expected duration in seconds")

    args = parser.parse_args()

    result = process_video_audio(
        video_id=args.video_id,
        out_dir=Path(args.output_dir),
        ffmpeg_bin=args.ffmpeg_bin,
        ffprobe_bin=args.ffprobe_bin,
        expected_duration=args.expected_duration
    )

    print(json.dumps(result))
    if not result.get("success"):
        sys.exit(1)


if __name__ == "__main__":
    main()
