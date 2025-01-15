# Viewing and Querying Archived Data

## Introduction

The way the site is constructed, all of the information that changes over time—the recent rainfally observations and current forecasts—are packaged into a single file, called `rainfall.json`. The process that publishes the site first queries the APIs and constructs a new `rainfall.json` file, then it provides that to the build process that writes out a new version of the static site with that information embedded.

Beginning in [September 2024](https://github.com/azavea/sitka-landslide/pull/90), the build process also, once it's finished building and publishing the new version of the site, writes a copy of that `rainfall.json` file to an archive bucket on S3.  This provides a historical record of all the forecasts and observed conditions, including their risk ratings based on the model, that have been displayed on the site.

Having this archive makes it possible to analyze and answer some questions about past conditions and how the site handled them as they happened.

## The archive

The files are stored in the `sitkaproduction-archive` bucket.  Each file gets written as `rainfall-YYYY-MM-DDThh:mm:ss-ZZ:00.json`, i.e. they're uniquely identified by timestamp (in the Sitka local time zone), but they're also grouped into folders by year and month to make them easier to navigate.

## Viewing the site at a particular timestamp

Because all the time-dependent information that goes into building the site is contained in the one `rainfall.json` file, it's easy to see what the site would have looked like at a particular moment in time by running the local-development server and providing it with the `rainfall.json` file from that moment.  There's a utility script to facilitate loading the available archived files and navigating between them: `scripts/historical_rainfall.py`.

#### Prerequisites

- Python 3 (any non-ancient version should do)
- The [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) (any version is fine here, too)
- Credentials for the AWS CLI. There are multiple ways to configure credentials, as documented [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html).  Pick one you've used before or that seems reasonable, and export the necessary values to environment variables.  You'll know it's working if you can run `aws s3 ls` and it produces a list of S3 buckets rather than an error.

#### Using the script

1. Follow the instructions in [the main README](https://github.com/azavea/sitka-landslide/tree/develop?tab=readme-ov-file#development) for setting up and starting a local development server.
2. In a different terminal, run `./scripts/historical_rainfall.py --fetch` (The "fetch" option causes it to download the rainfall archive, since the script is designed to work with local files.  The first time you run it, it will take a while. On subsequent runs, you can leave it off if you're looking at older files and don't need the latest ones.)
3. Load the local development site, http://localhost:3008/.  By default the script will load the most recent `rainfall.json` file, then prompt for a command to navigate between files. Use the commands offerred to move around between files or jump to a specific one.
  - The development site should update to show the new file. If it seems to have missed the update, just reload the page.
  - The URLs of the detail views include the timestamp, so if you're looking at a detail view and move to a file that's far enough before or after the time shown that the detail view isn't included, it will show "An error 404 occurred on server". Just click the link in the header to go back to http://localhost:3008/.

Note: The files in the archive are divided by year and month, but (to reduce the complexity of moving across month boundaries) the script indexes them only by year. It doesn't support moving between years with "previous" and "next", but you can switch years either with the `y` command or by loading a specific timestamp.

#### Finding periods of elevated risk

The script only facilitates showing and browsing through the available files, not any kind of searching. But since it relies on a local copy of the files, you can do file-based searches for some scenarios.
For example:
```
grep -rl '"riskLevel": 1' frontend/data/archive/
```
That will produce a list of all files that contain at least one time period with "Medium" risk. Then you can copy the timestamps for the identified files into the `historical_rainfall.py` script (using the `t` command) to view them.


## Querying archived data with Athena

Athena is an AWS product that enables SQL-style querying of various data stores, including files on S3. By loading the archived rainfall files into an Athena table, it's possible to run more powerful queries than can be done with simple text searching, e.g. filtering for files with elevated risk in more than one time window.

The Athena console has an [interactive query editor](https://us-west-2.console.aws.amazon.com/athena/home?region=us-west-2#/query-editor/) that saves queries and query results, so there's already a proof-of-concept table and a few sample queries configured there.

### Sample queries

As of this writing, these are the sample queries defined in the query editor, reproduced here for reference.

Table creation:
```
CREATE EXTERNAL TABLE `rainfall`.`rainfall_archive` (
  lastUpdated STRING,
  weatherAdvisory STRUCT<
    active: BOOLEAN
  >,
  `current` STRUCT<
    `timestamp`: STRING,
    precip: FLOAT,
    prevPrecip: FLOAT,
    riskProb: FLOAT,
    riskLevel: INT,
    riskIsElevatedFromPreviousPrecip: BOOLEAN
  >,
  twentyFourHours STRUCT<
    riskLevel: INT,
    hours: ARRAY<STRUCT<
        `timestamp`: STRING,
        precip: FLOAT,
        dateTimeDetails: STRUCT<
          label: STRING
        >,
        riskProb: FLOAT,
        riskLevel: INT,
        riskIsElevatedFromPreviousPrecip: BOOLEAN
      >
    >
  >,
  threeDays STRUCT<
    days: ARRAY<STRUCT<
        dayNumber: INT,
        riskLevel: INT,
        lastTimestamp: STRING
      >
    >,
    hours: ARRAY<STRUCT<
        `timestamp`: STRING,
        precip: FLOAT,
        dateTimeDetails: STRUCT<
          label: STRING
        >,
        riskProb: FLOAT,
        riskLevel: INT,
        riskIsElevatedFromPreviousPrecip: BOOLEAN,
        dayNumber: INT
      >
    >
  >
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
  'ignore.malformed.json' = 'FALSE',
  'dots.in.keys' = 'FALSE',
  'case.insensitive' = 'TRUE',
  'mapping' = 'TRUE'
)
STORED AS INPUTFORMAT 'org.apache.hadoop.mapred.TextInputFormat' OUTPUTFORMAT 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
LOCATION 's3://sitkaproduction-archive/athena/rainfall_compact/'
TBLPROPERTIES ('classification' = 'json');
```

A query on the current risk probability rating:
```
SELECT lastupdated,
	current.riskLevel,
	current.riskProb,
	current.precip,
	current.riskIsElevatedFromPreviousPrecip,
	twentyfourhours.riskLevel,
	threedays.days [ 1 ].riskLevel,
	threedays.days [ 2 ].riskLevel,
	threedays.days [ 3 ].riskLevel
FROM rainfall_archive
WHERE current.riskProb >.35;
```

A query for elevated risk probability ratings in any of the current, next 24 hours, or next 3 days:
```
SELECT from_iso8601_timestamp(lastupdated) as updated_timestamp,
	MAX(current.riskLevel) as riskLevel,
	MAX(current.riskProb) as riskProb,
	MAX(current.precip) as precip,
	MAX(current.riskIsElevatedFromPreviousPrecip) as riskIsElevatedFromPreviousPrecip,
	MAX(twentyfourhours.riskLevel) as riskLevel,
	MAX(threedays.days [ 1 ].riskLevel) as day1_risklevel,
	MAX(threedays.days [ 2 ].riskLevel) as day2_risklevel,
	MAX(threedays.days [ 3 ].riskLevel) as day3_risklevel,
	MAX(tfh_hrs.precip) as max_24_precip,
	MAX(tfh_hrs.riskProb) as max_24_risk,
	MAX(td_hrs.precip) as max_3day_precip,
	MAX(td_hrs.riskProb) as max_3day_risk
FROM rainfall_archive, UNNEST(twentyfourhours.hours) as t(tfh_hrs), UNNEST(threedays.hours) as t(td_hrs)
WHERE current.riskProb >.36 OR tfh_hrs.riskProb > .36 OR td_hrs.riskProb > .36
GROUP BY lastupdated;
```

### Challenges and next steps

#### Table and query complexity
This is a very preliminary setup, and there are some challenges:
- The data is fairly nested, with observations and predictions separated into current, one-day, and three-day sections. This means that most queries require aggregation and are somewhat complex to compose.
- The timestamp fields are not in a format that the table format definition could interpret, so they're stored as strings and have to be converted into actual timestamps by a function within the query (this may be solvable with further investigation into the table creation options).

#### Archive file format
Also, the archived files as produced by the build process are formatted, and that's how they're currently saved in the archive.  This isn't essential but can be useful for debugging and doesn't do any harm.  However, since Athena supports reading multiple records from a file, it requires JSON inputs to have all the data for a given record on one line.  Currently the table is reading from a copy of the archive, converted and uploaded by hand, using the following commands:
```
# Download the archive
./scripts/historical_rainfall.py --fetch

# switch to the directory with the files
cd frontend/data/archive/

# Convert each one to "compact" using the `jq` utility
for JSON_FILE in $(find 2025* -name "*.json"); do
    echo $JSON_FILE
    mkdir -p  compact/$(dirname $JSON_FILE)
    jq -c . "${JSON_FILE}" > "compact/${JSON_FILE}"
done

# Upload them to S3
aws s3 sync . "s3://sitkaproduction-archive/athena/rainfall_compact/"
```

If Athena proves valuable and will be used regularly, it would make sense to revise the logic that publishes the archive files to write them in single-line format and avoid the need for this reformatting.  In that case the table definition would need to change to point at the archive itself rather than the reformatted copy.
