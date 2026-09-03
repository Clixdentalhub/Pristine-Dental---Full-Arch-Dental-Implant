# Campaign image toolkit

Two standalone scripts for getting client photos into a funnel page.
Drop them at the root of any campaign folder. Nothing here is specific
to a client, an industry, or a page builder.

Full guide: https://claude.ai/code/artifact/86181405-df80-450f-9b31-68f1e518d2ce

---

## Setup (once per machine)

    npm install sharp     # for prep-images.mjs
    # python3 is already on macOS and Linux

## The two commands

    # 1. shrink, crop and compress the client's photos
    node prep-images.mjs <source-folder> ./assets/img --width 1600 --4x3

    # 2. build every local image into the HTML as one self-contained file
    python3 embed-images.py index.html final.html

Then paste `final.html` into the page builder. That is the whole job.

## prep-images.mjs

    node prep-images.mjs <in-dir> <out-dir> [--width 1600] [--square|--4x3|--4x5]

| Flag       | Shape | Use for                     |
|------------|-------|-----------------------------|
| `--square` | 1:1   | profile portraits           |
| `--4x3`    | 4:3   | gallery tiles, card images  |
| `--4x5`    | 4:5   | tall portraits              |
| *(none)*   | as-is | just resize                 |

Cropping uses smart attention detection, so faces survive it.
EXIF rotation is honoured — no sideways phone photos.

## embed-images.py

    python3 embed-images.py <input.html> <output.html>

Inlines every local `src`, `href`, `poster` and CSS `url()` image as a
data URI. Anything already on `http(s)://` is left alone.

Read the output. `external : 0 image(s) remaining` means nothing is
still pointing at a file the builder cannot reach. Above zero, it names
the files — those are your broken images.

## Two things it will not do

**Video.** A browser cannot stream from embedded data. Upload video to
the media library and reference its URL. Pull a still from the video for
a poster image.

**Fix a missing file.** If a path in the HTML has no file behind it, the
script says so and leaves it alone rather than silently deleting it.
Usually a capital letter in the extension.

## Size budget

| Stage                              | Weight   |
|------------------------------------|----------|
| Raw photos off a camera            | 3–8 MB each |
| Prepped at 1600px wide             | 60–150 KB each |
| Embedded page, ~15 images          | ~1.9 MB  |
| Practical ceiling                  | 2–3 MB   |

Over the ceiling, cut the number of photos before cutting quality.
