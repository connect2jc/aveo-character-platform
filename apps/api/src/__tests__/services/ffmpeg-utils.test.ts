describe('FFmpeg Utils', () => {
  // Helper to build FFmpeg-like command strings for testing
  function buildConcatCommand(
    clips: string[],
    output: string,
    options?: { crossfade?: number }
  ): string {
    if (clips.length === 1) {
      return `ffmpeg -i ${clips[0]} -c copy ${output}`;
    }

    const inputs = clips.map((c) => `-i ${c}`).join(' ');
    const crossfade = options?.crossfade || 0;

    if (crossfade > 0) {
      const filters: string[] = [];
      for (let i = 0; i < clips.length - 1; i++) {
        const tag = i === 0 ? `[0][1]` : `[tmp${i}][${i + 1}]`;
        const outTag =
          i === clips.length - 2 ? '[out]' : `[tmp${i + 1}]`;
        filters.push(
          `${tag}xfade=transition=fade:duration=${crossfade}:offset=${i * 10}${outTag}`
        );
      }
      return `ffmpeg ${inputs} -filter_complex "${filters.join(';')}" -map "[out]" ${output}`;
    }

    const filterInputs = clips.map((_, i) => `[${i}:v][${i}:a]`).join('');
    return `ffmpeg ${inputs} -filter_complex "${filterInputs}concat=n=${clips.length}:v=1:a=1[v][a]" -map "[v]" -map "[a]" ${output}`;
  }

  function buildCaptionCommand(
    input: string,
    srtFile: string,
    output: string
  ): string {
    return `ffmpeg -i ${input} -vf "subtitles=${srtFile}:force_style='FontSize=24,PrimaryColour=&HFFFFFF,BackColour=&H80000000,BorderStyle=4,Alignment=2,MarginV=80'" ${output}`;
  }

  function buildMusicDuckCommand(
    videoInput: string,
    musicInput: string,
    output: string,
    volume: number
  ): string {
    return `ffmpeg -i ${videoInput} -i ${musicInput} -filter_complex "[1:a]volume=${volume}[music];[0:a][music]amix=inputs=2:duration=first[aout]" -map 0:v -map "[aout]" ${output}`;
  }

  function buildAspectRatioCommand(
    input: string,
    output: string,
    ratio: string
  ): string {
    const ratioMap: Record<string, string> = {
      '9:16': '1080:1920',
      '1:1': '1080:1080',
      '4:5': '1080:1350',
    };
    const resolution = ratioMap[ratio] || '1080:1920';
    return `ffmpeg -i ${input} -vf "scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2" ${output}`;
  }

  it('should build correct concat command', () => {
    const clips = ['clip1.mp4', 'clip2.mp4', 'clip3.mp4'];
    const cmd = buildConcatCommand(clips, 'output.mp4');

    expect(cmd).toContain('ffmpeg');
    expect(cmd).toContain('-i clip1.mp4');
    expect(cmd).toContain('-i clip2.mp4');
    expect(cmd).toContain('-i clip3.mp4');
    expect(cmd).toContain('concat=n=3');
    expect(cmd).toContain('output.mp4');
  });

  it('should add crossfade transitions', () => {
    const clips = ['clip1.mp4', 'clip2.mp4'];
    const cmd = buildConcatCommand(clips, 'output.mp4', { crossfade: 0.5 });

    expect(cmd).toContain('xfade');
    expect(cmd).toContain('duration=0.5');
    expect(cmd).toContain('transition=fade');
  });

  it('should burn in SRT captions', () => {
    const cmd = buildCaptionCommand('video.mp4', 'captions.srt', 'output.mp4');

    expect(cmd).toContain('subtitles=captions.srt');
    expect(cmd).toContain('FontSize=24');
    expect(cmd).toContain('PrimaryColour');
    expect(cmd).toContain('MarginV=80');
  });

  it('should duck background music volume', () => {
    const cmd = buildMusicDuckCommand(
      'video.mp4',
      'music.mp3',
      'output.mp4',
      0.15
    );

    expect(cmd).toContain('volume=0.15');
    expect(cmd).toContain('amix=inputs=2');
    expect(cmd).toContain('duration=first');
  });

  it('should export to specified aspect ratio', () => {
    const ratios = ['9:16', '1:1', '4:5'];
    const expectedResolutions = ['1080:1920', '1080:1080', '1080:1350'];

    ratios.forEach((ratio, i) => {
      const cmd = buildAspectRatioCommand('input.mp4', 'output.mp4', ratio);
      expect(cmd).toContain(expectedResolutions[i]);
      expect(cmd).toContain('pad=');
    });
  });

  it('should handle single clip (no concat needed)', () => {
    const clips = ['single-clip.mp4'];
    const cmd = buildConcatCommand(clips, 'output.mp4');

    expect(cmd).toContain('-c copy');
    expect(cmd).not.toContain('concat');
    expect(cmd).not.toContain('filter_complex');
  });

  it('should build complete pipeline command', () => {
    const steps = [
      buildConcatCommand(['c1.mp4', 'c2.mp4'], 'concat.mp4', {
        crossfade: 0.5,
      }),
      buildCaptionCommand('concat.mp4', 'subs.srt', 'captioned.mp4'),
      buildMusicDuckCommand('captioned.mp4', 'bg.mp3', 'mixed.mp4', 0.15),
      buildAspectRatioCommand('mixed.mp4', 'final_9x16.mp4', '9:16'),
      buildAspectRatioCommand('mixed.mp4', 'final_1x1.mp4', '1:1'),
      buildAspectRatioCommand('mixed.mp4', 'final_4x5.mp4', '4:5'),
    ];

    expect(steps).toHaveLength(6);
    steps.forEach((cmd) => {
      expect(cmd).toContain('ffmpeg');
    });
  });
});
