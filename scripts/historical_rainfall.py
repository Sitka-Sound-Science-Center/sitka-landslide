#!/usr/bin/env python3

import argparse
import os
import shutil
import subprocess


DEFAULT_ARCHIVE_DIR = os.path.join("frontend", "data", "archive")
RAINFALL_JSON_PATH = os.path.join("frontend", "data", "rainfall.json")
FILENAME_TEMPLATE = "rainfall-{}.json"
S3_ARCHIVE_FOLDER_URI = "s3://sitkaproduction-archive/rainfall/"


def ts_to_filename(ts):
    return FILENAME_TEMPLATE.format(ts)


def filename_to_ts(filename):
    """Get just the YYYY-MM-DDTHH:MM-ZZ:ZZ portion of the filename"""
    if not filename.startswith("rainfall-"):
        raise Exception(f"Invalid filename for archived rainfall file: {filename}")
    return filename[9:31]


def load_file(path):
    shutil.copy(path, RAINFALL_JSON_PATH)


def build_files_dict(archive_dir):
    """Return a {year: [timestamps]} dictionary by listing and parsing an archive directory"""
    return {
        year: sorted(filename_to_ts(f) for f in os.listdir(os.path.join(archive_dir, year)))
        for year in sorted(os.listdir(archive_dir))
        # filter out any directory that doesn't look like a year
        if year.startswith("20")
    }


def timestamp_to_index(files, ts):
    timestamp = filename_to_ts(ts) if ts.startswith("rainfall-") else ts
    year = timestamp[:4]
    try:
        return (year, files[year].index(timestamp))
    except LookupError:
        raise LookupError(f"Timestamp '{timestamp}' not found in file list.")


def sync_from_s3(dir):
    print(f"Syncing archive from S3 to {dir}...")
    command = ["aws", "s3", "sync", "--dryrun", S3_ARCHIVE_FOLDER_URI, dir]
    try:
        output = subprocess.check_output(command, stderr=subprocess.STDOUT, universal_newlines=True)
    except subprocess.CalledProcessError as e:
        print(f"Error fetching from S3: {e.output}")
        print("Make sure you have the 'aws' CLI installed, and set either AWS_PROFILE")
        print("or AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.")
        exit()
    output_lines = [line for line in output.split("\n") if line]
    if len(output_lines) > 10:
        print(f"...{len(output_lines) - 10} lines of output skipped...")
    print("\n".join(output_lines[-10:]))
    print("Finished fetching from S3.")


def parse_args():
    parser = argparse.ArgumentParser(description="Sitka Landslide historical rainfall switcher")

    parser.add_argument(
        "-d",
        "--dir",
        type=str,
        default=DEFAULT_ARCHIVE_DIR,
        help=f"Directory to find rainfall.json files in (default: {DEFAULT_ARCHIVE_DIR})",
    )
    parser.add_argument(
        "--fetch", action="store_true", help="Download rainfall.json archive from S3"
    )
    parser.add_argument(
        "timestamp",
        type=str,
        nargs="?",
        help="Timestamp to load (optional. defaults to most recent)",
    )

    return parser.parse_args()


def main():
    args = parse_args()

    if args.fetch:
        sync_from_s3(args.dir)

    # Make a dictionary of all the filenames, keyed by year directory
    files = build_files_dict(args.dir)

    # A helper function using the local 'args.dir' and 'files'
    def load_index(yr, idx):
        ts = files[yr][idx]
        print(f"Loading {ts} (index {idx}/{len(files[year]) - 1} in {year})")
        load_file(os.path.join(args.dir, year, ts_to_filename(ts)))

    if args.timestamp:
        try:
            (year, index) = timestamp_to_index(files, args.timestamp)
        except LookupError as e:
            print(e)
            exit()
    else:
        # If none given, pick a file to start with (the most recent, for lack of a better answer)
        year = list(files.keys())[-1]
        index = len(files[year]) - 1

    load_index(year, index)

    def cmd_reference():
        print(" Command options:")
        print("   n        load the next file")
        print("   p        load the previous file")
        print("   j <num>  jump <num> steps (positive for later, negative for earlier)")
        print("   i <idx>  go to the given index within the current year's files")
        print("   l <ts>   load a specific timestamp <ts>")
        print("   x or q   exit")

    while True:
        cmd = input("What next? ")
        try:
            if cmd in ("x", "q", "exit", "quit"):
                break
            elif cmd == "n":
                load_index(year, index + 1)
                index += 1
            elif cmd == "p":
                load_index(year, index - 1)
                index -= 1
            elif cmd.startswith("j "):
                jump = int(cmd.split(" ")[1])
                load_index(year, index + jump)
                index += jump
            elif cmd.startswith("i "):
                target_idx = int(cmd.split(" ")[1])
                load_index(year, target_idx)
                index = target_idx
            elif cmd.startswith("l "):
                ts = cmd.split(" ")[1]
                (year, index) = timestamp_to_index(files, ts)
                load_index(year, index)
            else:
                cmd_reference()
        except (ValueError, IndexError, LookupError) as e:
            print(f"Error: {e}")


main()
